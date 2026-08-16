/**
 * Maps raw class labels coming back from the Roboflow detection model
 * (and any other detector we might swap in) to a canonical equipment id
 * used everywhere else in the app.
 */
export const equipmentAliasMap: Record<string, string> = {
  dumbbell: "dumbbell",
  dumbbells: "dumbbell",
  barbell: "barbell",
  bench: "bench",
  flat_bench: "bench",
  incline_bench: "bench",
  kettlebell: "kettlebell",
  pull_up_bar: "pull_up_bar",
  pullup_bar: "pull_up_bar",
  lat_pulldown_machine: "lat_pulldown",
  cable_machine: "cable_machine",
  squat_rack: "squat_rack",
  power_rack: "squat_rack",
  leg_press_machine: "leg_press",
  treadmill: "treadmill",
  resistance_band: "resistance_band",
  yoga_mat: "yoga_mat",
  medicine_ball: "medicine_ball",
  rowing_machine: "rowing_machine",

  // Bangkit Academy gym-equipment-object-detection model (Roboflow Universe)
  // class labels -> our canonical equipment ids.
  leg_extension: "leg_extension",
  leg_press: "leg_press",
  seated_dip_machine: "seated_dip_machine",
  chest_press_machine: "chest_press_machine",
  chinning_dipping: "pull_up_bar",
  seated_cable_rows: "cable_machine",
  shoulder_press_machine: "shoulder_press_machine",
  chest_fly_machine: "chest_fly_machine",
  reg_curl_machine: "leg_curl_machine",
  arm_curl_machine: "arm_curl_machine",
  lat_pull_down: "lat_pulldown",
  smith_machine: "smith_machine",
  lateral_raises_machine: "lateral_raises_machine",

  // exercisedetect/all-gym-equipment (Roboflow Universe) class labels ->
  // our canonical equipment ids. Higher accuracy (mAP 88 vs 62) and much
  // broader coverage than the Bangkit model, including free weights it
  // couldn't detect at all.
  kettlebells: "kettlebell",
  abdominal_bench: "bench",
  stability_ball: "stability_ball",
  leg_raise_tower: "leg_raise_tower",
  stepmill: "stepmill",
  elliptical: "elliptical",
  back_extension_machine: "back_extension_machine",
  ab_crunch_machine: "ab_crunch_machine",
  functional_trainer: "cable_machine",
  preacher_curl: "preacher_curl",
  ghd_machine: "ghd_machine",
  ab_roller: "ab_roller",
  hack_squat_machine: "hack_squat_machine",
  lat_pull_down_machine: "lat_pulldown",
  leg_curl_machine: "leg_curl_machine",
  leg_extension_machine: "leg_extension",
  seated_row_machine: "cable_machine",
  stationary_bike: "stationary_bike",

  // Gemini Vision free-text output tends to use slightly different phrasing
  // than the Roboflow class labels above.
  dumbbell_rack: "dumbbell",
  free_weights: "dumbbell",
  weight_bench: "bench",
  flat_weight_bench: "bench",
  chin_up_bar: "pull_up_bar",
  leg_curl: "leg_curl_machine",
  shoulder_press: "shoulder_press_machine",
  chest_press: "chest_press_machine",
  chest_fly: "chest_fly_machine",
  lateral_raise: "lateral_raises_machine",
  lateral_raise_machine: "lateral_raises_machine",
  arm_curl: "arm_curl_machine",
  bicep_curl_machine: "arm_curl_machine",
  preacher_curl_bench: "preacher_curl",
  ghd: "ghd_machine",
  back_extension: "back_extension_machine",
  hyperextension_bench: "back_extension_machine",
  ab_crunch: "ab_crunch_machine",
  exercise_bike: "stationary_bike",
  stationary_bicycle: "stationary_bike",
  hack_squat: "hack_squat_machine",
};

export function normalizeEquipmentLabel(rawLabel: string): string {
  const key = rawLabel.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return equipmentAliasMap[key] ?? key;
}
