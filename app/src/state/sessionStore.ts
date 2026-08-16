import { create } from "zustand";
import type { DetectedEquipment, Intensity, MuscleGroup, VoiceCharacter, WorkoutRoutine } from "@gym-vision/shared";
import type { PhotoAsset } from "../services/apiClient";

interface SessionState {
  photos: PhotoAsset[];
  detectedEquipment: DetectedEquipment[];
  goal: MuscleGroup | null;
  intensity: Intensity;
  routine: WorkoutRoutine | null;
  selectedVoiceCharacter: VoiceCharacter | null;
  currentExerciseIndex: number;
  currentSetIndex: number;

  setPhotos: (photos: PhotoAsset[]) => void;
  setDetectedEquipment: (equipment: DetectedEquipment[]) => void;
  toggleEquipmentConfirmed: (id: string) => void;
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
  goal: null,
  intensity: "moderate",
  routine: null,
  selectedVoiceCharacter: null,
  currentExerciseIndex: 0,
  currentSetIndex: 0,

  setPhotos: (photos) => set({ photos }),
  setDetectedEquipment: (equipment) => set({ detectedEquipment: equipment }),
  toggleEquipmentConfirmed: (id) =>
    set((state) => ({
      detectedEquipment: state.detectedEquipment.map((e) =>
        e.id === id ? { ...e, userConfirmed: !e.userConfirmed } : e
      ),
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
        const nextExercise = state.currentExerciseIndex + 1;
        return { currentExerciseIndex: nextExercise, currentSetIndex: 0 };
      }
      return { currentSetIndex: nextSet };
    }),
  resetSession: () =>
    set({
      photos: [],
      detectedEquipment: [],
      goal: null,
      intensity: "moderate",
      routine: null,
      selectedVoiceCharacter: null,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
    }),
}));
