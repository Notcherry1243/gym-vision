import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DetectedEquipment } from "@gym-vision/shared";

interface Props {
  equipment: DetectedEquipment[];
  onToggle: (id: string) => void;
}

export function EquipmentChecklist({ equipment, onToggle }: Props) {
  if (equipment.length === 0) {
    return <Text style={styles.empty}>No equipment detected yet.</Text>;
  }

  return (
    <View style={styles.list}>
      {equipment.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onToggle(item.id)}
          style={[styles.row, item.userConfirmed && styles.rowConfirmed]}
        >
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.confidence}>{Math.round(item.confidence * 100)}%</Text>
          <Text style={styles.check}>{item.userConfirmed ? "✓" : ""}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  empty: { color: "#6B7280", fontStyle: "italic" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  rowConfirmed: { backgroundColor: "#DCFCE7" },
  label: { fontSize: 16, fontWeight: "500", flex: 1 },
  confidence: { color: "#6B7280", marginRight: 8 },
  check: { fontSize: 16, fontWeight: "700", color: "#16A34A", width: 20 },
});
