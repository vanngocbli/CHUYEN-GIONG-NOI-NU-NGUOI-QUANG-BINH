import { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import TextInputPanel from "./components/TextInputPanel";
import AudioPlayer from "./components/AudioPlayer";
import QuangBinhAccentGuide from "./components/QuangBinhAccentGuide";
import HistoryList from "./components/HistoryList";
import { VoiceStyle, HistoryItem } from "./types";
import { AlertCircle, CheckCircle, Volume2, ShieldAlert } from "lucide-react";

const INITIAL_TEXT =
  "Chào bà con cô bác! Tui là người con gái Quảng Bình, rất vui được gặp gỡ và trò chuyện cùng mọi người. Quê tui có biển Nhật Lệ trong xanh, có động Phong Nha kỳ vĩ và những con người kiên cường, mộc mạc đậm tình quê hương.";

const LOCAL_STORAGE_KEY = "giong_nu_quangbinh_history_v1";

export default function App() {
  const [text, setText] = useState(INITIAL_TEXT);
  const [voiceName, setVoiceName] = useState<"Kore" | "Zephyr">("Kore");
  const [style, setStyle] = useState<VoiceStyle>("natural");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<{
    audioBase64: string;
    durationSeconds: number;
    label: string;
    text: string;
  } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage:", e);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (items: HistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items.slice(0, 15)));
    } catch (e) {
      console.error("Failed to save history to localStorage:", e);
    }
  };

  // Handle countdown for rate limits
  useEffect(() => {
    if (rateLimitCountdown > 0) {
      timerRef.current = setTimeout(() => {
        setRateLimitCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      clearTimeout(timerRef.current);
    }
    return () => clearTimeout(timerRef.current);
  }, [rateLimitCountdown]);

  const handleGenerateSpeech = async () => {
    if (!text.trim() || isLoading || rateLimitCountdown > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          voiceName,
          style,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 || data.isRateLimit) {
          setRateLimitCountdown(25);
          setError(
            data.error ||
              "Hệ thống đạt giới hạn lượt gọi thử nghiệm (3 lượt/phút). Vui lòng đợi 25 giây hoặc nghe lại các đoạn đã tạo."
          );
        } else {
          setError(data.error || "Không thể tạo giọng nói. Vui lòng thử lại.");
        }
        return;
      }

      if (data.audioBase64) {
        const voiceLabel = voiceName === "Zephyr" ? "Em Thảo (Zephyr)" : "O Lan (Kore)";
        const newAudio = {
          audioBase64: data.audioBase64,
          durationSeconds: data.durationSeconds || 5,
          label: `Giọng Nữ Quảng Bình • ${voiceLabel}`,
          text: text.trim(),
        };

        setCurrentAudio(newAudio);

        // Add to history
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          text: text.trim(),
          audioBase64: data.audioBase64,
          durationSeconds: data.durationSeconds || 5,
          voiceName,
          style,
          createdAt: Date.now(),
        };

        const updatedHistory = [newItem, ...history.filter((h) => h.text !== text.trim())].slice(
          0,
          15
        );
        saveHistory(updatedHistory);
      }
    } catch (err: any) {
      console.error("Client TTS request error:", err);
      setError("Lỗi kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setText(item.text);
    setVoiceName(item.voiceName as "Kore" | "Zephyr");
    setStyle(item.style);
    setCurrentAudio({
      audioBase64: item.audioBase64,
      durationSeconds: item.durationSeconds,
      label: `Giọng Nữ Quảng Bình • ${item.voiceName === "Zephyr" ? "Em Thảo" : "O Lan"}`,
      text: item.text,
    });
  };

  const handleDeleteHistoryItem = (id: string) => {
    const filtered = history.filter((h) => h.id !== id);
    saveHistory(filtered);
    if (currentAudio && history.find((h) => h.id === id)?.text === currentAudio.text) {
      setCurrentAudio(null);
    }
  };

  const handleClearAllHistory = () => {
    saveHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-800 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Accent Guide Accordion - highlights differences from Hue */}
        <QuangBinhAccentGuide />

        {/* Input Panel */}
        <TextInputPanel
          text={text}
          onChangeText={setText}
          selectedVoice={voiceName}
          onChangeVoice={setVoiceName}
          selectedStyle={style}
          onChangeStyle={setStyle}
          onGenerateSpeech={handleGenerateSpeech}
          isLoading={isLoading}
          rateLimitCountdown={rateLimitCountdown}
        />

        {/* Error notification */}
        {error && (
          <div
            id="error-banner"
            className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3 shadow-2xs"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-900">Thông báo</p>
              <p className="leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Active Audio Player */}
        {currentAudio && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 uppercase tracking-wide">
              <Volume2 className="w-3.5 h-3.5 text-amber-700" />
              <span>Bản thu giọng đọc Nữ Quảng Bình hiện tại:</span>
            </div>
            <AudioPlayer
              audioBase64={currentAudio.audioBase64}
              durationSeconds={currentAudio.durationSeconds}
              label={currentAudio.label}
              autoPlay={true}
            />
          </div>
        )}

        {/* History List */}
        <HistoryList
          items={history}
          onSelect={handleSelectHistoryItem}
          onDelete={handleDeleteHistoryItem}
          onClearAll={handleClearAllHistory}
          activeId={history.find((h) => h.text === currentAudio?.text)?.id}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 px-4 text-center text-xs text-stone-500">
        <p>
          Chuyển văn bản thành giọng đọc Nữ người Quảng Bình (Việt Nam) • Chuẩn âm sắc Bắc Trung Bộ • Không phải giọng Huế
        </p>
      </footer>
    </div>
  );
}
