import { Pressable, StyleSheet, Text, View } from "react-native";
import type { VoiceCharacter } from "@gym-vision/shared";

interface Props {
  character: VoiceCharacter;
  selected: boolean;
  onSelect: () => void;
}

export function VoiceCharacterCard({ character, selected, onSelect }: Props) {
  return (
    <Pressable onPress={onSelect} style={[styles.card, selected && styles.cardSelected]}>
      <Text style={styles.name}>{character.displayName}</Text>
      <Text style={styles.description}>{character.description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 10, backgroundColor: "#F9FAFB", gap: 4, borderWidth: 2, borderColor: "transparent" },
  cardSelected: { borderColor: "#22C55E", backgroundColor: "#F0FDF4" },
  name: { fontSize: 16, fontWeight: "600" },
  description: { color: "#6B7280" },
});
