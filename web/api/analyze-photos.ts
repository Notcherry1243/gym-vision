import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzePhotos } from "./_lib/visionService.js";
import { parsePhotoUploads } from "./_lib/parseMultipart.js";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const buffers = await parsePhotoUploads(req);
    const detectedEquipment = await analyzePhotos(buffers);
    res.status(200).json({ detectedEquipment });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unexpected error" });
  }
}
