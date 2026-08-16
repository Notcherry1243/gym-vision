import { Router } from "express";
import { z } from "zod";
import { generateRoutine } from "../services/exerciseService";

export const generateRoutineRouter = Router();

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
  durationMinutes: z.number().optional(),
});

generateRoutineRouter.post("/generate-routine", async (req, res, next) => {
  try {
    const body = requestSchema.parse(req.body);
    const routine = await generateRoutine(body.detectedEquipment, body.goal, body.intensity);
    res.json(routine);
  } catch (err) {
    next(err);
  }
});
