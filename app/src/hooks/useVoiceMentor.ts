import { useAudioPlayer } from "expo-audio";
import { useCallback, useRef, useState } from "react";
import type { ScriptKey } from "@gym-vision/shared";
import { ttsUrl } from "../services/apiClient";
import { useSessionStore } from "../state/sessionStore";

export function useVoiceMentor() {
  const character = useSessionStore((s) => s.selectedVoiceCharacter);
  const player = useAudioPlayer(null);
  const [muted, setMuted] = useState(false);
  const playingRef = useRef(false);

  const playLine = useCallback(
    (scriptKey: ScriptKey) => {
      if (muted || !character || playingRef.current) return;
      const variantIndex = Math.floor(Math.random() * character.scripts[scriptKey].length);
      const url = ttsUrl(character.id, scriptKey, variantIndex);
      playingRef.current = true;
      player.replace(url);
      player.play();
      // Rough guard so lines don't overlap; playback duration varies but
      // motivational lines are short, so this is a safe minimum gap.
      setTimeout(() => {
        playingRef.current = false;
      }, 4000);
    },
    [character, muted, player]
  );

  return {
    playLine,
    muted,
    toggleMuted: () => setMuted((m) => !m),
    hasCharacter: Boolean(character),
  };
}
