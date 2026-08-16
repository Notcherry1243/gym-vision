import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import type { VoiceCharacter } from "@gym-vision/shared";
import { LoadingOverlay } from "../src/components/LoadingOverlay";
import { VoiceCharacterCard } from "../src/components/VoiceCharacterCard";
import { fetchVoiceCharacters } from "../src/services/apiClient";
import { useSessionStore } from "../src/state/sessionStore";

export default function VoiceCharacterPickerScreen() {
  const router = useRouter();
  const [characters, setCharacters] = useState<VoiceCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selected = useSessionStore((s) => s.selectedVoiceCharacter);
  const setSelectedVoiceCharacter = useSessionStore((s) => s.setSelectedVoiceCharacter);

  useEffect(() => {
    fetchVoiceCharacters()
      .then(setCharacters)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load voice mentors"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingOverlay label="Loading voice mentors..." />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pick your mentor</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      {characters.map((character) => (
        <VoiceCharacterCard
          key={character.id}
          character={character}
          selected={selected?.id === character.id}
          onSelect={() => setSelectedVoiceCharacter(character)}
        />
      ))}

      <Pressable
        style={[styles.continueButton, !selected && styles.continueButtonDisabled]}
        disabled={!selected}
        onPress={() => router.push("/session")}
      >
        <Text style={styles.continueButtonText}>Start Workout</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: "700" },
  error: { color: "#DC2626" },
  continueButton: { backgroundColor: "#22C55E", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 16 },
  continueButtonDisabled: { backgroundColor: "#9CA3AF" },
  continueButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
});
