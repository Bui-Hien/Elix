/**
 * Lunar Calendar Utility
 * Chuyển đổi Âm lịch ↔ Dương lịch + Can Chi
 * Based on Vietnamese lunar calendar algorithms
 */

// ─── Thiên Can (天干) ─────────────────────────────────────────────
export const THIEN_CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];

// ─── Địa Chi (地支) ──────────────────────────────────────────────
export const DIA_CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

// ─── Con giáp theo Địa Chi ──────────────────────────────────────
export const CON_GIAP = ['🐀', '🐂', '🐅', '🐈', '🐉', '🐍', '🐴', '🐐', '🐒', '🐓', '🐕', '🐷'];

// ─── Ngũ Hành ───────────────────────────────────────────────────
export const NGU_HANH = ['Kim', 'Thủy', 'Hỏa', 'Thổ', 'Mộc'];

// ─── 12 Canh Giờ ────────────────────────────────────────────────
export interface CanhGio {
    id: string;
    name: string;     // Tý, Sửu...
    emoji: string;    // 🐀, 🐂...
    range: string;    // 23:00 - 01:00
    startHour: number;
    endHour: number;
    description: string;
}

export const CANH_GIO: CanhGio[] = [
    { id: 'ty', name: 'Tý', emoji: '🐀', range: '23:00 - 01:00', startHour: 23, endHour: 1, description: 'Giờ chuột — linh hoạt, thông minh' },
    { id: 'suu', name: 'Sửu', emoji: '🐂', range: '01:00 - 03:00', startHour: 1, endHour: 3, description: 'Giờ trâu — cần mẫn, bền bỉ' },
    { id: 'dan', name: 'Dần', emoji: '🐅', range: '03:00 - 05:00', startHour: 3, endHour: 5, description: 'Giờ hổ — dũng mãnh, uy quyền' },
    { id: 'mao', name: 'Mão', emoji: '🐈', range: '05:00 - 07:00', startHour: 5, endHour: 7, description: 'Giờ mèo — nhạy bén, uyển chuyển' },
    { id: 'thin', name: 'Thìn', emoji: '🐉', range: '07:00 - 09:00', startHour: 7, endHour: 9, description: 'Giờ rồng — cao quý, quyền lực' },
    { id: 'ty2', name: 'Tỵ', emoji: '🐍', range: '09:00 - 11:00', startHour: 9, endHour: 11, description: 'Giờ rắn — khôn ngoan, sâu sắc' },
    { id: 'ngo', name: 'Ngọ', emoji: '🐴', range: '11:00 - 13:00', startHour: 11, endHour: 13, description: 'Giờ ngựa — năng động, nhiệt huyết' },
    { id: 'mui', name: 'Mùi', emoji: '🐐', range: '13:00 - 15:00', startHour: 13, endHour: 15, description: 'Giờ dê — hòa nhã, nghệ thuật' },
    { id: 'than', name: 'Thân', emoji: '🐒', range: '15:00 - 17:00', startHour: 15, endHour: 17, description: 'Giờ khỉ — nhanh nhẹn, sáng tạo' },
    { id: 'dau', name: 'Dậu', emoji: '🐓', range: '17:00 - 19:00', startHour: 17, endHour: 19, description: 'Giờ gà — chính xác, kỷ luật' },
    { id: 'tuat', name: 'Tuất', emoji: '🐕', range: '19:00 - 21:00', startHour: 19, endHour: 21, description: 'Giờ chó — trung thành, nghĩa khí' },
    { id: 'hoi', name: 'Hợi', emoji: '🐷', range: '21:00 - 23:00', startHour: 21, endHour: 23, description: 'Giờ heo — phúc hậu, hào phóng' },
];

// ─── Lunar Calendar Data (1900-2100) ────────────────────────────
// Each year encoded as hex: bits encode months (29 or 30 days), leap month, etc.
const LUNAR_DATA = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
    0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
    0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
    0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
    0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a4d0, 0x0d150, 0x0f252,
    0x0d520,
];

/** Get days in a lunar month */
function lunarMonthDays(year: number, month: number): number {
    if (month > 12 || month < 1) return 0;
    return (LUNAR_DATA[year - 1900] & (0x10000 >> month)) ? 30 : 29;
}

/** Get leap month for a lunar year (0 = no leap) */
function leapMonth(year: number): number {
    return LUNAR_DATA[year - 1900] & 0xf;
}

/** Get days in leap month */
function leapDays(year: number): number {
    if (leapMonth(year)) {
        return (LUNAR_DATA[year - 1900] & 0x10000) ? 30 : 29;
    }
    return 0;
}

