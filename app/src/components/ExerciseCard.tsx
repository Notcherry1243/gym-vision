import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import type { Exercise } from "@gym-vision/shared";

export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{exercise.name}</Text>
        {exercise.isBodyweightSubstitute && (
          <Text style={styles.badge}>Substituted (no equipment)</Text>
        )}
      </View>
      <Text style={styles.detail}>
        {exercise.sets} sets × {exercise.reps} · rest {exercise.restSeconds}s
      </Text>
      <Pressable onPress={() => Linking.openURL(exercise.youtubeUrl)}>
        <Text style={styles.link}>Watch demo on YouTube ↗</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 10, backgroundColor: "#F9FAFB", gap: 4 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  name: { fontSize: 16, fontWeight: "600", flexShrink: 1 },
  badge: {
    fontSize: 11,
    color: "#B45309",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  detail: { color: "#6B7280" },
  link: { color: "#2563EB", marginTop: 4 },
});
