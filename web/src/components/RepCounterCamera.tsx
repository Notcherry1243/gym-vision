import { useEffect, useRef, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs-core";
import type { Exercise } from "../types";
import { getTrackingKeypointNames } from "../utils/trackingKeypoints";

interface Props {
  exercise: Exercise;
  targetReps: number;
  onRepCounted: (count: number) => void;
  onTargetReached: () => void;
}

// Tracks the normalized y-position of exercise-appropriate keypoints and
// counts one rep per full up/down cycle, using a hysteresis band based on
// the recent range of motion. This is intentionally simple motion counting,
// not form tracking.
const HISTORY_SIZE = 30;
const MIN_RANGE = 0.06; // fraction of frame height; below this, treat as noise
const MIN_CONFIDENCE = 0.4;
const SMOOTHING_ALPHA = 0.35;
const MIN_MS_BETWEEN_REPS = 500;
const COUNTDOWN_SECONDS = 3;

export function RepCounterCamera({ exercise, targetReps, onRepCounted, onTargetReached }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [repCount, setRepCount] = useState(0);
  const [status, setStatus] = useState<"loading" | "countdown" | "tracking" | "error">("loading");
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const repCountRef = useRef(0);
  const targetReachedRef = useRef(false);
  const historyRef = useRef<number[]>([]);
  const smoothedYRef = useRef<number | null>(null);
  const cycleStateRef = useRef<"extended" | "curled">("extended");
  const lastRepAtRef = useRef(0);
  const activeRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackedKeypoints = getTrackingKeypointNames(exercise);

  useEffect(() => {
    let cancelled = false;
    let detector: poseDetection.PoseDetector | null = null;

    async function setup() {
      try {
        await tf.ready();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        });

        if (cancelled) return;
        setStatus("countdown");
        loop(detector, video);

        let remaining = COUNTDOWN_SECONDS;
        const countdownInterval = setInterval(() => {
          remaining -= 1;
          if (cancelled) {
            clearInterval(countdownInterval);
            return;
          }
          if (remaining <= 0) {
            clearInterval(countdownInterval);
            // Reset tracking state so pre-countdown jitter isn't carried in.
            historyRef.current = [];
            smoothedYRef.current = null;
            cycleStateRef.current = "extended";
            activeRef.current = true;
            setStatus("tracking");
          } else {
            setCountdown(remaining);
          }
        }, 1000);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Could not start camera tracking");
      }
    }

    function loop(activeDetector: poseDetection.PoseDetector, video: HTMLVideoElement) {
      async function frame() {
        if (cancelled) return;
        const poses = await activeDetector.estimatePoses(video);
        const pose = poses[0];

        if (pose) {
          const candidates = trackedKeypoints
            .map((name) => pose.keypoints.find((k) => k.name === name))
            .filter((k): k is poseDetection.Keypoint => !!k && (k.score ?? 0) > MIN_CONFIDENCE);

          drawOverlay(pose.keypoints, video);

          if (candidates.length > 0) {
            const avgY = candidates.reduce((sum, k) => sum + k.y, 0) / candidates.length;
            const normalizedY = avgY / video.videoHeight;
            processSample(normalizedY);
          }
        }

        rafRef.current = requestAnimationFrame(frame);
      }
      frame();
    }

    function processSample(rawY: number) {
      if (!activeRef.current) return;
      const smoothed =
        smoothedYRef.current === null
          ? rawY
          : smoothedYRef.current + SMOOTHING_ALPHA * (rawY - smoothedYRef.current);
      smoothedYRef.current = smoothed;

      const history = historyRef.current;
      history.push(smoothed);
      if (history.length > HISTORY_SIZE) history.shift();
      if (history.length < HISTORY_SIZE / 2) return;

      const min = Math.min(...history);
      const max = Math.max(...history);
      const range = max - min;
      if (range < MIN_RANGE) return; // not enough motion to be meaningful yet

      const highThreshold = min + range * 0.35;
      const lowThreshold = min + range * 0.65;

      if (cycleStateRef.current === "extended" && smoothed < highThreshold) {
        cycleStateRef.current = "curled";
      } else if (cycleStateRef.current === "curled" && smoothed > lowThreshold) {
        cycleStateRef.current = "extended";
        const now = performance.now();
        if (now - lastRepAtRef.current < MIN_MS_BETWEEN_REPS) return;
        lastRepAtRef.current = now;

        repCountRef.current += 1;
        setRepCount(repCountRef.current);
        onRepCounted(repCountRef.current);
        if (repCountRef.current >= targetReps && !targetReachedRef.current) {
          targetReachedRef.current = true;
          onTargetReached();
        }
      }
    }

    function drawOverlay(keypoints: poseDetection.Keypoint[], video: HTMLVideoElement) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const kp of keypoints) {
        if ((kp.score ?? 0) < 0.3) continue;
        const isTracked = trackedKeypoints.includes(kp.name ?? "");
        ctx.fillStyle = isTracked ? "#22c55e" : "#9ca3af";
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, isTracked ? 7 : 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    setup();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      detector?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetReps, onRepCounted, onTargetReached]);

  return (
    <div className="rep-camera-container">
      <div className="rep-camera-video-wrap">
        <video ref={videoRef} className="rep-camera-video" playsInline muted />
        <canvas ref={canvasRef} className="rep-camera-overlay" />
      </div>
      {status === "loading" && <p className="subtitle">Starting camera and loading tracker...</p>}
      {status === "error" && <p className="error-text">{errorMessage}</p>}
      {status === "countdown" && <div className="rep-camera-countdown">Get ready... {countdown}</div>}
      {status === "tracking" && (
        <div className="rep-camera-count">
          {repCount} / {targetReps} reps
        </div>
      )}
    </div>
  );
}
