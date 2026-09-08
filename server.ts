import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

/**
 * Converts 16-bit linear PCM audio buffer to a standard WAV audio buffer
 */
function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  numChannels = 1,
  bitDepth = 16
): Buffer {
  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // Audio format 1 = PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// In-memory cache for generated TTS audio to handle free-tier quotas and provide instant replay
interface CachedAudio {
  audioBase64: string;
  durationSeconds: number;
  timestamp: number;
}
const ttsCache = new Map<string, CachedAudio>();

function getCacheKey(text: string, voiceName: string, style: string): string {
  return `${voiceName}:${style}:${text.trim().toLowerCase()}`;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    cachedItemsCount: ttsCache.size,
  });
});

// Text-to-Speech API route
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voiceName = "Kore", style = "natural" } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Vui lòng nhập nội dung văn bản." });
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 2000) {
      return res.status(400).json({
        error: "Văn bản quá dài. Vui lòng nhập tối đa 2000 ký tự mỗi lần đọc.",
      });
    }

    // Check cache first
    const cacheKey = getCacheKey(trimmedText, voiceName, style);
    if (ttsCache.has(cacheKey)) {
      const cached = ttsCache.get(cacheKey)!;
      return res.json({
        success: true,
        audioBase64: cached.audioBase64,
        mimeType: "audio/wav",
        durationSeconds: cached.durationSeconds,
        cached: true,
      });
    }

    if (!ai) {
      return res.status(500).json({
        error:
          "Chưa cấu hình GEMINI_API_KEY trên máy chủ. Vui lòng kiểm tra cài đặt Secrets.",
      });
    }

    // Direct instructions emphasizing authentic Female Quang Binh accent (not Hue)
    let styleDirection =
      "mộc mạc, chân chất, trầm ấm, chuẩn giọng nữ Quảng Bình vùng Bắc Trung Bộ";
    if (style === "expressive") {
      styleDirection =
        "truyền cảm sâu lắng, giọng nữ Quảng Bình mộc mạc đậm tình nghĩa miền cát trắng";
    } else if (style === "news") {
      styleDirection =
        "rành mạch, dứt khoát, rõ ràng, phát âm chuẩn ngữ điệu nữ Quảng Bình";
    } else if (style === "cheerful") {
      styleDirection =
        "vui tươi, đon đả, hào sảng, thân thương theo nét riêng của phụ nữ Quảng Bình";
    }

    // Craft prompt for gemini-3.1-flash-tts-preview
    // Crucial instruction: Native Quang Binh female accent, specifically avoiding Hue cadence/drawl
    const prompt = `Read the following text with an authentic female Vietnamese accent from Quảng Bình province (${styleDirection}, dứt khoát, mộc mạc, tuyệt đối không lai hay dùng giọng Huế): "${trimmedText}"`;

    const selectedVoice = voiceName === "Zephyr" ? "Zephyr" : "Kore";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const candidatePart = response.candidates?.[0]?.content?.parts?.[0];
    const rawAudioBase64 = candidatePart?.inlineData?.data;

    if (!rawAudioBase64) {
      return res.status(500).json({
        error: "Không nhận được dữ liệu âm thanh từ mô hình AI.",
      });
    }

    // Raw PCM at 24000Hz 1-channel 16-bit
    const pcmBuf = Buffer.from(rawAudioBase64, "base64");
    const wavBuf = pcmToWav(pcmBuf, 24000, 1, 16);
    const wavBase64 = wavBuf.toString("base64");
    const durationSeconds = +(pcmBuf.length / (24000 * 2)).toFixed(2);

    // Save to cache
    ttsCache.set(cacheKey, {
      audioBase64: wavBase64,
      durationSeconds,
      timestamp: Date.now(),
    });

    // Prune cache if over 100 entries
    if (ttsCache.size > 100) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }

    return res.json({
      success: true,
      audioBase64: wavBase64,
      mimeType: "audio/wav",
      durationSeconds,
      cached: false,
    });
  } catch (error: any) {
    console.error("TTS generation error:", error);
    const status = error?.status || 500;
    const message = error?.message || "Lỗi tạo giọng nói.";

    if (error?.status === 429 || message.includes("Quota exceeded") || message.includes("429")) {
      return res.status(429).json({
        error:
          "Hệ thống tạo giọng đang tạm bận vì vượt giới hạn lượt gọi (3 lượt/phút trên gói thử nghiệm). Vui lòng đợi khoảng 15-30 giây rồi bấm nghe lại, hoặc chọn các mẫu câu có sẵn trong danh sách!",
        isRateLimit: true,
      });
    }

    return res.status(status).json({
      error: `Lỗi xử lý âm thanh: ${message}`,
    });
  }
});

// Dialect conversion helper (converts standard Vietnamese into authentic Quảng Bình vernacular)
app.post("/api/convert-dialect", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Thiếu văn bản đầu vào" });
    }

    if (!ai) {
      return res.status(500).json({ error: "Chưa cấu hình API Key" });
    }

    const prompt = `Bạn là một chuyên gia ngôn ngữ học và người con gốc Quảng Bình (Bắc Trung Bộ, Việt Nam).
Nhiệm vụ: Chuyển đổi đoạn văn bản tiếng Việt sau đây sang cách diễn đạt và từ ngữ địa phương mộc mạc của người Quảng Bình (như bọ, mạ, mô, tê, răng, rứa, cấy, chộ, tụi bây, cươi, trốc...).
LƯU Ý CỰC KỲ QUAN TRỌNG:
- Đây là giọng và thổ ngữ QUẢNG BÌNH, TUYỆT ĐỐI KHÔNG PHẢI GIỌNG HUẾ (không dùng các thói quen dạ thưa luyến láy cung đình hay từ ngữ thuần Huế).
- Giữ nguyên ý nghĩa gốc của văn bản, câu văn tự nhiên, mộc mạc, gần gũi.
- Trả về kết quả dưới dạng JSON có cấu trúc sau:
{
  "convertedText": "văn bản đã chuyển sang từ ngữ Quảng Bình",
  "changedWords": [
    { "original": "từ gốc", "dialect": "từ Quảng Bình", "explanation": "giải thích ngắn và phân biệt với Huế nếu có" }
  ],
  "accentTip": "Lời khuyên về cách phát âm ngữ điệu Quảng Bình cho câu này"
}

Văn bản cần chuyển:
"${text.slice(0, 1000)}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, ...parsed });
  } catch (err: any) {
    console.error("Dialect conversion error:", err);
    return res.status(500).json({ error: "Không thể chuyển soạn thổ ngữ: " + err.message });
  }
});

async function startServer() {
  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
