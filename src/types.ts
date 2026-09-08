export type VoiceStyle = "natural" | "expressive" | "news" | "cheerful";

export interface VoiceOption {
  id: string;
  name: string;
  code: "Kore" | "Zephyr";
  description: string;
  tag: string;
}

export interface StyleOption {
  id: VoiceStyle;
  label: string;
  description: string;
  iconName: string;
}

export interface SampleText {
  id: string;
  title: string;
  category: "que-huong" | "tho-ca" | "doi-song" | "lich-su";
  categoryLabel: string;
  text: string;
  description: string;
}

export interface HistoryItem {
  id: string;
  text: string;
  audioBase64: string;
  durationSeconds: number;
  voiceName: string;
  style: VoiceStyle;
  createdAt: number;
}

export interface DialectWordChange {
  original: string;
  dialect: string;
  explanation: string;
}

export interface DialectConversionResponse {
  success: boolean;
  convertedText: string;
  changedWords: DialectWordChange[];
  accentTip?: string;
  error?: string;
}
