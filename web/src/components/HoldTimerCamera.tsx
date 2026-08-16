import { useEffect, useRef, useState } from "react";

interface Props {
  seconds: number;
  onComplete: () => void;
}

const COUNTDOWN_SECONDS = 3;

// Shows a live camera preview alongside a countdown for timed holds
// (planks, wall sits, wall handstand holds, etc.) where a rep count
// doesn't apply — this is just a self-view + timer, no pose tracking.
export function HoldTimerCamera({ seconds, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [remaining, setRemaining] = useState(seconds);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [status, setStatus] = useState<"loading" | "countdown" | "tracking" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
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
        if (cancelled) return;
        setStatus("countdown");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Could not start camera");
      }
    }

    setup();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (status !== "countdown") return;
    let remainingCountdown = COUNTDOWN_SECONDS;
    setCountdown(remainingCountdown);
    const interval = setInterval(() => {
      remainingCountdown -= 1;
      if (remainingCountdown <= 0) {
        clearInterval(interval);
        setStatus("tracking");
      } else {
        setCountdown(remainingCountdown);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status !== "tracking") return;
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onCompleteRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, seconds]);

  return (
    <div className="rep-camera-container">
      <div className="rep-camera-video-wrap">
        <video ref={videoRef} className="rep-camera-video" playsInline muted />
      </div>
      {status === "loading" && <p className="subtitle">Starting camera...</p>}
      {status === "error" && <p className="error-text">{errorMessage}</p>}
      {status === "countdown" && <div className="rep-camera-countdown">Get ready... {countdown}</div>}
      {status === "tracking" && <div className="timer">{remaining}s</div>}
    </div>
  );
}
