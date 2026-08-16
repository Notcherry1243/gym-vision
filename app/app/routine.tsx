import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ExerciseCard } from "../src/components/ExerciseCard";
import { useSessionStore } from "../src/state/sessionStore";

export default function RoutineReviewScreen() {
  const router = useRouter();
  const routine = useSessionStore((s) => s.routine);

  if (!routine) {
    return (
      <View style={styles.empty}>
        <Text>No routine yet — go back and generate one.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {routine.goal.replace("_", " ")} · {routine.intensity}
      </Text>
      <Text style={styles.subtitle}>{routine.exercises.length} exercises</Text>

      <View style={styles.list}>
        {routine.exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </View>

      <Pressable style={styles.continueButton} onPress={() => router.push("/voice-picker")}>
        <Text style={styles.continueButtonText}>Choose Your Voice Mentor</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", textTransform: "capitalize" },
  subtitle: { color: "#6B7280" },
  list: { gap: 12, marginTop: 8 },
  continueButton: { backgroundColor: "#22C55E", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 16 },
  continueButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
});
