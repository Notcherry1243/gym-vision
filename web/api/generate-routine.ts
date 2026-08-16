import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { generateRoutine } from "./_lib/exerciseService.js";

const detectedEquipmentSchema = z.object({
  id: z.string(),
  label: z.string(),
  confidence: z.number(),
  sourcePhotoIndex: z.number(),
  userConfirmed: z.boolean(),
});

const requestSchema = z.object({
  detectedEquipment: z.array(detectedEquipmentSchema),
  goal: z.enum([
    "biceps",
    "triceps",
    "chest",
    "back",
    "shoulders",
    "legs",
    "glutes",
    "core",
    "full_body",
  ]),
  intensity: z.enum(["light", "moderate", "intense"]),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = requestSchema.parse(req.body);
    const routine = await generateRoutine(body.detectedEquipment, body.goal, body.intensity);
    res.status(200).json(routine);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Invalid request" });
  }
}
