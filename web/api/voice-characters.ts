import type { VercelRequest, VercelResponse } from "@vercel/node";
import { voiceCharacters } from "./_lib/data/voiceCharacters.js";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ voiceCharacters });
}
