/**
 * Utility for calculating "Nạp Âm" (Melody Element) based on birth year.
 * Data synchronized with ConsultationService.cs
 */

export interface FateInfo {
  canChi: string;
  napAmName: string;
  element: string;
}

const NAP_AM_MAP: Record<number, FateInfo> = {
  0: { canChi: "Giáp Tý", napAmName: "Hải Trung Kim", element: "Kim" },
  1: { canChi: "Ất Sửu", napAmName: "Hải Trung Kim", element: "Kim" },
  2: { canChi: "Bính Dần", napAmName: "Lư Trung Hỏa", element: "Hoa" },
  3: { canChi: "Đinh Mão", napAmName: "Lư Trung Hỏa", element: "Hoa" },
  4: { canChi: "Mậu Thìn", napAmName: "Đại Lâm Mộc", element: "Moc" },
  5: { canChi: "Kỷ Tỵ", napAmName: "Đại Lâm Mộc", element: "Moc" },
  6: { canChi: "Canh Ngọ", napAmName: "Lộ Bàng Thổ", element: "Tho" },
  7: { canChi: "Tân Mùi", napAmName: "Lộ Bàng Thổ", element: "Tho" },
  8: { canChi: "Nhâm Thân", napAmName: "Kiếm Phong Kim", element: "Kim" },
  9: { canChi: "Quý Dậu", napAmName: "Kiếm Phong Kim", element: "Kim" },
  10: { canChi: "Giáp Tuất", napAmName: "Sơn Đầu Hỏa", element: "Hoa" },
  11: { canChi: "Ất Hợi", napAmName: "Sơn Đầu Hỏa", element: "Hoa" },
  12: { canChi: "Bính Tý", napAmName: "Giản Hạ Thủy", element: "Thuy" },
  13: { canChi: "Đinh Sửu", napAmName: "Giản Hạ Thủy", element: "Thuy" },
  14: { canChi: "Mậu Dần", napAmName: "Thành Đầu Thổ", element: "Tho" },
  15: { canChi: "Kỷ Mão", napAmName: "Thành Đầu Thổ", element: "Tho" },
  16: { canChi: "Canh Thìn", napAmName: "Bạch Lạp Kim", element: "Kim" },
  17: { canChi: "Tân Tỵ", napAmName: "Bạch Lạp Kim", element: "Kim" },
  18: { canChi: "Nhâm Ngọ", napAmName: "Dương Liễu Mộc", element: "Moc" },
  19: { canChi: "Quý Mùi", napAmName: "Dương Liễu Mộc", element: "Moc" },
  20: { canChi: "Giáp Thân", napAmName: "Tuyền Trung Thủy", element: "Thuy" },
  21: { canChi: "Ất Dậu", napAmName: "Tuyền Trung Thủy", element: "Thuy" },
  22: { canChi: "Bính Tuất", napAmName: "Ốc Thượng Thổ", element: "Tho" },
  23: { canChi: "Đinh Hợi", napAmName: "Ốc Thượng Thổ", element: "Tho" },
  24: { canChi: "Mậu Tý", napAmName: "Tích Lịch Hỏa", element: "Hoa" },
  25: { canChi: "Kỷ Sửu", napAmName: "Tích Lịch Hỏa", element: "Hoa" },
  26: { canChi: "Canh Dần", napAmName: "Tùng Bách Mộc", element: "Moc" },
  27: { canChi: "Tân Mão", napAmName: "Tùng Bách Mộc", element: "Moc" },
  28: { canChi: "Nhâm Thìn", napAmName: "Trường Lưu Thủy", element: "Thuy" },
  29: { canChi: "Quý Tỵ", napAmName: "Trường Lưu Thủy", element: "Thuy" },
  30: { canChi: "Giáp Ngọ", napAmName: "Sa Trung Kim", element: "Kim" },
  31: { canChi: "Ất Mùi", napAmName: "Sa Trung Kim", element: "Kim" },
  32: { canChi: "Bính Thân", napAmName: "Sơn Hạ Hỏa", element: "Hoa" },
  33: { canChi: "Đinh Dậu", napAmName: "Sơn Hạ Hỏa", element: "Hoa" },
  34: { canChi: "Mậu Tuất", napAmName: "Bình Địa Mộc", element: "Moc" },
  35: { canChi: "Kỷ Hợi", napAmName: "Bình Địa Mộc", element: "Moc" },
  36: { canChi: "Canh Tý", napAmName: "Bích Thượng Thổ", element: "Tho" },
  37: { canChi: "Tân Sửu", napAmName: "Bích Thượng Thổ", element: "Tho" },
  38: { canChi: "Nhâm Dần", napAmName: "Kim Bạch Kim", element: "Kim" },
  39: { canChi: "Quý Mão", napAmName: "Kim Bạch Kim", element: "Kim" },
  40: { canChi: "Giáp Thìn", napAmName: "Phú Đăng Hỏa", element: "Hoa" },
  41: { canChi: "Ất Tỵ", napAmName: "Phú Đăng Hỏa", element: "Hoa" },
  42: { canChi: "Bính Ngọ", napAmName: "Thiên Hà Thủy", element: "Thuy" },
  43: { canChi: "Đinh Mùi", napAmName: "Thiên Hà Thủy", element: "Thuy" },
  44: { canChi: "Mậu Thân", napAmName: "Đại Trạch Thổ", element: "Tho" },
  45: { canChi: "Kỷ Dậu", napAmName: "Đại Trạch Thổ", element: "Tho" },
  46: { canChi: "Canh Tuất", napAmName: "Thoa Xuyến Kim", element: "Kim" },
  47: { canChi: "Tân Hợi", napAmName: "Thoa Xuyến Kim", element: "Kim" },
  48: { canChi: "Nhâm Tý", napAmName: "Tang Đố Mộc", element: "Moc" },
  49: { canChi: "Quý Sửu", napAmName: "Tang Đố Mộc", element: "Moc" },
  50: { canChi: "Giáp Dần", napAmName: "Đại Khê Thủy", element: "Thuy" },
  51: { canChi: "Ất Mão", napAmName: "Đại Khê Thủy", element: "Thuy" },
  52: { canChi: "Bính Thìn", napAmName: "Sa Trung Thổ", element: "Tho" },
  53: { canChi: "Đinh Tỵ", napAmName: "Sa Trung Thổ", element: "Tho" },
  54: { canChi: "Mậu Ngọ", napAmName: "Thiên Thượng Hỏa", element: "Hoa" },
  55: { canChi: "Kỷ Mùi", napAmName: "Thiên Thượng Hỏa", element: "Hoa" },
  56: { canChi: "Canh Thân", napAmName: "Thạch Lựu Mộc", element: "Moc" },
  57: { canChi: "Tân Dậu", napAmName: "Thạch Lựu Mộc", element: "Moc" },
  58: { canChi: "Nhâm Tuất", napAmName: "Đại Hải Thủy", element: "Thuy" },
  59: { canChi: "Quý Hợi", napAmName: "Đại Hải Thủy", element: "Thuy" }
};

export function getFateByYear(year: number): FateInfo {
  const baseYear = 1984; // Giáp Tý
  const cycleIndex = ((year - baseYear) % 60 + 60) % 60;
  return NAP_AM_MAP[cycleIndex];
}
