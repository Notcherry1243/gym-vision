import type { DetectedEquipment } from "@gym-vision/shared";
import { env } from "../config/env";
import { normalizeEquipmentLabel } from "../data/equipmentAliasMap";
import { analyzePhotosViaGemini } from "./geminiVisionService";

const CONFIDENCE_THRESHOLD = 0.15;

interface RoboflowPrediction {
  class: string;
  confidence: number;
}

interface RoboflowResponse {
  predictions: RoboflowPrediction[];
}

async function detectFromPhoto(photoBuffer: Buffer, photoIndex: number): Promise<DetectedEquipment[]> {
  const url = `https://serverless.roboflow.com/${env.roboflowModelId}?api_key=${env.roboflowApiKey}`;
  const base64Image = photoBuffer.toString("base64");

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: base64Image,
  });

  if (!response.ok) {
    throw new Error(`Roboflow inference failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as RoboflowResponse;

  console.log(
    `[analyze-photos] photo ${photoIndex}: ${data.predictions.length} raw predictions`,
    data.predictions.map((p) => `${p.class}(${p.confidence.toFixed(2)})`).join(", ") || "(none)"
  );

  return data.predictions
    .filter((p) => p.confidence >= CONFIDENCE_THRESHOLD)
    .map((p) => ({
      id: normalizeEquipmentLabel(p.class),
      label: p.class,
      confidence: p.confidence,
      sourcePhotoIndex: photoIndex,
      userConfirmed: false,
    }));
}

export async function analyzePhotos(photos: Buffer[]): Promise<DetectedEquipment[]> {
  const roboflowConfigured = Boolean(env.roboflowApiKey && env.roboflowModelId);

  const [roboflowResults, geminiResults] = await Promise.all([
    roboflowConfigured
      ? Promise.all(photos.map((photo, index) => detectFromPhoto(photo, index))).then((r) => r.flat())
      : Promise.resolve([]),
    analyzePhotosViaGemini(photos),
  ]);

  const merged = new Map<string, DetectedEquipment>();
  for (const detection of [...roboflowResults, ...geminiResults]) {
    const existing = merged.get(detection.id);
    if (!existing || detection.confidence > existing.confidence) {
      merged.set(detection.id, detection);
    }
  }

  return Array.from(merged.values());
}
