"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const elevenlabs_js_1 = require("./elevenlabs.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/tts", async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");
    await (0, elevenlabs_js_1.streamTTS)(text, res);
});
app.listen(3000, () => {
    console.log("🚀 TTS server running on http://localhost:3000");
});
