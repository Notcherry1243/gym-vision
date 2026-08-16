import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Intensity } from "@gym-vision/shared";

const OPTIONS: Intensity[] = ["light", "moderate", "intense"];

export function IntensitySelector({
  value,
  onChange,
}: {
  value: Intensity;
  onChange: (intensity: Intensity) => void;
}) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => (
        <Pressable
          key={option}
          onPress={() => onChange(option)}
          style={[styles.option, value === option && styles.optionSelected]}
        >
          <Text style={[styles.text, value === option && styles.textSelected]}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  option: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  optionSelected: { backgroundColor: "#22C55E" },
  text: { color: "#374151", fontWeight: "500", textTransform: "capitalize" },
  textSelected: { color: "#FFFFFF" },
});
