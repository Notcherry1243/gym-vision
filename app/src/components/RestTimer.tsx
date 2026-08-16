import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  seconds: number;
  onComplete: () => void;
}

export function RestTimer({ seconds, onComplete }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onCompleteRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{remaining}s</Text>
      <Text style={styles.label}>Rest</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 4 },
  timer: { fontSize: 40, fontWeight: "700", color: "#22C55E" },
  label: { color: "#6B7280" },
});
