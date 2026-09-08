import { HistoryItem } from "../types";
import { Play, Download, Trash2, Clock, Music } from "lucide-react";

interface HistoryListProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  activeId?: string;
}

export default function HistoryList({
  items,
  onSelect,
  onDelete,
  onClearAll,
  activeId,
}: HistoryListProps) {
  if (items.length === 0) {
    return null;
  }

  const formatTimestamp = (time: number) => {
    const d = new Date(time);
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      id="history-list-card"
      className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-stone-500" />
          <h3 className="text-sm font-semibold text-stone-800">
            Lịch sử các đoạn đã đọc ({items.length})
          </h3>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
        >
          Xóa lịch sử
        </button>
      </div>

      <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto pr-1">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <div
              key={item.id}
              className={`py-2.5 px-3 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                isActive ? "bg-amber-50/80 border border-amber-200/70" : "hover:bg-stone-50"
              }`}
            >
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => onSelect(item)}
              >
                <p className="text-xs font-medium text-stone-800 line-clamp-1">
                  {item.text}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                  <span className="font-semibold text-amber-800">
                    {item.voiceName === "Zephyr" ? "Em Thảo" : "O Lan"}
                  </span>
                  <span>•</span>
                  <span>{item.durationSeconds}s</span>
                  <span>•</span>
                  <span>{formatTimestamp(item.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onSelect(item)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-amber-700 text-white"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-200"
                  }`}
                  title="Nghe đoạn này"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
                <a
                  href={
                    item.audioBase64.startsWith("data:")
                      ? item.audioBase64
                      : `data:audio/wav;base64,${item.audioBase64}`
                  }
                  download={`giong-nu-quang-binh-${item.id}.wav`}
                  className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                  title="Tải file WAV"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Xóa khỏi lịch sử"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
