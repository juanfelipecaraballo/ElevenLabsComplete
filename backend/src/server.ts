import express, { Request, Response } from "express";
import { db } from "./db/connection.js";
import { TTSRepository } from "./repositories/tts.repository.js";
/*import dotenv from "dotenv";*/
import { streamTTS } from "./elevenlabs.js";

/*dotenv.config();*/

const app = express();
app.use(express.json());

const ttsRepo = new TTSRepository(db);

app.post("/tts", async (req: Request, res: Response) => {
  const { text } = req.body as { text?: string };

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  const request = await ttsRepo.create(text, process.env.VOICE_ID!);

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Transfer-Encoding", "chunked");

  try {
    await streamTTS(text, res, request.id, ttsRepo);
  } catch (err) {
    await ttsRepo.markFailed(request.id);
    res.end();
  }
});

app.listen(3000, () => {
  console.log("TTS server running on http://localhost:3000");
});
