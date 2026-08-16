import { useState } from "react";
import { analyzePhotos } from "../services/apiClient";
import { useSessionStore } from "../state/sessionStore";

export function useAnalyzePhotos() {
  const photos = useSessionStore((s) => s.photos);
  const setDetectedEquipment = useSessionStore((s) => s.setDetectedEquipment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const detected = await analyzePhotos(photos);
      setDetectedEquipment(detected.map((e) => ({ ...e, userConfirmed: true })));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze photos");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { runAnalysis, loading, error };
}
