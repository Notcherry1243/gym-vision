import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export function LoadingOverlay({ label }: { label: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#22C55E" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  label: { fontSize: 16, color: "#374151" },
});
