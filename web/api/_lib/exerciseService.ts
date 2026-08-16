import type { DetectedEquipment, Exercise, Intensity, MuscleGroup, WorkoutRoutine } from "./types.js";
import { bodyweightFallbacks } from "./data/bodyweightFallbacks.js";
import { resolveVideoForExercise } from "./youtubeService.js";

type ExerciseBase = Omit<Exercise, "id" | "youtubeUrl">;

// Small local exercise catalog per muscle group. A future iteration can
// replace this lookup with a real wger.de catalog query while keeping the
// same shape, so the rest of the pipeline doesn't change. Multiple entries
// per group so routines don't repeat the same exercise for higher
// intensities.
const EQUIPMENT_EXERCISES: Record<MuscleGroup, ExerciseBase[]> = {
  biceps: [
    {
      name: "Dumbbell Bicep Curl",
      muscleGroups: ["biceps"],
      requiredEquipmentIds: ["dumbbell"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-12",
      restSeconds: 45,
      source: "wger",
    },
    {
      name: "Hammer Curl",
      muscleGroups: ["biceps"],
      requiredEquipmentIds: ["dumbbell"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-12",
      restSeconds: 45,
      source: "wger",
    },
    {
      name: "Cable Bicep Curl",
      muscleGroups: ["biceps"],
      requiredEquipmentIds: ["cable_machine"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-15",
      restSeconds: 45,
      source: "wger",
    },
    {
      name: "Arm Curl Machine",
      muscleGroups: ["biceps"],
      requiredEquipmentIds: ["arm_curl_machine"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-15",
      restSeconds: 45,
      source: "wger",
    },
    {
      name: "Preacher Curl",
      muscleGroups: ["biceps"],
      requiredEquipmentIds: ["preacher_curl"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-12",
      restSeconds: 45,
      source: "wger",
    },
  ],
  triceps: [
    {
      name: "Bench Dip",
      muscleGroups: ["triceps"],
      requiredEquipmentIds: ["bench"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-12",
      restSeconds: 45,
      source: "wger",
    },
    {
      name: "Dumbbell Overhead Tricep Extension",
      muscleGroups: ["triceps"],
      requiredEquipmentIds: ["dumbbell"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-12",
      restSeconds: 45,
      source: "wger",
    },
    {
      name: "Cable Tricep Pushdown",
      muscleGroups: ["triceps"],
      requiredEquipmentIds: ["cable_machine"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-15",
      restSeconds: 45,
      source: "wger",
    },
    {
      name: "Seated Dip Machine",
      muscleGroups: ["triceps"],
      requiredEquipmentIds: ["seated_dip_machine"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-12",
      restSeconds: 45,
      source: "wger",
    },
  ],
  chest: [
    {
      name: "Dumbbell Bench Press",
      muscleGroups: ["chest"],
      requiredEquipmentIds: ["dumbbell", "bench"],
      isBodyweightSubstitute: false,
      sets: 4,
      reps: "8-10",
      restSeconds: 60,
      source: "wger",
    },
    {
      name: "Dumbbell Fly",
      muscleGroups: ["chest"],
      requiredEquipmentIds: ["dumbbell", "bench"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-12",
      restSeconds: 60,
      source: "wger",
    },
    {
      name: "Barbell Bench Press",
      muscleGroups: ["chest"],
      requiredEquipmentIds: ["barbell", "bench"],
      isBodyweightSubstitute: false,
      sets: 4,
      reps: "6-8",
      restSeconds: 90,
      source: "wger",
    },
    {
      name: "Chest Press Machine",
      muscleGroups: ["chest"],
      requiredEquipmentIds: ["chest_press_machine"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "8-10",
      restSeconds: 60,
      source: "wger",
    },
    {
      name: "Machine Chest Fly",
      muscleGroups: ["chest"],
      requiredEquipmentIds: ["chest_fly_machine"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-12",
      restSeconds: 60,
      source: "wger",
    },
  ],
  back: [
    {
      name: "Pull-Up",
      muscleGroups: ["back"],
      requiredEquipmentIds: ["pull_up_bar"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "6-10",
      restSeconds: 60,
      source: "wger",
    },
    {
      name: "Lat Pulldown",
      muscleGroups: ["back"],
      requiredEquipmentIds: ["lat_pulldown"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-12",
      restSeconds: 60,
      source: "wger",
    },
    {
      name: "Dumbbell Bent-Over Row",
      muscleGroups: ["back"],
      requiredEquipmentIds: ["dumbbell"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-12",
      restSeconds: 60,
      source: "wger",
    },
    {
      name: "Seated Cable Row",
      muscleGroups: ["back"],
      requiredEquipmentIds: ["cable_machine"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-12",
      restSeconds: 60,
      source: "wger",
    },
    {
      name: "Back Extension",
      muscleGroups: ["back"],
      requiredEquipmentIds: ["back_extension_machine"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "12-15",
      restSeconds: 45,
      source: "wger",
    },
  ],
  shoulders: [
    {
      name: "Dumbbell Shoulder Press",
      muscleGroups: ["shoulders"],
      requiredEquipmentIds: ["dumbbell"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "8-12",
      restSeconds: 45,
      source: "wger",
    },
    {
      name: "Dumbbell Lateral Raise",
      muscleGroups: ["shoulders"],
      requiredEquipmentIds: ["dumbbell"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "12-15",
      restSeconds: 45,
      source: "wger",
    },
    {
      name: "Cable Face Pull",
      muscleGroups: ["shoulders"],
      requiredEquipmentIds: ["cable_machine"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "12-15",
      restSeconds: 45,
      source: "wger",
    },
    {
      name: "Shoulder Press Machine",
      muscleGroups: ["shoulders"],
      requiredEquipmentIds: ["shoulder_press_machine"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "8-12",
      restSeconds: 45,
      source: "wger",
    },
    {
      name: "Machine Lateral Raise",
      muscleGroups: ["shoulders"],
      requiredEquipmentIds: ["lateral_raises_machine"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "12-15",
      restSeconds: 45,
      source: "wger",
    },
  ],
  legs: [
    {
      name: "Barbell Squat",
      muscleGroups: ["legs"],
      requiredEquipmentIds: ["barbell", "squat_rack"],
      isBodyweightSubstitute: false,
      sets: 4,
      reps: "8-10",
      restSeconds: 90,
      source: "wger",
    },
    {
      name: "Leg Press",
      muscleGroups: ["legs"],
      requiredEquipmentIds: ["leg_press"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-12",
      restSeconds: 90,
      source: "wger",
    },
    {
      name: "Dumbbell Lunge",
      muscleGroups: ["legs"],
      requiredEquipmentIds: ["dumbbell"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-12 each side",
      restSeconds: 60,
      source: "wger",
    },
    {
      name: "Leg Extension",
      muscleGroups: ["legs"],
      requiredEquipmentIds: ["leg_extension"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "12-15",
      restSeconds: 60,
      source: "wger",
    },
    {
      name: "Leg Curl Machine",
      muscleGroups: ["legs"],
      requiredEquipmentIds: ["leg_curl_machine"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "12-15",
      restSeconds: 60,
      source: "wger",
    },
    {
      name: "Smith Machine Squat",
      muscleGroups: ["legs"],
      requiredEquipmentIds: ["smith_machine"],
      isBodyweightSubstitute: false,
      sets: 4,
      reps: "8-10",
      restSeconds: 90,
      source: "wger",
    },
    {
      name: "Hack Squat",
      muscleGroups: ["legs"],
      requiredEquipmentIds: ["hack_squat_machine"],
      isBodyweightSubstitute: false,
      sets: 4,
      reps: "8-10",
      restSeconds: 90,
      source: "wger",
    },
  ],
  glutes: [
    {
      name: "Dumbbell Romanian Deadlift",
      muscleGroups: ["glutes"],
      requiredEquipmentIds: ["dumbbell"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-12",
      restSeconds: 60,
      source: "wger",
    },
    {
      name: "Barbell Hip Thrust",
      muscleGroups: ["glutes"],
      requiredEquipmentIds: ["barbell", "bench"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-12",
      restSeconds: 60,
      source: "wger",
    },
    {
      name: "Cable Kickback",
      muscleGroups: ["glutes"],
      requiredEquipmentIds: ["cable_machine"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "12-15 each side",
      restSeconds: 45,
      source: "wger",
    },
    {
      name: "GHD Hip Extension",
      muscleGroups: ["glutes"],
      requiredEquipmentIds: ["ghd_machine"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "12-15",
      restSeconds: 45,
      source: "wger",
    },
  ],
  core: [
    {
      name: "Cable Woodchopper",
      muscleGroups: ["core"],
      requiredEquipmentIds: ["cable_machine"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "12-15",
      restSeconds: 45,
      source: "wger",
    },
    {
      name: "Medicine Ball Russian Twist",
      muscleGroups: ["core"],
      requiredEquipmentIds: ["medicine_ball"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "15-20",
      restSeconds: 45,
      source: "wger",
    },
    {
      name: "Weighted Sit-Up",
      muscleGroups: ["core"],
      requiredEquipmentIds: ["dumbbell", "bench"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "12-15",
      restSeconds: 45,
      source: "wger",
    },
    {
      name: "Ab Roller Rollout",
      muscleGroups: ["core"],
      requiredEquipmentIds: ["ab_roller"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "10-12",
      restSeconds: 45,
      source: "wger",
    },
    {
      name: "Machine Ab Crunch",
      muscleGroups: ["core"],
      requiredEquipmentIds: ["ab_crunch_machine"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "15-20",
      restSeconds: 45,
      source: "wger",
    },
    {
      name: "Stability Ball Crunch",
      muscleGroups: ["core"],
      requiredEquipmentIds: ["stability_ball"],
      isBodyweightSubstitute: false,
      sets: 3,
      reps: "15-20",
      restSeconds: 45,
      source: "wger",
    },
  ],
  full_body: [
    {
      name: "Kettlebell Swing",
      muscleGroups: ["full_body"],
      requiredEquipmentIds: ["kettlebell"],
      isBodyweightSubstitute: false,
      sets: 4,
      reps: "15-20",
      restSeconds: 60,
      source: "wger",
    },
    {
      name: "Rowing Machine Intervals",
      muscleGroups: ["full_body"],
      requiredEquipmentIds: ["rowing_machine"],
      isBodyweightSubstitute: false,
      sets: 4,
      reps: "250m",
      restSeconds: 60,
      source: "wger",
    },
  ],
};

// Order used to compose a "full body" routine so it actually spans
// different muscle groups instead of repeating one full-body pool entry.
const FULL_BODY_ROTATION: MuscleGroup[] = [
  "legs",
  "chest",
  "back",
  "shoulders",
  "core",
  "biceps",
  "triceps",
  "glutes",
];

const INTENSITY_EXERCISE_COUNT: Record<Intensity, number> = {
  light: 2,
  moderate: 3,
  intense: 4,
};

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

/**
 * Picks up to `count` distinct exercises for a muscle group: prefers
 * equipment-matched exercises, fills remaining slots from bodyweight
 * fallbacks, and only repeats an exercise if the combined pool (minus
 * whatever's already chosen elsewhere in the routine) is truly exhausted.
 */
function pickExercisesForGroup(
  group: MuscleGroup,
  availableIds: Set<string>,
  count: number,
  chosenNames: Set<string>
): ExerciseBase[] {
  const matched = (EQUIPMENT_EXERCISES[group] ?? []).filter((c) =>
    c.requiredEquipmentIds.every((id) => availableIds.has(id))
  );
  const fallbacks = bodyweightFallbacks[group] ?? [];
  const pool = [...matched, ...fallbacks];

  const picked: ExerciseBase[] = [];
  for (const exercise of pool) {
    if (picked.length >= count) break;
    if (chosenNames.has(exercise.name)) continue;
    picked.push(exercise);
    chosenNames.add(exercise.name);
  }

  // Pool exhausted but still short: allow repeats rather than leaving gaps.
  let poolIndex = 0;
  while (picked.length < count && pool.length > 0) {
    picked.push(pool[poolIndex % pool.length]);
    poolIndex += 1;
  }

  return picked;
}

export async function generateRoutine(
  detectedEquipment: DetectedEquipment[],
  goal: MuscleGroup,
  intensity: Intensity
): Promise<WorkoutRoutine> {
  const availableIds = new Set(detectedEquipment.map((e) => e.id));
  const targetCount = INTENSITY_EXERCISE_COUNT[intensity];
  const chosenNames = new Set<string>();

  let selected: ExerciseBase[];

  if (goal === "full_body") {
    selected = [];
    let rotationIndex = 0;
    while (selected.length < targetCount) {
      const group = FULL_BODY_ROTATION[rotationIndex % FULL_BODY_ROTATION.length];
      rotationIndex += 1;
      const [pick] = pickExercisesForGroup(group, availableIds, 1, chosenNames);
      if (pick) selected.push(pick);
      // Safety valve: if we've cycled the whole rotation without adding
      // anything (shouldn't happen given the catalog size), stop looping.
      if (rotationIndex > FULL_BODY_ROTATION.length * 2) break;
    }
  } else {
    selected = pickExercisesForGroup(goal, availableIds, targetCount, chosenNames);
  }

  const exercises: Exercise[] = await Promise.all(
    selected.slice(0, targetCount).map(async (base) => ({
      ...base,
      id: nextId(base.isBodyweightSubstitute ? "bw" : "eq"),
      youtubeUrl: await resolveVideoForExercise(base.name),
    }))
  );

  const equipmentUsed = Array.from(new Set(exercises.flatMap((e) => e.requiredEquipmentIds)));

  return {
    id: nextId("routine"),
    createdAt: new Date().toISOString(),
    goal,
    intensity,
    exercises,
    equipmentUsed,
    detectedEquipmentSnapshot: detectedEquipment,
  };
}
