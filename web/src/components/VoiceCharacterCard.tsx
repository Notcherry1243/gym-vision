import type { VoiceCharacter } from "../types";

interface Props {
  character: VoiceCharacter;
  selected: boolean;
  onSelect: () => void;
}

export function VoiceCharacterCard({ character, selected, onSelect }: Props) {
  return (
    <button onClick={onSelect} className={`voice-card${selected ? " selected" : ""}`}>
      <span className="voice-name">{character.displayName}</span>
      <span className="voice-description">{character.description}</span>
    </button>
  );
}
