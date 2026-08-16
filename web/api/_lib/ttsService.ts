import { env } from "./env.js";
import { getVoiceCharacterById } from "./data/voiceCharacters.js";
import { TtlCache } from "./cache.js";
import type { ScriptKey } from "./types.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const audioCache = new TtlCache<Buffer>(ONE_DAY_MS);

interface GoogleTtsResponse {
  audioContent: string; // base64
}

async function synthesizeWithGoogle(text: string, voiceId: string): Promise<Buffer> {
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.googleTtsApiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: "en-US", name: voiceId },
      audioConfig: { audioEncoding: "MP3" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Google TTS failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as GoogleTtsResponse;
  return Buffer.from(data.audioContent, "base64");
}

async function synthesizeWithElevenLabs(text: string, voiceId: string): Promise<Buffer> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": env.elevenLabsApiKey ?? "",
    },
    body: JSON.stringify({ text, model_id: "eleven_flash_v2_5" }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs TTS failed: ${response.status} ${await response.text()}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function synthesizeLine(characterId: string, scriptKey: ScriptKey, variantIndex = 0): Promise<Buffer> {
  const character = getVoiceCharacterById(characterId);
  if (!character) {
    throw new Error(`Unknown voice character: ${characterId}`);
  }

  const lines = character.scripts[scriptKey];
  const text = lines[variantIndex % lines.length];
  const cacheKey = `${characterId}:${scriptKey}:${variantIndex % lines.length}`;

  const cached = audioCache.get(cacheKey);
  if (cached) return cached;

  const audio =
    character.ttsProvider === "elevenlabs"
      ? await synthesizeWithElevenLabs(text, character.ttsVoiceId)
      : await synthesizeWithGoogle(text, character.ttsVoiceId);

  audioCache.set(cacheKey, audio);
  return audio;
}
