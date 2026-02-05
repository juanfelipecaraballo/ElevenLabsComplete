import WebSocket from "ws";
import { Response } from "express";
import { ElevenLabsWSMessage } from "./types.js";
import { TTSRepository } from "./repositories/tts.repository.js";

export async function streamTTS(
  text: string,
  res: Response,
  requestId: string,
  repo: TTSRepository,
): Promise<void> {
  const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${process.env.VOICE_ID}/stream-input`;

  const ws = new WebSocket(wsUrl, {
    headers: {
      "xi-api-key": process.env.ELEVEN_API_KEY as string,
    },
  });

  ws.on("open", () => {
    ws.send(
      JSON.stringify({
        text: " ",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      }),
    );

    ws.send(JSON.stringify({ text }));
    ws.send(JSON.stringify({ text: "" }));
  });

  ws.on("message", async (data: WebSocket.RawData) => {
    const msg: ElevenLabsWSMessage = JSON.parse(data.toString());

    if (msg.audio) {
      const buffer = Buffer.from(msg.audio, "base64");
      res.write(buffer);
    }

    if (msg.isFinal) {
      await repo.markCompleted(requestId);
      res.end();
      ws.close();
    }
  });

  ws.on("error", async (err: Error) => {
    await repo.markFailed(requestId);
    console.error("ElevenLabs error:", err);
    res.end();
  });

  res.on("close", async () => {
    await repo.markCompleted(requestId);
    ws.close();
  });
}
