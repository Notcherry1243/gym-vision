import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { RestTimer } from "../src/components/RestTimer";
import { useVoiceMentor } from "../src/hooks/useVoiceMentor";
import { useSessionStore } from "../src/state/sessionStore";

export default function WorkoutSessionScreen() {
  const router = useRouter();
  const routine = useSessionStore((s) => s.routine);
  const currentExerciseIndex = useSessionStore((s) => s.currentExerciseIndex);
  const currentSetIndex = useSessionStore((s) => s.currentSetIndex);
  const advanceSet = useSessionStore((s) => s.advanceSet);
  const resetSession = useSessionStore((s) => s.resetSession);
  const { playLine, muted, toggleMuted } = useVoiceMentor();

  const [resting, setResting] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const exercise = routine?.exercises[currentExerciseIndex];

  useEffect(() => {
    if (routine && !started) {
      playLine("start");
      setStarted(true);
    }
  }, [routine, started, playLine]);

  useEffect(() => {
    if (routine && currentExerciseIndex >= routine.exercises.length && !finished) {
      setFinished(true);
      playLine("end");
    }
  }, [routine, currentExerciseIndex, finished, playLine]);

  if (!routine) {
    return (
      <View style={styles.empty}>
        <Text>No routine loaded.</Text>
      </View>
    );
  }

  if (finished) {
    return (
      <View style={styles.empty}>
        <Text style={styles.title}>Workout complete!</Text>
        <Pressable
          style={styles.button}
          onPress={() => {
            resetSession();
            router.replace("/");
          }}
        >
          <Text style={styles.buttonText}>Start a New Session</Text>
        </Pressable>
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.empty}>
        <Text>Loading next exercise...</Text>
      </View>
    );
  }

  function handleSetComplete() {
    playLine("betweenSets");
    if (exercise!.restSeconds >= 20) {
      setResting(true);
    } else {
      advanceSet();
    }
  }

  function handleRestComplete() {
    playLine("restEncouragement");
    setResting(false);
    advanceSet();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{exercise.name}</Text>
      <Text style={styles.subtitle}>
        Set {currentSetIndex + 1} of {exercise.sets} · {exercise.reps}
      </Text>

      {resting ? (
        <RestTimer seconds={exercise.restSeconds} onComplete={handleRestComplete} />
      ) : (
        <Pressable style={styles.button} onPress={handleSetComplete}>
          <Text style={styles.buttonText}>Set Complete</Text>
        </Pressable>
      )}

      <Pressable style={styles.muteButton} onPress={toggleMuted}>
        <Text style={styles.muteButtonText}>{muted ? "Unmute Mentor" : "Mute Mentor"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", justifyContent: "center", gap: 20 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center" },
  subtitle: { color: "#6B7280", fontSize: 16 },
  button: { backgroundColor: "#22C55E", paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12 },
  buttonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  muteButton: { padding: 10 },
  muteButtonText: { color: "#6B7280" },
});
