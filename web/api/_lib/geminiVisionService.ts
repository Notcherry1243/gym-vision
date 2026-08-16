import type { DetectedEquipment } from "./types.js";
import { env } from "./env.js";
import { normalizeEquipmentLabel } from "./data/equipmentAliasMap.js";
import { EQUIPMENT_VOCABULARY } from "./data/equipmentVocabulary.js";

const MODEL = "gemini-flash-latest";

interface GeminiPart {
  text?: string;
}
interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
}

interface GeminiEquipmentItem {
  equipment: string;
  confidence: number;
}

function extractJson(text: string): string {
  // Gemini frequently wraps JSON in ```json ... ``` fences.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (fenced ? fenced[1] : text).trim();
}

async function detectFromPhotoViaGemini(photoBuffer: Buffer, photoIndex: number): Promise<DetectedEquipment[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${env.geminiApiKey}`;

  const prompt = `Identify visible gym equipment in this photo. Prefer these exact names when applicable: ${EQUIPMENT_VOCABULARY.join(", ")}. If you see equipment not in that list, still name it. Respond with ONLY a JSON array like [{"equipment": "dumbbell", "confidence": 0.9}]. Use confidence 0-1 for how certain you are. Return [] if no gym equipment is visible.`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: photoBuffer.toString("base64") } }],
        },
      ],
      generationConfig: { temperature: 0 },
    }),
  });

  if (!response.ok) {
    console.log(`[geminiVisionService] request failed: ${response.status} ${await response.text()}`);
    return [];
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

  let items: GeminiEquipmentItem[] = [];
  try {
    items = JSON.parse(extractJson(text));
  } catch {
    console.log(`[geminiVisionService] failed to parse response: ${text}`);
    return [];
  }

  console.log(
    `[geminiVisionService] photo ${photoIndex}: ${items.length} items`,
    items.map((i) => `${i.equipment}(${i.confidence})`).join(", ") || "(none)"
  );

  return items
    .filter((i) => i && typeof i.equipment === "string")
    .map((i) => ({
      id: normalizeEquipmentLabel(i.equipment),
      label: i.equipment,
      confidence: typeof i.confidence === "number" ? i.confidence : 0.75,
      sourcePhotoIndex: photoIndex,
      userConfirmed: false,
    }));
}

export async function analyzePhotosViaGemini(photos: Buffer[]): Promise<DetectedEquipment[]> {
  if (!env.geminiApiKey) return [];
  const results = await Promise.all(photos.map((photo, index) => detectFromPhotoViaGemini(photo, index)));
  return results.flat();
}
