import type { Exercise } from "../types";

// Picks which body keypoints to average for rep counting, based on which
// body part actually moves for a given exercise. Wrist tracking is wrong
// for push-ups (hands stay planted on the ground) but right for curls;
// torso/nose tracking is the reverse.
export function getTrackingKeypointNames(exercise: Exercise): string[] {
  const name = exercise.name.toLowerCase();

  if (/push.?up|press|dip/.test(name) || exercise.muscleGroups.includes("chest")) {
    return ["nose"];
  }
  if (/squat|lunge/.test(name) || exercise.muscleGroups.some((m) => m === "legs" || m === "glutes")) {
    return ["left_hip", "right_hip"];
  }
  if (/pull.?up|row/.test(name) || exercise.muscleGroups.includes("back")) {
    return ["nose"];
  }
  // Default: arm-driven movements (curls, raises, shoulder press with dumbbells).
  return ["left_wrist", "right_wrist"];
}
