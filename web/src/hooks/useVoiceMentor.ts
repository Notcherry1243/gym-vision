import { useCallback, useRef, useState } from "react";
import type { ScriptKey } from "../types";
import { ttsUrl } from "../services/apiClient";
import { useSessionStore } from "../state/sessionStore";

export function useVoiceMentor() {
  const character = useSessionStore((s) => s.selectedVoiceCharacter);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);

  const playLine = useCallback(
    (scriptKey: ScriptKey) => {
      if (muted || !character || playingRef.current) return;
      const variantIndex = Math.floor(Math.random() * character.scripts[scriptKey].length);
      const url = ttsUrl(character.id, scriptKey, variantIndex);

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      const audio = audioRef.current;
      audio.onended = () => {
        playingRef.current = false;
      };
      audio.onerror = () => {
        playingRef.current = false;
      };
      audio.src = url;
      playingRef.current = true;
      audio.play().catch(() => {
        // Autoplay can be blocked until the user interacts with the page,
        // or the TTS request itself can fail server-side. Either way, don't
        // leave playingRef stuck "true" forever or the mentor goes silent
        // for the rest of the session.
        playingRef.current = false;
      });
    },
    [character, muted]
  );

  return {
    playLine,
    muted,
    toggleMuted: () => setMuted((m) => !m),
    hasCharacter: Boolean(character),
  };
}
