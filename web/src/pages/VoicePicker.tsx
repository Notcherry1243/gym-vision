import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { VoiceCharacter } from "../types";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { StepHeader } from "../components/StepHeader";
import { VoiceCharacterCard } from "../components/VoiceCharacterCard";
import { fetchVoiceCharacters } from "../services/apiClient";
import { useSessionStore } from "../state/sessionStore";

export function VoicePickerPage() {
  const navigate = useNavigate();
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
    <>
      <StepHeader step={4} total={5} label="Pick your mentor" />
      <h1>Pick your mentor</h1>
      {error && <p className="error-text">{error}</p>}

      {characters.map((character) => (
        <VoiceCharacterCard
          key={character.id}
          character={character}
          selected={selected?.id === character.id}
          onSelect={() => setSelectedVoiceCharacter(character)}
        />
      ))}

      <button className="btn-primary bottom-cta" disabled={!selected} onClick={() => navigate("/session")}>
        Start Workout
      </button>
    </>
  );
}
