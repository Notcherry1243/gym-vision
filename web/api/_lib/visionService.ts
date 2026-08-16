import type { DetectedEquipment } from "./types.js";
import { env } from "./env.js";
import { normalizeEquipmentLabel } from "./data/equipmentAliasMap.js";
import { analyzePhotosViaGemini } from "./geminiVisionService.js";

const CONFIDENCE_THRESHOLD = 0.15;

interface RoboflowPrediction {
  class: string;
  confidence: number;
}

interface RoboflowResponse {
  predictions: RoboflowPrediction[];
  image?: { width: number; height: number };
}

async function detectFromPhoto(photoBuffer: Buffer, photoIndex: number): Promise<DetectedEquipment[]> {
  const url = `https://serverless.roboflow.com/${env.roboflowModelId}?api_key=${env.roboflowApiKey}`;
  const base64Image = photoBuffer.toString("base64");

  console.log(
    `[visionService] photo ${photoIndex}: buffer bytes=${photoBuffer.length} base64 chars=${base64Image.length}`
  );

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: base64Image,
  });

  if (!response.ok) {
    throw new Error(`Roboflow inference failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as RoboflowResponse;

  // Temporary diagnostic logging: helps confirm whether the model is
  // detecting anything at all (even below threshold) vs. seeing nothing,
  // and whether Roboflow actually received a real (non-empty) image.
  console.log(
    `[analyze-photos] photo ${photoIndex}: image=${JSON.stringify(data.image)} ${data.predictions.length} raw predictions`,
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

  // Ensemble: union of both detectors, deduped by canonical equipment id,
  // keeping whichever detection had the higher confidence when both agree.
  // This catches equipment either detector misses on its own.
  const merged = new Map<string, DetectedEquipment>();
  for (const detection of [...roboflowResults, ...geminiResults]) {
    const existing = merged.get(detection.id);
    if (!existing || detection.confidence > existing.confidence) {
      merged.set(detection.id, detection);
    }
  }

  return Array.from(merged.values());
}
