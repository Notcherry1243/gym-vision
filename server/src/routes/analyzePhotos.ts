import { Router } from "express";
import { upload } from "../middleware/upload";
import { analyzePhotos } from "../services/visionService";

export const analyzePhotosRouter = Router();

analyzePhotosRouter.post("/analyze-photos", upload.array("photos", 10), async (req, res, next) => {
  try {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const buffers = files.map((f) => f.buffer);
    const detectedEquipment = await analyzePhotos(buffers);
    res.json({ detectedEquipment });
  } catch (err) {
    next(err);
  }
});
