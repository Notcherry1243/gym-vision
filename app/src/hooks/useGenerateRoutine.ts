import { useState } from "react";
import { generateRoutine } from "../services/apiClient";
import { useSessionStore } from "../state/sessionStore";

export function useGenerateRoutine() {
  const detectedEquipment = useSessionStore((s) => s.detectedEquipment);
  const goal = useSessionStore((s) => s.goal);
  const intensity = useSessionStore((s) => s.intensity);
  const setRoutine = useSessionStore((s) => s.setRoutine);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runGenerate() {
    if (!goal) {
      setError("Pick a goal first");
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const confirmedEquipment = detectedEquipment.filter((e) => e.userConfirmed);
      const routine = await generateRoutine(confirmedEquipment, goal, intensity);
      setRoutine(routine);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate routine");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { runGenerate, loading, error };
}
