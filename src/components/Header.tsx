import { Mic2, MapPin, Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-xs sticky top-0 z-30 shadow-2xs">
      <div className="max-w-4xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-700 text-white flex items-center justify-center shadow-xs">
            <Mic2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                Chuyển Văn Bản Giọng Nữ Quảng Bình
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Chuẩn âm sắc Quảng Bình
              </span>
            </div>
            <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-amber-700" />
              <span>Bắc Trung Bộ • Ngữ điệu mộc mạc, dứt khoát, không phải giọng Huế</span>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200/80">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span className="font-medium">Chất giọng nữ mộc mạc miền cát trắng</span>
        </div>
      </div>
    </header>
  );
}
