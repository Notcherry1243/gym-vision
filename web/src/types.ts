// Mirrors shared/src/types.ts. Duplicated (not imported from the
// @gym-vision/shared workspace package) so this project has no monorepo
// cross-package dependency for Vercel to resolve during deploys.

export interface DetectedEquipment {
  id: string;
  label: string;
  confidence: number;
  sourcePhotoIndex: number;
  userConfirmed: boolean;
}

export type MuscleGroup =
  | "biceps"
  | "triceps"
  | "chest"
  | "back"
  | "shoulders"
  | "legs"
  | "glutes"
  | "core"
  | "full_body";

export type Intensity = "light" | "moderate" | "intense";

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  requiredEquipmentIds: string[];
  isBodyweightSubstitute: boolean;
  substitutedFor?: string;
  sets: number;
  reps: string;
  restSeconds: number;
  youtubeUrl: string;
  youtubeTitle?: string;
  source: "wger" | "local_fallback";
}

export interface WorkoutRoutine {
  id: string;
  createdAt: string;
  goal: MuscleGroup;
  intensity: Intensity;
  exercises: Exercise[];
  equipmentUsed: string[];
  detectedEquipmentSnapshot: DetectedEquipment[];
}

export interface VoiceCharacterScripts {
  start: string[];
  betweenSets: string[];
  restEncouragement: string[];
  end: string[];
}

export interface VoiceCharacter {
  id: string;
  displayName: string;
  description: string;
  avatarAsset?: string;
  ttsProvider: "google" | "elevenlabs";
  ttsVoiceId: string;
  scripts: VoiceCharacterScripts;
}

export type ScriptKey = keyof VoiceCharacterScripts;
