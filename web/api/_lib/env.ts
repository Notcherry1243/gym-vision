function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  roboflowApiKey: optional("ROBOFLOW_API_KEY"),
  roboflowModelId: optional("ROBOFLOW_MODEL_ID"),
  geminiApiKey: optional("GEMINI_API_KEY"),

  ttsProvider: (optional("TTS_PROVIDER") ?? "google") as "google" | "elevenlabs",
  googleTtsApiKey: optional("GOOGLE_TTS_API_KEY"),
  elevenLabsApiKey: optional("ELEVENLABS_API_KEY"),

  youtubeApiKey: optional("YOUTUBE_API_KEY"),
};
