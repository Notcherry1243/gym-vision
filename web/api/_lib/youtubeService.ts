import { env } from "./env.js";
import { TtlCache } from "./cache.js";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const videoCache = new TtlCache<string>(ONE_WEEK_MS);

interface YoutubeSearchResponse {
  items: { id: { videoId: string } }[];
}

export async function resolveVideoForExercise(exerciseName: string): Promise<string> {
  const cacheKey = exerciseName.toLowerCase().trim();
  const cached = videoCache.get(cacheKey);
  if (cached) return cached;

  if (!env.youtubeApiKey) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + " proper form")}`;
  }

  const query = encodeURIComponent(`${exerciseName} proper form`);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q=${query}&key=${env.youtubeApiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    return `https://www.youtube.com/results?search_query=${query}`;
  }

  const data = (await response.json()) as YoutubeSearchResponse;
  const videoId = data.items[0]?.id?.videoId;
  const resolvedUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : `https://www.youtube.com/results?search_query=${query}`;

  videoCache.set(cacheKey, resolvedUrl);
  return resolvedUrl;
}
