import { Router } from "express";
import { z } from "zod";
import { synthesizeLine } from "../services/ttsService";
import { voiceCharacters } from "../data/voiceCharacters";

export const ttsRouter = Router();

const requestSchema = z.object({
  characterId: z.string(),
  scriptKey: z.enum(["start", "betweenSets", "restEncouragement", "end"]),
  variantIndex: z.number().optional(),
});

ttsRouter.post("/tts", async (req, res, next) => {
  try {
    const body = requestSchema.parse(req.body);
    const audio = await synthesizeLine(body.characterId, body.scriptKey, body.variantIndex);
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(audio);
  } catch (err) {
    next(err);
  }
});

// GET variant so the Expo audio player can load/stream this as a plain URL
// (useAudioPlayer takes a source URL, not a POST body).
ttsRouter.get("/tts", async (req, res, next) => {
  try {
    const body = requestSchema.parse({
      characterId: req.query.characterId,
      scriptKey: req.query.scriptKey,
      variantIndex: req.query.variantIndex ? Number(req.query.variantIndex) : undefined,
    });
    const audio = await synthesizeLine(body.characterId, body.scriptKey, body.variantIndex);
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(audio);
  } catch (err) {
    next(err);
  }
});

ttsRouter.get("/voice-characters", (_req, res) => {
  res.json({ voiceCharacters });
});
