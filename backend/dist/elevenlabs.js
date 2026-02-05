"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamTTS = streamTTS;
const ws_1 = __importDefault(require("ws"));
async function streamTTS(text, res) {
    const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${process.env.VOICE_ID}/stream-input`;
    const ws = new ws_1.default(wsUrl, {
        headers: {
            "xi-api-key": process.env.ELEVEN_API_KEY,
        },
    });
    ws.on("open", () => {
        ws.send(JSON.stringify({
            text: " ",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.8,
            },
        }));
        ws.send(JSON.stringify({ text }));
        ws.send(JSON.stringify({ text: "" }));
    });
    ws.on("message", (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.audio) {
            const buffer = Buffer.from(msg.audio, "base64");
            res.write(buffer);
        }
        if (msg.isFinal) {
            res.end();
            ws.close();
        }
    });
    ws.on("error", (err) => {
        console.error("ElevenLabs error:", err);
        res.end();
    });
}
