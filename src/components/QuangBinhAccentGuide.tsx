import { useState } from "react";
import { Info, Sparkles, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { ACCENT_COMPARISON_INFO } from "../data/samples";

export default function QuangBinhAccentGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      id="accent-guide-card"
      className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs transition-all duration-200"
    >
      <button
        id="toggle-accent-guide-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-stone-50/80 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              Đặc Trưng Giọng Nữ Quảng Bình (Bắc Trung Bộ)
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                Phân biệt với giọng Huế
              </span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Khám phá ngữ điệu dứt khoát, mộc mạc và những nét độc nhất của thổ ngữ Quảng Bình
            </p>
          </div>
        </div>
        <div className="text-stone-400 pl-2">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-stone-100 space-y-4 text-xs text-stone-700">
          {/* Highlight note */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-stone-900">
                Lưu ý quan trọng theo yêu cầu của bạn:
              </p>
              <p className="text-stone-600 leading-relaxed">
                Giọng Quảng Bình thuộc vùng thổ ngữ <strong>Bắc Trung Bộ</strong>, nằm giữa Hà Tĩnh và Quảng Trị. 
                Khác biệt rõ rệt nhất với <strong>giọng Huế</strong> là giọng Quảng Bình có âm sắc khỏe khoắn, mộc mạc, 
                tiếng nói dứt khoát dồn lực từ lồng ngực, không ngân dài luyến láy âm vần hay thói quen dạ thưa nhẹ nhàng kiểu cung đình Huế.
              </p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100/80 text-stone-800 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3 w-1/4">Yếu tố phân biệt</th>
                  <th className="py-2.5 px-3 w-3/8 text-amber-900 bg-amber-50/50">
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Giọng Nữ Quảng Bình (Ứng dụng tập trung)
                    </span>
                  </th>
                  <th className="py-2.5 px-3 w-3/8 text-stone-500">
                    <span className="flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      Giọng Huế (Không sử dụng)
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-600">
                {ACCENT_COMPARISON_INFO.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-stone-50/40"}>
                    <td className="py-2.5 px-3 font-medium text-stone-900">{row.feature}</td>
                    <td className="py-2.5 px-3 text-stone-800 bg-amber-50/20 font-normal leading-relaxed">
                      {row.quangBinh}
                    </td>
                    <td className="py-2.5 px-3 text-stone-500 leading-relaxed">
                      {row.hue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Special Quang Binh Word Tags */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
              Từ ngữ đặc sắc Quảng Bình
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { word: "Bọ", mean: "Cha / Ba (Chỉ Quảng Bình dùng)" },
                { word: "Mạ", mean: "Mẹ" },
                { word: "O", mean: "Cô / Bác gái" },
                { word: "Mô", mean: "Đâu" },
                { word: "Tê", mean: "Kia" },
                { word: "Răng", mean: "Sao" },
                { word: "Rứa", mean: "Thế" },
                { word: "Cấy ni", mean: "Cái này" },
                { word: "Chộ", mean: "Thấy / Nhìn" },
                { word: "Cươi", mean: "Sân nhà" },
                { word: "Trốc", mean: "Đầu" },
                { word: "Nác", mean: "Nước" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="px-2 py-1 bg-stone-100 rounded-lg text-stone-800 border border-stone-200 flex items-center gap-1.5"
                >
                  <span className="font-bold text-amber-800">{item.word}</span>
                  <span className="text-[11px] text-stone-500">({item.mean})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
