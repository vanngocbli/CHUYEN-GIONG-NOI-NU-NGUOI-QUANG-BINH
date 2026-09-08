import { useState } from "react";
import {
  Sparkles,
  Volume2,
  Trash2,
  Copy,
  Check,
  BookOpen,
  Languages,
  Loader2,
  HeartHandshake,
  Radio,
  FileText,
  Smile,
} from "lucide-react";
import { VoiceStyle, SampleText, VoiceOption, StyleOption } from "../types";
import { SAMPLE_TEXTS } from "../data/samples";
import { convertToQuangBinhDialectLocal } from "../utils/dialect";

interface TextInputPanelProps {
  text: string;
  onChangeText: (val: string) => void;
  selectedVoice: "Kore" | "Zephyr";
  onChangeVoice: (val: "Kore" | "Zephyr") => void;
  selectedStyle: VoiceStyle;
  onChangeStyle: (val: VoiceStyle) => void;
  onGenerateSpeech: () => void;
  isLoading: boolean;
  rateLimitCountdown: number;
}

const VOICES: VoiceOption[] = [
  {
    id: "kore",
    name: "O Lan (Kore)",
    code: "Kore",
    description: "Trầm ấm, mộc mạc, đậm đà chất quê hương Quảng Bình",
    tag: "Khuyên dùng",
  },
  {
    id: "zephyr",
    name: "Em Thảo (Zephyr)",
    code: "Zephyr",
    description: "Trong trẻo, tươi tắn, linh hoạt dứt khoát",
    tag: "Tươi mới",
  },
];

const STYLES: StyleOption[] = [
  {
    id: "natural",
    label: "Mộc mạc tự nhiên",
    description: "Chất giọng đời thường, chân chất miền cát",
    iconName: "HeartHandshake",
  },
  {
    id: "expressive",
    label: "Truyền cảm sâu lắng",
    description: "Đọc thơ ca, tản văn, truyện quê hương",
    iconName: "Sparkles",
  },
  {
    id: "news",
    label: "Rành mạch dứt khoát",
    description: "Thông báo, bản tin, tài liệu rõ ràng",
    iconName: "Radio",
  },
  {
    id: "cheerful",
    label: "Vui tươi thân tình",
    description: "Chào hỏi, trò chuyện rộn ràng",
    iconName: "Smile",
  },
];

export default function TextInputPanel({
  text,
  onChangeText,
  selectedVoice,
  onChangeVoice,
  selectedStyle,
  onChangeStyle,
  onGenerateSpeech,
  isLoading,
  rateLimitCountdown,
}: TextInputPanelProps) {
  const [copied, setCopied] = useState(false);
  const [dialectConverted, setDialectConverted] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleClear = () => {
    onChangeText("");
    setSelectedSampleId(null);
    setDialectConverted(false);
  };

  const handleSelectSample = (sample: SampleText) => {
    onChangeText(sample.text);
    setSelectedSampleId(sample.id);
    setDialectConverted(false);
  };

  const handleConvertDialect = () => {
    if (!text.trim()) return;
    const { convertedText, changes } = convertToQuangBinhDialectLocal(text);
    if (changes.length > 0) {
      onChangeText(convertedText);
      setDialectConverted(true);
      setTimeout(() => setDialectConverted(false), 2500);
    }
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-5">
      {/* Sample texts quick bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5 uppercase tracking-wide">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            Văn bản mẫu đặc trưng xứ Quảng Bình:
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_TEXTS.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all text-left cursor-pointer ${
                  isSelected
                    ? "bg-amber-100/80 border-amber-300 text-amber-900 font-medium shadow-xs"
                    : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700"
                }`}
                title={sample.description}
              >
                <span>{sample.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Text Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="tts-input-textarea" className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-700" />
            Nhập văn bản cần đọc:
          </label>
          <div className="flex items-center gap-2">
            {text.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleConvertDialect}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors cursor-pointer"
                  title="Chuyển các từ thông dụng sang thổ ngữ Quảng Bình (như bọ, mạ, mô, tê, răng, rứa, chộ...)"
                >
                  <Languages className="w-3 h-3 text-amber-700" />
                  <span>{dialectConverted ? "Đã chuyển thổ ngữ" : "Thêm thổ ngữ QB"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                  title="Sao chép văn bản"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  title="Xóa nội dung"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="relative">
          <textarea
            id="tts-input-textarea"
            rows={5}
            value={text}
            onChange={(e) => {
              onChangeText(e.target.value);
              setSelectedSampleId(null);
            }}
            placeholder="Nhập hoặc dán văn bản tiếng Việt vào đây (ví dụ: 'Chào o, chào mạ, bữa ni trời nắng ráo bọ mạ có đi làm đồng không rứa?')..."
            className="w-full p-3.5 text-sm bg-stone-50/50 hover:bg-stone-50 focus:bg-white text-stone-900 placeholder:text-stone-400 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all resize-y leading-relaxed font-sans"
            maxLength={2000}
          />
          <div className="absolute bottom-2.5 right-3 text-[11px] font-mono text-stone-400 pointer-events-none">
            {text.length}/2000 ký tự
          </div>
        </div>
      </div>

      {/* Voice Selection & Style Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Voice persona */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-700 block">
            Chọn giọng đọc Nữ Quảng Bình:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {VOICES.map((v) => {
              const isSelected = selectedVoice === v.code;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onChangeVoice(v.code)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-amber-600 bg-amber-50/70 ring-1 ring-amber-600"
                      : "border-stone-200 hover:border-stone-300 bg-stone-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-900">{v.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">
                      {v.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-tight">
                    {v.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Emotion / Tone Style */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-700 block">
            Sắc thái & Ngữ điệu:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STYLES.map((st) => {
              const isSelected = selectedStyle === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onChangeStyle(st.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-amber-600 bg-amber-50/70 ring-1 ring-amber-600"
                      : "border-stone-200 hover:border-stone-300 bg-stone-50/40"
                  }`}
                >
                  <div className="text-xs font-medium text-stone-900 leading-snug">
                    {st.label}
                  </div>
                  <div className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                    {st.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          id="generate-speech-btn"
          type="button"
          disabled={isLoading || !text.trim() || rateLimitCountdown > 0}
          onClick={onGenerateSpeech}
          className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all duration-200 cursor-pointer ${
            isLoading || rateLimitCountdown > 0
              ? "bg-stone-300 text-stone-600 cursor-not-allowed"
              : !text.trim()
              ? "bg-stone-200 text-stone-400 cursor-not-allowed"
              : "bg-amber-700 hover:bg-amber-800 text-white active:scale-[0.99] shadow-amber-900/10"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Đang tổng hợp giọng nói Nữ Quảng Bình...</span>
            </>
          ) : rateLimitCountdown > 0 ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
              <span>Đang hồi phục lượt gọi ({rateLimitCountdown}s)...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>Đọc Văn Bản (Giọng Nữ Quảng Bình)</span>
            </>
          )}
        </button>

        {rateLimitCountdown > 0 && (
          <p className="text-center text-xs text-amber-800 bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-200 mt-2">
            Hệ thống đang chờ hồi lượt gọi theo định mức miễn phí ({rateLimitCountdown}s). Bạn có thể bấm nghe lại các đoạn đã tạo bên dưới mà không mất lượt!
          </p>
        )}
      </div>
    </div>
  );
}
