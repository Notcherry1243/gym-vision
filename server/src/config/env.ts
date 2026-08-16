import dotenv from "dotenv";

dotenv.config();

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),

  roboflowApiKey: optional("ROBOFLOW_API_KEY"),
  roboflowModelId: optional("ROBOFLOW_MODEL_ID"),
  geminiApiKey: optional("GEMINI_API_KEY"),

  ttsProvider: (optional("TTS_PROVIDER") ?? "google") as "google" | "elevenlabs",
  googleTtsApiKey: optional("GOOGLE_TTS_API_KEY"),
  elevenLabsApiKey: optional("ELEVENLABS_API_KEY"),

  youtubeApiKey: optional("YOUTUBE_API_KEY"),
};

export function warnIfMissingSecrets(): void {
  const missing: string[] = [];
  if (!env.roboflowApiKey || !env.roboflowModelId) missing.push("ROBOFLOW_API_KEY / ROBOFLOW_MODEL_ID");
  if (env.ttsProvider === "google" && !env.googleTtsApiKey) missing.push("GOOGLE_TTS_API_KEY");
  if (env.ttsProvider === "elevenlabs" && !env.elevenLabsApiKey) missing.push("ELEVENLABS_API_KEY");
  if (!env.youtubeApiKey) missing.push("YOUTUBE_API_KEY");

  if (missing.length > 0) {
    console.warn(
      `[env] Missing keys, falling back to stub/hardcoded data where needed: ${missing.join(", ")}`
    );
  }
}
