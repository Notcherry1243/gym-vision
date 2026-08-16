import cors from "cors";
import express from "express";
import { env, warnIfMissingSecrets } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { analyzePhotosRouter } from "./routes/analyzePhotos";
import { generateRoutineRouter } from "./routes/generateRoutine";
import { ttsRouter } from "./routes/tts";

warnIfMissingSecrets();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(analyzePhotosRouter);
app.use(generateRoutineRouter);
app.use(ttsRouter);

app.use(errorHandler);

app.listen(env.port, "0.0.0.0", () => {
  console.log(`Gym Vision backend listening on http://0.0.0.0:${env.port}`);
});
