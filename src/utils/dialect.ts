import { DialectWordChange } from "../types";

// Authentic dictionary of Quang Binh vocabulary vs standard Vietnamese
export const QUANG_BINH_DICTIONARY: { original: string; dialect: string; note: string }[] = [
  { original: "bố", dialect: "bọ", note: "Nét đặc trưng riêng biệt nhất của Quảng Bình (không dùng ở Huế)" },
  { original: "ba", dialect: "bọ", note: "Người Quảng Bình gọi bố/ba là Bọ" },
  { original: "mẹ", dialect: "mạ", note: "Gọi mẹ là Mạ" },
  { original: "ở đâu", dialect: "ở mô", note: "Từ hỏi địa điểm phổ biến Bắc Trung Bộ" },
  { original: "đâu", dialect: "mô", note: "Đâu -> Mô" },
  { original: "kia", dialect: "tê", note: "Kia -> Tê (hoặc nớ)" },
  { original: "sao", dialect: "răng", note: "Sao / Thế nào -> Răng" },
  { original: "thế này", dialect: "rứa", note: "Như thế / vậy -> Rứa" },
  { original: "thế", dialect: "rứa", note: "Vậy -> Rứa" },
  { original: "nhìn thấy", dialect: "chộ", note: "Thấy -> Chộ" },
  { original: "thấy", dialect: "chộ", note: "Thấy -> Chộ (Đặc trưng Quảng Bình/Hà Tĩnh)" },
  { original: "cái này", dialect: "cấy ni", note: "Quảng Bình dùng 'cấy ni', khác với Huế hay dùng 'cái ni'" },
  { original: "cái", dialect: "cấy", note: "Cái gì -> Cấy chi" },
  { original: "sân", dialect: "cươi", note: "Sân nhà -> Cươi (Từ cổ đặc sắc Quảng Bình)" },
  { original: "đầu", dialect: "trốc", note: "Đầu óc -> Trốc" },
  { original: "nước", dialect: "nác", note: "Nước uống -> Nác chè" },
  { original: "các bạn", dialect: "tụi bây", note: "Các bạn / chúng mày -> Tụi bây" },
  { original: "bọn mày", dialect: "tụi bây", note: "Xưng hô thân mật dân dã" },
  { original: "hôm nay", dialect: "bữa ni", note: "Hôm nay -> Bữa ni" },
  { original: "bây giờ", dialect: "bây chừ", note: "Bây giờ -> Bây chừ" },
  { original: "không sao", dialect: "không răng", note: "Không sao đâu -> Không răng mô" },
  { original: "nhé", dialect: "hỉ", note: "Cuối câu biểu thị thân thiện: hỉ, nớ" },
  { original: "chứ", dialect: "tề", note: "Nhấn mạnh cuối câu: tê, tề" },
];

/**
 * Converts standard text to authentic Quang Binh vernacular locally
 */
export function convertToQuangBinhDialectLocal(text: string): {
  convertedText: string;
  changes: DialectWordChange[];
} {
  let result = text;
  const changes: DialectWordChange[] = [];

  for (const item of QUANG_BINH_DICTIONARY) {
    // Regex matching whole words (case insensitive, with boundary checking for Vietnamese accents)
    const regex = new RegExp(`(?<=\\s|^|[.,!?])${item.original}(?=[.,!?]|\\s|$)`, "gi");
    if (regex.test(result)) {
      result = result.replace(regex, (match) => {
        // preserve uppercase first letter if present
        const isUpper = match[0] === match[0].toUpperCase() && match[0] !== match[0].toLowerCase();
        const replacement = isUpper
          ? item.dialect.charAt(0).toUpperCase() + item.dialect.slice(1)
          : item.dialect;
        return replacement;
      });
      changes.push({
        original: item.original,
        dialect: item.dialect,
        explanation: item.note,
      });
    }
  }

  return { convertedText: result, changes };
}
