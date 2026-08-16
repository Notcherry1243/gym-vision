import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: "#FFFFFF" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Photograph Your Gym" }} />
        <Stack.Screen name="goal" options={{ title: "Today's Goal" }} />
        <Stack.Screen name="routine" options={{ title: "Your Routine" }} />
        <Stack.Screen name="voice-picker" options={{ title: "Pick a Mentor" }} />
        <Stack.Screen name="session" options={{ title: "Workout Session" }} />
      </Stack>
    </>
  );
}
