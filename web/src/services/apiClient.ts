import type { DetectedEquipment, Intensity, MuscleGroup, VoiceCharacter, WorkoutRoutine } from "../types";

export interface PhotoAsset {
  file: File;
  previewUrl: string;
}

export async function analyzePhotos(photos: PhotoAsset[]): Promise<DetectedEquipment[]> {
  const formData = new FormData();
  photos.forEach((photo) => formData.append("photos", photo.file));

  const response = await fetch("/api/analyze-photos", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze photos: ${response.status}`);
  }

  const data = (await response.json()) as { detectedEquipment: DetectedEquipment[] };
  return data.detectedEquipment;
}

export async function generateRoutine(
  detectedEquipment: DetectedEquipment[],
  goal: MuscleGroup,
  intensity: Intensity
): Promise<WorkoutRoutine> {
  const response = await fetch("/api/generate-routine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ detectedEquipment, goal, intensity }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate routine: ${response.status}`);
  }

  return (await response.json()) as WorkoutRoutine;
}

export async function fetchVoiceCharacters(): Promise<VoiceCharacter[]> {
  const response = await fetch("/api/voice-characters");
  if (!response.ok) {
    throw new Error(`Failed to fetch voice characters: ${response.status}`);
  }
  const data = (await response.json()) as { voiceCharacters: VoiceCharacter[] };
  return data.voiceCharacters;
}

export function ttsUrl(characterId: string, scriptKey: string, variantIndex?: number): string {
  const params = new URLSearchParams({ characterId, scriptKey });
  if (variantIndex !== undefined) params.set("variantIndex", String(variantIndex));
  return `/api/tts?${params.toString()}`;
}
