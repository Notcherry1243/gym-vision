import { create } from "zustand";
import type { DetectedEquipment, Intensity, MuscleGroup, VoiceCharacter, WorkoutRoutine } from "../types";
import type { PhotoAsset } from "../services/apiClient";

interface SessionState {
  photos: PhotoAsset[];
  detectedEquipment: DetectedEquipment[];
  hasAnalyzed: boolean;
  goal: MuscleGroup | null;
  intensity: Intensity;
  routine: WorkoutRoutine | null;
  selectedVoiceCharacter: VoiceCharacter | null;
  currentExerciseIndex: number;
  currentSetIndex: number;

  setPhotos: (photos: PhotoAsset[]) => void;
  setDetectedEquipment: (equipment: DetectedEquipment[]) => void;
  markAnalyzed: () => void;
  toggleEquipmentConfirmed: (id: string) => void;
  addManualEquipment: (id: string, label: string) => void;
  removeEquipment: (id: string) => void;
  setGoal: (goal: MuscleGroup) => void;
  setIntensity: (intensity: Intensity) => void;
  setRoutine: (routine: WorkoutRoutine) => void;
  setSelectedVoiceCharacter: (character: VoiceCharacter) => void;
  advanceSet: () => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  photos: [],
  detectedEquipment: [],
  hasAnalyzed: false,
  goal: null,
  intensity: "moderate",
  routine: null,
  selectedVoiceCharacter: null,
  currentExerciseIndex: 0,
  currentSetIndex: 0,

  setPhotos: (photos) => set({ photos }),
  setDetectedEquipment: (equipment) => set({ detectedEquipment: equipment }),
  markAnalyzed: () => set({ hasAnalyzed: true }),
  toggleEquipmentConfirmed: (id) =>
    set((state) => ({
      detectedEquipment: state.detectedEquipment.map((e) =>
        e.id === id ? { ...e, userConfirmed: !e.userConfirmed } : e
      ),
    })),
  addManualEquipment: (id, label) =>
    set((state) => {
      if (state.detectedEquipment.some((e) => e.id === id)) return state;
      return {
        detectedEquipment: [
          ...state.detectedEquipment,
          { id, label, confidence: 1, sourcePhotoIndex: -1, userConfirmed: true },
        ],
      };
    }),
  removeEquipment: (id) =>
    set((state) => ({
      detectedEquipment: state.detectedEquipment.filter((e) => e.id !== id),
    })),
  setGoal: (goal) => set({ goal }),
  setIntensity: (intensity) => set({ intensity }),
  setRoutine: (routine) => set({ routine, currentExerciseIndex: 0, currentSetIndex: 0 }),
  setSelectedVoiceCharacter: (character) => set({ selectedVoiceCharacter: character }),
  advanceSet: () =>
    set((state) => {
      if (!state.routine) return state;
      const exercise = state.routine.exercises[state.currentExerciseIndex];
      if (!exercise) return state;
      const nextSet = state.currentSetIndex + 1;
      if (nextSet >= exercise.sets) {
        return { currentExerciseIndex: state.currentExerciseIndex + 1, currentSetIndex: 0 };
      }
      return { currentSetIndex: nextSet };
    }),
  resetSession: () =>
    set({
      photos: [],
      detectedEquipment: [],
      hasAnalyzed: false,
      goal: null,
      intensity: "moderate",
      routine: null,
      selectedVoiceCharacter: null,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
    }),
}));
