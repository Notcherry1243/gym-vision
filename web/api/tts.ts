import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { synthesizeLine } from "./_lib/ttsService.js";

const requestSchema = z.object({
  characterId: z.string(),
  scriptKey: z.enum(["start", "betweenSets", "restEncouragement", "end"]),
  variantIndex: z.coerce.number().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const source = req.method === "GET" ? req.query : req.body;
    const body = requestSchema.parse(source);
    const audio = await synthesizeLine(body.characterId, body.scriptKey, body.variantIndex);
    res.setHeader("Content-Type", "audio/mpeg");
    res.status(200).send(audio);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Invalid request" });
  }
}
