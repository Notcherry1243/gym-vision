import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { MuscleGroup } from "@gym-vision/shared";
import { EquipmentChecklist } from "../src/components/EquipmentChecklist";
import { IntensitySelector } from "../src/components/IntensitySelector";
import { LoadingOverlay } from "../src/components/LoadingOverlay";
import { useGenerateRoutine } from "../src/hooks/useGenerateRoutine";
import { useSessionStore } from "../src/state/sessionStore";

const MUSCLE_GROUPS: MuscleGroup[] = [
  "biceps",
  "triceps",
  "chest",
  "back",
  "shoulders",
  "legs",
  "glutes",
  "core",
  "full_body",
];

export default function GoalSelectorScreen() {
  const router = useRouter();
  const detectedEquipment = useSessionStore((s) => s.detectedEquipment);
  const toggleEquipmentConfirmed = useSessionStore((s) => s.toggleEquipmentConfirmed);
  const goal = useSessionStore((s) => s.goal);
  const setGoal = useSessionStore((s) => s.setGoal);
  const intensity = useSessionStore((s) => s.intensity);
  const setIntensity = useSessionStore((s) => s.setIntensity);
  const { runGenerate, loading, error } = useGenerateRoutine();

  async function handleContinue() {
    const ok = await runGenerate();
    if (ok) router.push("/routine");
  }

  if (loading) return <LoadingOverlay label="Building your routine..." />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Detected equipment</Text>
      <Text style={styles.hint}>Tap to confirm/deselect anything we got wrong.</Text>
      <EquipmentChecklist equipment={detectedEquipment} onToggle={toggleEquipmentConfirmed} />

      <Text style={styles.sectionTitle}>What are you working on?</Text>
      <View style={styles.grid}>
        {MUSCLE_GROUPS.map((mg) => (
          <Pressable
            key={mg}
            onPress={() => setGoal(mg)}
            style={[styles.chip, goal === mg && styles.chipSelected]}
          >
            <Text style={[styles.chipText, goal === mg && styles.chipTextSelected]}>
              {mg.replace("_", " ")}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Intensity</Text>
      <IntensitySelector value={intensity} onChange={setIntensity} />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Generate Routine</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 12 },
  hint: { color: "#6B7280" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: "#F3F4F6" },
  chipSelected: { backgroundColor: "#22C55E" },
  chipText: { color: "#374151", textTransform: "capitalize" },
  chipTextSelected: { color: "#FFFFFF", fontWeight: "600" },
  error: { color: "#DC2626" },
  continueButton: { backgroundColor: "#22C55E", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 16 },
  continueButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
});