/** Get total days in a lunar year */
function lunarYearDays(year: number): number {
    let sum = 348; // 12 * 29
    for (let i = 0x8000; i > 0x8; i >>= 1) {
        sum += (LUNAR_DATA[year - 1900] & i) ? 1 : 0;
    }
    return sum + leapDays(year);
}

/**
 * Convert Solar date → Lunar date
 */
export function solarToLunar(solarYear: number, solarMonth: number, solarDay: number) {
    // Base: Jan 31, 1900 = Lunar 1/1/1900 (Canh Tý)
    const baseDate = new Date(1900, 0, 31);
    const targetDate = new Date(solarYear, solarMonth - 1, solarDay);
    let offset = Math.floor((targetDate.getTime() - baseDate.getTime()) / 86400000);

    let lunarYear = 1900;
    let yearDays: number;
    for (let i = 1900; i < 2101 && offset > 0; i++) {
        yearDays = lunarYearDays(i);
        offset -= yearDays;
        lunarYear++;
    }
    if (offset < 0) {
        offset += lunarYearDays(--lunarYear);
    }

    const leap = leapMonth(lunarYear);
    let isLeap = false;
    let lunarMonth = 1;
    let monthDays: number;

    for (let i = 1; i <= 13 && offset > 0; i++) {
        if (leap > 0 && i === leap + 1 && !isLeap) {
            i--;
            isLeap = true;
            monthDays = leapDays(lunarYear);
        } else {
            monthDays = lunarMonthDays(lunarYear, i);
        }
        if (isLeap && i === leap + 1) {
            isLeap = false;
        }
        offset -= monthDays;
        if (!isLeap) lunarMonth++;
    }

    if (offset === 0 && leap > 0 && lunarMonth === leap + 1) {
        if (isLeap) {
            isLeap = false;
        } else {
            isLeap = true;
            lunarMonth--;
        }
    }
    if (offset < 0) {
        offset += monthDays!;
        lunarMonth--;
    }

    const lunarDay = offset + 1;

    return {
        year: lunarYear,
        month: lunarMonth,
        day: lunarDay,
        isLeap,
    };
}

/**
 * Convert Lunar date → Solar date
 */
export function lunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number, isLeapMonth = false): Date {
    const leap = leapMonth(lunarYear);

    // Sum days from 1900 to lunarYear
    let offset = 0;
    for (let i = 1900; i < lunarYear; i++) {
        offset += lunarYearDays(i);
    }

    // Sum days in months before lunarMonth
    for (let i = 1; i < lunarMonth; i++) {
        offset += lunarMonthDays(lunarYear, i);
        if (i === leap) {
            offset += leapDays(lunarYear);
        }
    }

    // Add leap month days if target is after leap month
    if (isLeapMonth && lunarMonth === leap) {
        offset += lunarMonthDays(lunarYear, lunarMonth);
    }

    offset += lunarDay - 1;

    const baseDate = new Date(1900, 0, 31);
    return new Date(baseDate.getTime() + offset * 86400000);
}

/**
 * Get Can Chi for a year
 */
export function getCanChiYear(lunarYear: number): string {
    const canIdx = (lunarYear - 4) % 10;
    const chiIdx = (lunarYear - 4) % 12;
    return `${THIEN_CAN[canIdx]} ${DIA_CHI[chiIdx]}`;
}

/**
 * Get con giáp emoji for a year
 */
export function getConGiap(lunarYear: number): string {
    const chiIdx = (lunarYear - 4) % 12;
    return CON_GIAP[chiIdx];
}

/**
 * Convert CanhGio selection to TimeSpan string for API
 */
export function canhGioToTimeSpan(canhGio: CanhGio): string {
    // Use the middle of the range
    const mid = canhGio.startHour === 23
        ? '00:00:00'  // Tý = midnight
        : `${String(canhGio.startHour + 1).padStart(2, '0')}:00:00`;
    return mid;
}

/**
 * Get Ngũ Hành (element) from last digit of birth year
 */
export function getNguHanhFromYear(year: number): string {
    const lastDigit = year % 10;
    if (lastDigit === 0 || lastDigit === 1) return 'Kim';
    if (lastDigit === 2 || lastDigit === 3) return 'Thủy';
    if (lastDigit === 4 || lastDigit === 5) return 'Hỏa';
    if (lastDigit === 6 || lastDigit === 7) return 'Thổ';
    return 'Mộc'; // 8, 9
}

/** Lunar month names */
export const LUNAR_MONTHS = [
    'Tháng Giêng', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư',
    'Tháng Năm', 'Tháng Sáu', 'Tháng Bảy', 'Tháng Tám',
    'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Chạp',
];
