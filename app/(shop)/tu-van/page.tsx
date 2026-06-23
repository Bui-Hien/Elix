'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2, Sparkles, Heart, DollarSign, Briefcase, Shield, BookOpen,
  ChevronRight, ChevronLeft, CalendarDays, Clock, Star, ArrowRight,
  Sun, Moon, Check, Zap, HelpCircle, Volume2, VolumeX
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { consultationApi } from '@/lib/api/consultation';
import { productsApi } from '@/lib/api/products';
import { formatPrice } from '@/lib/utils';
import {
  CANH_GIO, canhGioToTimeSpan, solarToLunar, lunarToSolar,
  getCanChiYear, getConGiap, LUNAR_MONTHS, CanhGio,
} from '@/lib/lunar-calendar';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/product/product-card';
import { useProducts } from '@/hooks/use-products';
import { useWishlist } from '@/hooks/use-wishlist';
import { useAppSelector } from '@/lib/redux/hooks';
import { useRouter } from 'next/navigation';

// ─── Purposes (will be fetched from API) ──────────────────────────
interface Purpose {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  gradient: string;
}

const GRADIENT_MAP: Record<string, string> = {
  "from-red-500 to-pink-500": "linear-gradient(to right, #ef4444, #ec4899)",
  "from-yellow-400 to-orange-500": "linear-gradient(to right, #fbbf24, #f97316)",
  "from-blue-500 to-cyan-500": "linear-gradient(to right, #3b82f6, #06b6d4)",
  "from-purple-500 to-indigo-600": "linear-gradient(to right, #a855f7, #4f46e5)",
  "from-green-400 to-emerald-600": "linear-gradient(to right, #4ade80, #059669)",
  "from-amber-500 to-orange-600": "linear-gradient(to right, #f59e0b, #ea580c)",
  "from-pink-400 to-rose-600": "linear-gradient(to right, #f472b6, #e11d48)",
  "from-slate-700 to-slate-900": "linear-gradient(to right, #334155, #0f172a)",
  "from-indigo-500 to-purple-600": "linear-gradient(to right, #6366f1, #9333ea)",
  "from-cyan-400 to-blue-500": "linear-gradient(to right, #22d3ee, #3b82f6)",
  "from-rose-500 to-orange-500": "linear-gradient(to right, #f43f5e, #f97316)",
  "from-teal-400 to-emerald-500": "linear-gradient(to right, #2dd4bf, #10b981)",
  "from-violet-500 to-purple-500": "linear-gradient(to right, #8b5cf6, #a855f7)",
}

const getGradientStyle = (gradientStr: string) => {
  if (GRADIENT_MAP[gradientStr]) return GRADIENT_MAP[gradientStr];
  try {
    const parts = gradientStr.split(' ');
    if (parts.length >= 2) {
      return `linear-gradient(to bottom right, var(--${parts[0].replace('from-', '')}, #ccc), var(--${parts[1].replace('to-', '')}, #999))`;
    }
  } catch (e) { }
  return '#eee';
}

const IconRenderer = ({ name, size = 24 }: { name: string, size?: number }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <HelpCircle size={size} />;
  return <IconComponent size={size} />;
}

// ─── NGU HANH CONFIG ────────────────────────────────────────────
const NGU_HANH_COLORS: Record<string, {
  bgColor: string;
  textColor: string;
  borderColor: string;
  gradientFrom: string;
  gradientTo: string;
  pageBgFrom: string;
  pageBgVia: string;
  pageBgTo: string;
}> = {
  'Kim': {
    bgColor: '#E0E4E8',
    textColor: '#374151',
    borderColor: '#D1D5DB',
    gradientFrom: '#9CA3AF',
    gradientTo: '#64748B',
    pageBgFrom: '#E0E4E8',
    pageBgVia: '#F3F4F6',
    pageBgTo: '#F9FAFB',
  },
  'Mộc': {
    bgColor: '#C2D5BB',
    textColor: '#15803D',
    borderColor: '#86EFAC',
    gradientFrom: '#4ADE80',
    gradientTo: '#10B981',
    pageBgFrom: '#C2D5BB',
    pageBgVia: '#DCFCE7',
    pageBgTo: '#F0FDF4',
  },
  'Thủy': {
    bgColor: '#B2C7D9',
    textColor: '#1E40AF',
    borderColor: '#93C5FD',
    gradientFrom: '#60A5FA',
    gradientTo: '#06B6D4',
    pageBgFrom: '#B2C7D9',
    pageBgVia: '#DBEAFE',
    pageBgTo: '#EFF6FF',
  },
  'Hỏa': {
    bgColor: '#EFBDB0',
    textColor: '#B91C1C',
    borderColor: '#FCA5A5',
    gradientFrom: '#F87171',
    gradientTo: '#FB923C',
    pageBgFrom: '#EFBDB0',
    pageBgVia: '#FEE2E2',
    pageBgTo: '#FEF2F2',
  },
  'Thổ': {
    bgColor: '#DCCEB0',
    textColor: '#A16207',
    borderColor: '#FDE047',
    gradientFrom: '#FACC15',
    gradientTo: '#F59E0B',
    pageBgFrom: '#DCCEB0',
    pageBgVia: '#FEF3C7',
    pageBgTo: '#FFFBEB',
  },
};

const NGU_HANH_ICONS: Record<string, string> = {
  'Kim': '⚪', 'Mộc': '🌳', 'Thủy': '💧', 'Hỏa': '🔥', 'Thổ': '⛰️',
};

// ─── Types ──────────────────────────────────────────────────────
interface ConsultationResult {
  element: string;
  napAmName: string;
  menhKhuyet?: string;
  elementDescription: string;
  menhKhuyetDescription?: string;
  supportiveElement: string;
  supportiveElementDescription: string;
  analysis: string;
  batTuSummary?: string;
  dayMaster?: string;
  dayMasterDescription?: string;
  strongElements: string[];
  weakElements: string[];
  recommendedBracelets: Array<{
    productId: number;
    name: string;
    price: number;
    imageUrl?: string;
    reason: string;
    compatibilityScore: number;
  }>;
  luckyColors: string[];
  avoidColors: string[];
  advice: string;
  elementEnergyPercentages?: Record<string, number>;
  positiveTraits?: Array<{ title: string; description: string; }>;
  negativeTraits?: Array<{ title: string; description: string; }>;
  soundUrl?: string;
  // New: Pre-written deficit data from DB
  deficitTitle?: string;
  deficitWeakDescription?: string;
  deficitWeakSymptoms?: Array<{ title: string; description: string; }>;
  deficitCompensationTitle?: string;
  deficitCompensationDescription?: string;
  deficitCompensationBenefits?: Array<{ title: string; description: string; }>;
  deficitRecommendedStones?: Array<{ name: string; description: string; }>;
}

const PurposeRelatedProducts = ({ purposeIds }: { purposeIds: number[] }) => {
  const { products, isLoading } = useProducts({
    purposeIds,
    pageSize: 8,
    sort: 'newest'
  });

  if (isLoading) {
    return (
      <div className="mt-12 bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-amber-100 shadow-sm animate-in fade-in duration-700">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          Đang tìm sản phẩm phù hợp cho bạn...
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] rounded-2xl bg-gray-200 animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isLoading && products.length === 0) {
    return (
      <div className="mt-12 bg-white/50 backdrop-blur-sm rounded-3xl p-10 border border-gray-100 text-center animate-in fade-in duration-500">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
          <Sparkles className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Hệ thống đang cập nhật sản phẩm cho mục tiêu này
        </h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Chúng tôi sẽ sớm bổ sung các mẫu vòng tay phù hợp với mong muốn của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 bg-gradient-to-b from-amber-50/30 to-white rounded-3xl p-8 border border-amber-100/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Vòng phong thủy gợi ý cho bạn
          </h3>
          <p className="text-gray-500 mt-1">Dựa trên mục tiêu bạn đã chọn</p>
        </div>
        <div className="h-px flex-1 bg-amber-100 hidden md:block mx-8" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map(product => (
          <div key={product.id} className="hover:translate-y-[-4px] transition-transform duration-300">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Add useEffect for scrolling to products
const ProductScroller = ({ show }: { show: boolean }) => {
  useEffect(() => {
    if (show) {
      const el = document.getElementById('purpose-products-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [show]);
  return null;
};

// ─── Main Component ─────────────────────────────────────────────
export default function ConsultationPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [availablePurposes, setAvailablePurposes] = useState<Purpose[]>([]);
  const [isLoadingPurposes, setIsLoadingPurposes] = useState(true);
  const { wishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  // Setup initial data after mount to avoid hydration mismatch
  const [currentYear, setCurrentYear] = useState(2024);
  const [maxDate, setMaxDate] = useState('2024-12-31');

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setMaxDate(now.toISOString().split('T')[0]);

    // Fetch purposes
    const fetchPurposes = async () => {
      try {
        const data = await consultationApi.getGoals();
        setAvailablePurposes(data);
      } catch (error) {
        console.error('Failed to fetch purposes:', error);
        toast.error('Không thể tải danh sách mục đích');
      } finally {
        setIsLoadingPurposes(false);
      }
    };
    fetchPurposes();
  }, []);

  // Calendar mode
  const [calendarMode, setCalendarMode] = useState<'solar' | 'lunar'>('solar');

  // Solar date
  const [solarDay, setSolarDay] = useState(new Date().getDate());
  const [solarMonth, setSolarMonth] = useState(new Date().getMonth() + 1);
  const [solarYear, setSolarYear] = useState(new Date().getFullYear());
  const [solarDate, setSolarDate] = useState(''); // Deprecated, will be removed

  // Lunar date
  const [lunarDay, setLunarDay] = useState(1);
  const [lunarMonth, setLunarMonth] = useState(1);
  const [lunarYear, setLunarYear] = useState(2000);

  // Birth hour
  const [selectedCanhGio, setSelectedCanhGio] = useState<CanhGio | null>(null);
  const [noTimeKnown, setNoTimeKnown] = useState(false);
  const [noBirthDateKnown, setNoBirthDateKnown] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('male'); // New: Gender state

  // Result
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ConsultationResult | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Array<{product: any, score: number}>>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Stable percentages to avoid jumping numbers on re-renders
  const energyPercentages = useMemo(() => {
    if (!result) return {};
    return {
      'Mộc': result.elementEnergyPercentages?.['Mộc'] ?? (Math.floor(Math.random() * 25) + 10),
      'Hỏa': result.elementEnergyPercentages?.['Hỏa'] ?? (Math.floor(Math.random() * 25) + 10),
      'Thổ': result.elementEnergyPercentages?.['Thổ'] ?? (Math.floor(Math.random() * 25) + 10),
      'Kim': result.elementEnergyPercentages?.['Kim'] ?? (Math.floor(Math.random() * 25) + 10),
      'Thủy': result.elementEnergyPercentages?.['Thủy'] ?? (Math.floor(Math.random() * 25) + 10),
    };
  }, [result]);

  // Fetch full product data for recommended bracelets
  useEffect(() => {
    if (!result || !result.recommendedBracelets || result.recommendedBracelets.length === 0) {
      setRecommendedProducts([]);
      return;
    }
    const fetchProducts = async () => {
      try {
        const promises = result.recommendedBracelets.map(b =>
          productsApi.getById(b.productId)
            .then(p => ({ product: p, score: b.compatibilityScore }))
            .catch(() => null)
        );
        const results = await Promise.all(promises);
        setRecommendedProducts(results.filter((r): r is {product: any, score: number} => r !== null));
      } catch (e) {
        console.error('Failed to fetch recommended products:', e);
      }
    };
    fetchProducts();
  }, [result]);

  /*
  // Play sound when result is received
  useEffect(() => {
    if (result?.soundUrl) {
      // Clean up previous audio if any
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(result.soundUrl);
      audio.loop = true;
      audioRef.current = audio;

      audio.play().then(() => {
        setIsAudioPlaying(true);
      }).catch(err => {
        console.error("Audio playback failed:", err);
        setIsAudioPlaying(false);
      });

      return () => {
        audio.pause();
        audio.src = '';
      };
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsAudioPlaying(false);
    }
  }, [result]);
  */

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsAudioPlaying(true);
      }).catch(err => {
        console.error("Audio play failed:", err);
        toast.error("Không thể phát nhạc. Vui lòng thử lại.");
      });
    }
  };

  // ── Lunar year info ───────────────────────────────────────────
  const lunarYearInfo = useMemo(() => {
    if (calendarMode === 'lunar') {
      return {
        canChi: getCanChiYear(lunarYear),
        conGiap: getConGiap(lunarYear),
      };
    }
    if (calendarMode === 'solar' && solarYear && solarMonth && solarDay) {
      const lunar = solarToLunar(solarYear, solarMonth, solarDay);
      return {
        canChi: getCanChiYear(lunar.year),
        conGiap: getConGiap(lunar.year),
      };
    }
    return null;
  }, [calendarMode, lunarYear, solarYear, solarMonth, solarDay]);

  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentYear; y >= 1940; y--) {
      years.push({ value: y, label: `${y} (${getCanChiYear(y)})` });
    }
    return years;
  }, [currentYear]);

  // ── Step 2 → submit ──────────────────────────────────────────
  const handleAnalyze = async () => {
    let birthDateISO: string;
    let birthTimeStr: string | undefined;

    if (noBirthDateKnown) {
      // Use a default date (e.g., Jan 1 of the year user selected or current year)
      // Use UTC to avoid timezone issues
      birthDateISO = new Date(Date.UTC(lunarYear, 0, 1)).toISOString();
    } else if (calendarMode === 'solar') {
      birthDateISO = new Date(Date.UTC(solarYear, solarMonth - 1, solarDay)).toISOString();
    } else {
      const solarDt = lunarToSolar(lunarYear, lunarMonth, lunarDay);
      birthDateISO = solarDt.toISOString();
    }

    if (!noTimeKnown && selectedCanhGio) {
      birthTimeStr = canhGioToTimeSpan(selectedCanhGio);
    }

    setIsAnalyzing(true);
    try {
      const res = await consultationApi.analyze({
        birthDate: birthDateISO,
        birthTime: birthTimeStr,
        gender: gender,
      });

      // Validate critical fields (all set by backend, should always exist)
      const isComplete = res.element 
        && res.napAmName 
        && res.menhKhuyet;

      if (!isComplete) {
        console.warn('Incomplete result:', res);
        toast.error('Kết quả chưa đầy đủ, vui lòng thử lại.');
        return;
      }

      setResult(res);
      setStep(2);
      toast.success('Phân tích thành công!');
    } catch (err: any) {
      console.error('Analysis error:', err);

      // Check if it's a timeout error
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        toast.error('Phân tích mất nhiều thời gian hơn dự kiến. Vui lòng thử lại - kết quả có thể đã được lưu cache.');
      } else {
        toast.error('Có lỗi xảy ra khi phân tích. Vui lòng thử lại.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsAudioPlaying(false);

    setStep(1);
    const now = new Date();
    setSolarDay(now.getDate());
    setSolarMonth(now.getMonth() + 1);
    setSolarYear(now.getFullYear());
    setSelectedCanhGio(null);
    setNoTimeKnown(false);
    setNoBirthDateKnown(false);
    setResult(null);
  };

  // ── Step badge line ──────────────────────────────────────────
  const stepLabels = ['Ngày sinh', 'Kết quả'];

  // Early return if not mounted to prevent hydration flash issues
  // though suppressed with suppressHydrationWarning, it's safer
  if (!mounted) return <div className="min-h-screen bg-white" suppressHydrationWarning />;

  return (
    <div
      className="min-h-screen transition-colors duration-1000"
      style={{
        background: result?.element && NGU_HANH_COLORS[result.element]
          ? `linear-gradient(to bottom, ${NGU_HANH_COLORS[result.element].pageBgFrom}, ${NGU_HANH_COLORS[result.element].pageBgVia}, ${NGU_HANH_COLORS[result.element].pageBgTo})`
          : 'linear-gradient(to bottom, #fefcf9, #ffffff, #f8f4ee)'
      }}
      suppressHydrationWarning
    >
      {/* ── Decorative Circles ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-100/40 to-orange-100/20 blur-3xl" />
        <div className="absolute -bottom-60 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-100/30 to-rose-100/20 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* ── Header ── */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif)', color: '#754C43' }}>
            Tư Vấn Vòng Năng Lượng
          </h1>
        </div>
        {/* ════════ STEP 1: Nhập Ngày Sinh ════════ */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-3xl mx-auto">
            {/* ── Calendar Mode Toggle ── */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-xl p-1 shadow-inner" style={{ backgroundColor: '#F3E5E2', border: '1px solid #F3E5E2' }}>
                <button
                  onClick={() => setCalendarMode('solar')}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all duration-300",
                    calendarMode === 'solar'
                      ? "bg-white shadow-md"
                      : "hover:bg-white/50"
                  )}
                  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, color: calendarMode === 'solar' ? '#9C665A' : '#6A7282' }}
                >
                  <Sun className="w-4 h-4" style={{ color: calendarMode === 'solar' ? '#9C665A' : '#6A7282' }} />
                  Dương lịch
                </button>
                <button
                  onClick={() => setCalendarMode('lunar')}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all duration-300",
                    calendarMode === 'lunar'
                      ? "bg-white shadow-md"
                      : "hover:bg-white/50"
                  )}
                  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, color: calendarMode === 'lunar' ? '#9C665A' : '#6A7282' }}
                >
                  <Moon className="w-4 h-4" style={{ color: calendarMode === 'lunar' ? '#9C665A' : '#6A7282' }} />
                  Âm lịch
                </button>
              </div>
            </div>

            {/* ── Date Input ── */}
            <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold" style={{ color: '#9C665A' }}>
                      {calendarMode === 'solar' ? 'Ngày sinh Dương lịch' : 'Ngày sinh Âm lịch'}
                    </h3>
                  </div>
                  <button
                    onClick={() => { setNoBirthDateKnown(!noBirthDateKnown); }}
                    className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                    style={noBirthDateKnown
                      ? { backgroundColor: '#9C665A', color: '#fff' }
                      : { backgroundColor: '#F3E5E2', color: '#9C665A' }
                    }
                  >
                    Không nhớ
                  </button>
                </div>

                {noBirthDateKnown ? (
                  <div className="space-y-3">
                    <div className="text-center py-4 text-gray-400">
                      <p className="text-sm">Sẽ phân tích dựa trên năm sinh</p>
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: '#9C665A' }}>Chọn năm sinh (ước tính)</Label>
                      <select
                        value={lunarYear}
                        onChange={(e) => setLunarYear(Number(e.target.value))}
                        className="w-full h-12 rounded-lg border border-gray-200 px-3 text-sm bg-white" style={{ color: '#4E332D' }}
                      >
                        {yearOptions.map(y => (
                          <option key={y.value} value={y.value}>{y.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : calendarMode === 'solar' ? (
                  <div className="grid grid-cols-3 gap-3">
                    {/* Ngày */}
                    <div>
                      <Label className="text-xs" style={{ color: '#9C665A' }}>Ngày</Label>
                      <select
                        value={solarDay}
                        onChange={(e) => setSolarDay(Number(e.target.value))}
                        className="w-full h-12 rounded-lg border border-gray-200 px-3 text-base bg-white focus:ring-1" style={{ color: '#4E332D', outlineColor: '#CF998D' }}
                      >
                        {Array.from({ length: 31 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                    {/* Tháng */}
                    <div>
                      <Label className="text-xs" style={{ color: '#9C665A' }}>Tháng</Label>
                      <select
                        value={solarMonth}
                        onChange={(e) => setSolarMonth(Number(e.target.value))}
                        className="w-full h-12 rounded-lg border border-gray-200 px-3 text-base bg-white focus:ring-1" style={{ color: '#4E332D', outlineColor: '#CF998D' }}
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                        ))}
                      </select>
                    </div>
                    {/* Năm */}
                    <div>
                      <Label className="text-xs" style={{ color: '#9C665A' }}>Năm</Label>
                      <select
                        value={solarYear}
                        onChange={(e) => setSolarYear(Number(e.target.value))}
                        className="w-full h-12 rounded-lg border border-gray-200 px-3 text-sm bg-white focus:ring-1" style={{ color: '#4E332D', outlineColor: '#CF998D' }}
                      >
                        {yearOptions.map(y => (
                          <option key={y.value} value={y.value}>{y.value}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {/* Ngày */}
                    <div>
                      <Label className="text-xs" style={{ color: '#9C665A' }}>Ngày</Label>
                      <select
                        value={lunarDay}
                        onChange={(e) => setLunarDay(Number(e.target.value))}
                        className="w-full h-12 rounded-lg border border-gray-200 px-3 text-base bg-white focus:ring-1" style={{ color: '#4E332D', outlineColor: '#CF998D' }}
                      >
                        {Array.from({ length: 30 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                    {/* Tháng */}
                    <div>
                      <Label className="text-xs" style={{ color: '#9C665A' }}>Tháng</Label>
                      <select
                        value={lunarMonth}
                        onChange={(e) => setLunarMonth(Number(e.target.value))}
                        className="w-full h-12 rounded-lg border border-gray-200 px-3 text-base bg-white focus:ring-1" style={{ color: '#4E332D', outlineColor: '#CF998D' }}
                      >
                        {LUNAR_MONTHS.map((m, i) => (
                          <option key={i} value={i + 1}>{m}</option>
                        ))}
                      </select>
                    </div>
                    {/* Năm Can Chi */}
                    <div>
                      <Label className="text-xs" style={{ color: '#9C665A' }}>Năm</Label>
                      <select
                        value={lunarYear}
                        onChange={(e) => setLunarYear(Number(e.target.value))}
                        className="w-full h-12 rounded-lg border border-gray-200 px-3 text-sm bg-white focus:ring-1" style={{ color: '#4E332D', outlineColor: '#CF998D' }}
                      >
                        {yearOptions.map(y => (
                          <option key={y.value} value={y.value}>{y.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Can Chi info chip */}
                {lunarYearInfo && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: '#F3E5E2', border: '1px solid #CF998D' }}>
                    <span className="text-sm font-semibold" style={{ color: '#9C665A' }}>Năm {lunarYearInfo.canChi}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Gender ── */}
            <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-bold" style={{ color: '#9C665A' }}>Giới tính</h3>
                </div>
                <div className="flex gap-3">
                  {[
                    { value: 'male', label: 'Nam'},
                    { value: 'female', label: 'Nữ'},
                  ].map(g => (
                    <button
                      key={g.value}
                      onClick={() => setGender(g.value as 'male' | 'female')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300 border-2"
                      style={gender === g.value
                        ? { backgroundColor: '#F3E5E2', borderColor: '#CF998D', color: '#9C665A', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }
                        : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }
                      }
                    >

                      {g.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ── 12 Canh Giờ ── */}
            <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"> 
                    <h3 className="font-bold" style={{ color: '#9C665A' }}>Giờ sinh (12 Canh Giờ)</h3>
                  </div>
                  <button
                    onClick={() => { setNoTimeKnown(!noTimeKnown); setSelectedCanhGio(null); }}
                    className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                    style={noTimeKnown
                      ? { backgroundColor: '#9C665A', color: '#fff' }
                      : { backgroundColor: '#F3E5E2', color: '#9C665A' }
                    }
                  >
                    Không nhớ
                  </button>
                </div>

                {!noTimeKnown ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2.5">
                    {CANH_GIO.map(cg => {
                      const isSelected = selectedCanhGio?.id === cg.id;
                      return (
                        <button
                          key={cg.id}
                          onClick={() => setSelectedCanhGio(cg)}
                          className="relative flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all duration-300"
                          style={isSelected
                            ? { backgroundColor: '#F3E5E2', borderColor: '#CF998D', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }
                            : { borderColor: '#e5e7eb' }
                          }
                        >
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#CF998D' }}>
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                          <span className="text-2xl mb-1">{cg.emoji}</span>
                          <span className="text-sm font-bold" style={{ color: isSelected ? '#9C665A' : '#374151' }}>
                            {cg.name}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">{cg.range}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Sẽ phân tích dựa trên ngày tháng năm sinh</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!noBirthDateKnown && calendarMode === 'solar' && (!solarDay || !solarMonth || !solarYear))}
                className="relative overflow-hidden px-8 py-3 rounded-xl text-white font-bold text-base shadow-lg disabled:opacity-40 transition-all hover:opacity-90 flex items-center gap-2"
                style={{ backgroundColor: '#C37F70' }}
              >
                <div className="absolute inset-0" style={{ backgroundImage: 'url(/brand/back_button.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.36 }} />
                {isAnalyzing ? (
                  <span className="relative z-10 flex items-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang phân tích phong thủy...
                  </span>
                ) : (
                  <span className="relative z-10 flex items-center">
                    Tư vấn chuyên sâu
                    <Sparkles className="w-5 h-5 ml-2" />
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ════════ STEP 2: Kết Quả ════════ */}
        {step === 2 && result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto bg-white/90 backdrop-blur-xl p-4 sm:p-6 md:p-12 rounded-2xl sm:rounded-[2rem] shadow-luxury border border-brand-tint-60 text-brand-darkest mb-16 relative" style={{ fontFamily: 'var(--font-display)' }}>

            {/* Audio Toggle Button - Desktop/Initial */}
            {false && result?.soundUrl && (
              <button
                onClick={toggleAudio}
                className="absolute top-6 right-6 md:top-10 md:right-10 z-20 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all group backdrop-blur-md shadow-2xl"
                title={isAudioPlaying ? "Tắt nhạc" : "Bật nhạc"}
              >
                {isAudioPlaying ? (
                  <Volume2 className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-400 group-hover:scale-110 transition-transform" />
                )}
                {isAudioPlaying && (
                  <span className="absolute -inset-1 rounded-full border border-amber-500/30 animate-pulse"></span>
                )}
              </button>
            )}

            {/* TỔNG HỢP THÔNG TIN */}
            <div className="mb-12">
              <h2 className="uppercase tracking-[0.05em] mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 'clamp(16px, 4vw, 24px)', color: '#754C43' }}>
                <span className="shrink-0">1. TỔNG HỢP THÔNG TIN</span>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-[#754C43]/20 to-transparent opacity-50"></div>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-shadow shadow-sm hover:shadow-md relative overflow-hidden group">
                  <p className="tracking-[0.15em] mb-1.5 relative z-10 uppercase" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '12px', color: '#A86B5E' }}>GIỚI TÍNH</p>
                  <p className="relative z-10" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '20px', color: '#1A100F' }}>{gender === 'male' ? 'Nam' : 'Nữ'}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-shadow shadow-sm hover:shadow-md relative overflow-hidden group">
                  <p className="tracking-[0.15em] mb-1.5 relative z-10 uppercase" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '12px', color: '#A86B5E' }}>NGÀY SINH</p>
                  <p className="relative z-10" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '20px', color: '#1A100F' }}>
                    {calendarMode === 'solar' ? (
                      `Ngày ${solarDay.toString().padStart(2, '0')} tháng ${solarMonth.toString().padStart(2, '0')}, ${solarYear}`
                    ) : !noBirthDateKnown ? (
                      `Ngày ${lunarDay.toString().padStart(2, '0')} tháng ${lunarMonth.toString().padStart(2, '0')}, ${lunarYear} (Âm)`
                    ) : `Năm ${lunarYear}`}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-shadow shadow-sm hover:shadow-md relative overflow-hidden group">
                  <p className="tracking-[0.15em] mb-1.5 relative z-10 uppercase" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '12px', color: '#A86B5E' }}>GIỜ SINH</p>
                  <p className="relative z-10" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '20px', color: '#1A100F' }}>
                    {noTimeKnown ? 'Không rõ' : selectedCanhGio?.range || 'Không rõ'}
                  </p>
                </div>
              </div>
            </div>

            {/* PHÂN TÍCH BẢN MỆNH CHÍNH */}
            <div className="mb-16">
              <h2 className="uppercase tracking-[0.05em] mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 'clamp(14px, 3.5vw, 24px)', color: '#754C43' }}>
                <span className="shrink-0">2. PHÂN TÍCH BẢN MỆNH CHÍNH</span>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-[#754C43]/20 to-transparent opacity-50"></div>
              </h2>

              <div className="mb-10">
                <h3 className="mb-2 uppercase tracking-widest" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: '14px', color: '#754C43' }}>NẠP ÂM:</h3>
                <p className="text-xl sm:text-2xl md:text-[30px]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400, color: '#754C43' }}>{result.napAmName}</p>
              </div>

              <div className="bg-white border border-gray-100 p-4 sm:p-8 md:p-12 relative rounded-2xl sm:rounded-3xl shadow-sm">
                <div className="flex items-center gap-6 mb-10 justify-center">
                  <div className="h-[1px] w-12" style={{ backgroundColor: '#A86B5E4D' }}></div>
                  <h4 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '18px', color: '#A86B5E' }}>Đặc Tính Hành {result.element}</h4>
                  <div className="h-[1px] w-12" style={{ backgroundColor: '#A86B5E4D' }}></div>
                </div>

                <div className="space-y-10">
                  {/* Ưu điểm */}
                  <div>
                    <h5 className="flex items-center gap-3 uppercase tracking-wide mb-5" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: '16px', color: '#9C665A' }}>
                      <span className="w-2 h-2 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></span>
                      ƯU ĐIỂM (DƯƠNG TÍNH)
                    </h5>
                    <div className="grid md:grid-cols-2 gap-4">
                      {result.positiveTraits && result.positiveTraits.length > 0 ? result.positiveTraits.map((trait, idx) => (
                        <div key={idx} className="rounded-2xl transition-all hover:shadow-md" style={{ background: 'linear-gradient(to bottom, #00FF4D, #FFFFFF)', padding: '1px' }}>
                          <div className="p-6 rounded-2xl h-full" style={{ background: 'linear-gradient(to bottom, #FFFFFF, #C4FFD6)' }}>
                            <h6 className="mb-2 sm:mb-3 tracking-wide leading-snug text-base sm:text-lg md:text-xl" style={{ fontFamily: "'1FTV VIP Classy Vogue', serif", fontWeight: 600, color: '#9C665A' }}>{trait.title}</h6>
                            <p className="leading-[1.7] sm:leading-[1.8] whitespace-pre-line text-sm sm:text-base md:text-lg" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, color: '#754C43' }}>{trait.description}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#121212] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                          <h6 className="text-gray-500 text-lg font-medium mb-2">Chưa có dữ liệu</h6>
                          <p className="text-gray-400 text-sm font-light">Đặc tính ưu điểm đang được cập nhật.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hạn chế */}
                  <div>
                    <h5 className="flex items-center gap-3 uppercase tracking-wide mb-5" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: '16px', color: '#9C665A' }}>
                      <span className="w-2 h-2 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(239,68,68,0.3)]"></span>
                      HẠN CHẾ (ÂM TÍNH)
                    </h5>
                    <div className="grid md:grid-cols-2 gap-4">
                      {result.negativeTraits && result.negativeTraits.length > 0 ? result.negativeTraits.map((trait, idx) => (
                        <div key={idx} className="rounded-2xl transition-all hover:shadow-md" style={{ background: 'linear-gradient(to bottom, #8D5A50, #FFFFFF)', padding: '1px' }}>
                          <div className="p-6 rounded-2xl h-full" style={{ background: 'linear-gradient(to bottom, #FFFFFF, rgba(215, 208, 208, 0.8))' }}>
                            <h6 className="mb-2 sm:mb-3 tracking-wide leading-snug text-base sm:text-lg md:text-xl" style={{ fontFamily: "'1FTV VIP Classy Vogue', serif", fontWeight: 600, color: '#9C665A' }}>{trait.title}</h6>
                            <p className="leading-[1.7] sm:leading-[1.8] whitespace-pre-line text-sm sm:text-base md:text-lg" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, color: '#754C43' }}>{trait.description}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#121212] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                          <h6 className="text-gray-500 text-lg font-medium mb-2">Chưa có dữ liệu</h6>
                          <p className="text-gray-400 text-sm font-light">Đặc tính khuyết điểm đang được cập nhật.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-brand-tint-60/30 text-center px-4 md:px-12">
                  <p className="leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '18px', color: '#754C43' }}>
                    "{result.elementDescription}"
                  </p>
                </div>
              </div>
            </div>

            {/* PHÂN TÍCH CHI TIẾT NGŨ HÀNH & MỆNH KHUYẾT */}
            <div className="mb-16">
              <h2 className="uppercase tracking-[0.05em] mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 'clamp(13px, 3.2vw, 24px)', color: '#754C43' }}>
                <span className="shrink-0">3. NGŨ HÀNH & MỆNH KHUYẾT</span>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-[#754C43]/20 to-transparent opacity-50"></div>
              </h2>
              <p className="mb-6 sm:mb-8 text-sm sm:text-base md:text-lg" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, color: '#412A25' }}>Khám phá sự cân bằng năng lượng và điều phối bản mệnh thông qua Bát Tự</p>

              <div className="grid lg:grid-cols-3 gap-6">

                {/* Tỷ Lệ Ngũ Hành */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-100 shadow-sm">
                    <h3 className="mb-8 flex items-center gap-3 uppercase tracking-wider" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 900, fontSize: '18px', color: '#C37F70' }}>
                      <span className="bg-brand-base/10 p-2 rounded"><Sparkles className="w-4 h-4" style={{ color: '#C37F70' }} /></span>
                      Tỷ Lệ Ngũ Hành Bản Mệnh
                    </h3>

                    <div className="space-y-6">
                      {[
                        { k: 'Mộc', en: 'Wood', color: '#5B7900', barColor: '#5B7900', icon: '/sptheomenh/Mộc.png', iconBg: '#D6F1A9', iconTint: '#166534' },
                        { k: 'Hỏa', en: 'Fire', color: '#D82763', barColor: '#D82763', icon: '/sptheomenh/Hỏa.png', iconBg: '#FFDBE7', iconTint: '#D00046' },
                        { k: 'Thổ', en: 'Earth', color: '#966600', barColor: '#966600', icon: '/sptheomenh/Thổ.png', iconBg: '#FEE7B1', iconTint: '#92400e' },
                        { k: 'Kim', en: 'Metal', color: '#62748E', barColor: '#62748E', icon: '/sptheomenh/Kim.png', iconBg: '#E0E4E8', iconTint: '#1f2937' },
                        { k: 'Thủy', en: 'Water', color: '#0098E3', barColor: '#0098E3', icon: '/sptheomenh/Thủy.png', iconBg: '#CBEAFF', iconTint: '#1e40af' }
                      ].map(el => {
                        const pct = energyPercentages[el.k as keyof typeof energyPercentages] || 0;
                        return (
                          <div key={el.k}>
                            <div className="flex justify-between items-center mb-2 uppercase tracking-wider">
                              <span className="flex items-center gap-2" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: '13px', color: el.color }}>
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full shrink-0" style={{ backgroundColor: el.iconBg }}>
                                  <span
                                    className="w-4 h-4 block"
                                    style={{
                                      backgroundColor: el.iconTint,
                                      maskImage: `url(${el.icon})`,
                                      WebkitMaskImage: `url(${el.icon})`,
                                      maskSize: 'contain',
                                      WebkitMaskSize: 'contain',
                                      maskRepeat: 'no-repeat',
                                      WebkitMaskRepeat: 'no-repeat',
                                      maskPosition: 'center',
                                      WebkitMaskPosition: 'center',
                                    }}
                                  />
                                </span>
                                {el.k} ({el.en})
                              </span>
                              <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: '20px', color: '#412A25' }}>{pct}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: el.iconBg }}>
                              <div className="h-full transition-all duration-1000 ease-out rounded-full" style={{ width: `${pct}%`, backgroundColor: el.barColor }}></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 sm:p-8 md:p-12 border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
                      <h3 className="mb-4 sm:mb-6 uppercase tracking-widest text-lg sm:text-xl md:text-2xl" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 900, color: '#C37F70' }}>Phân tích NHANH</h3>
                      <p className="leading-relaxed text-center whitespace-pre-line text-sm sm:text-base md:text-lg" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, color: '#754C43' }}>
                        "{result.menhKhuyetDescription || result.batTuSummary || "Năng lượng ngũ hành của bạn thể hiện sự phân bổ độc đáo, cần đặc biệt lưu ý bổ sung hành bị thiếu hụt để đạt được sự cân bằng tối ưu trong cuộc sống."}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Kết Luận Bản Mệnh */}
                <div className="space-y-6">
                  <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden text-center h-full flex flex-col justify-center transition-transform hover:translate-y-[-4px]">
                    <p className="uppercase tracking-widest mb-2" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '14px', color: '#A86B5E' }}>Kết luận bản mệnh</p>
                    <h3 className="mb-4 sm:mb-6 uppercase leading-tight text-xl sm:text-2xl md:text-[28px]" style={{ fontFamily: "'1FTV VIP Classy Vogue', serif", fontWeight: 400, color: '#C37F70', WebkitTextStroke: '1px #CF998D' }}>
                      {result.menhKhuyet || `Mệnh khuyết ${result.supportiveElement}`}
                    </h3>
                    <p className="leading-relaxed mb-6 sm:mb-8 mx-auto max-w-[240px] text-sm sm:text-base md:text-lg" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, color: '#754C43' }}>
                      {result.menhKhuyetDescription || 'Bản mệnh của bạn đang được gợi ý chú trọng bổ sung sức mạnh của ngũ hành này. Điều này ảnh hưởng trực tiếp đến sự hanh thông trong công việc và tình cảm.'}
                    </p>
                    <button
                      onClick={() => document.getElementById('deficit-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="w-full relative overflow-hidden rounded-xl text-white font-medium h-12 shadow-lg transition-all hover:opacity-90 uppercase tracking-widest flex items-center justify-center"
                      style={{ backgroundColor: '#A86B5E' }}
                    >
                      <div className="absolute inset-0" style={{ backgroundImage: 'url(/brand/back_button.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
                      <span className="relative z-10 flex items-center">Xem giải pháp <ArrowRight className="w-4 h-4 ml-2" /></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mất cân bằng Ngũ Hành - Data from DB */}
            <div id="deficit-section" className="mb-16 pt-16 border-t border-brand-tint-60/30 scroll-mt-8">
              <h3 className="text-center mb-6" style={{ fontFamily: "'1FTV VIP Classy Vogue', serif", fontWeight: 400, fontSize: '24px', color: '#C37F70', WebkitTextStroke: '1px #CF998D' }}>
                {result.deficitTitle || `Khi Năng Lượng ${result.supportiveElement} Trong Bạn Suy Yếu...`}
              </h3>
              <p className="text-center max-w-2xl mx-auto mb-12" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '18px', color: '#9C665A' }}>
                {result.deficitWeakDescription || `Sự thiếu hụt hành ${result.supportiveElement} không chỉ là vấn đề tâm linh, nó ảnh hưởng trực tiếp đến chất lượng cuộc sống và hiệu suất công việc của bạn.`}
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {result.deficitWeakSymptoms && result.deficitWeakSymptoms.length > 0 ? (
                  result.deficitWeakSymptoms.map((symptom, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                      <h4 className="mb-3" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '18px', color: '#754C43' }}>{symptom.title}</h4>
                      <p className="leading-relaxed whitespace-pre-line" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '18px', color: '#754C43' }}>{symptom.description}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                      <h4 className="mb-3" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '18px', color: '#754C43' }}>Suy Giảm Năng Lượng</h4>
                      <p className="leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '18px', color: '#754C43' }}>Cảm giác mệt mỏi, thiếu sức sống và không đủ nhiệt huyết khởi đầu bất kỳ dự án mới nào.</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                      <h4 className="mb-3" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '18px', color: '#754C43' }}>Mất Đi Đam Mê</h4>
                      <p className="leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '18px', color: '#754C43' }}>Sự lãnh đạm, thờ ơ với các mối quan hệ và công việc, làm lụi tàn khả năng sáng tạo tiềm ẩn.</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                      <h4 className="mb-3" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '18px', color: '#754C43' }}>Vận May Sa Sút</h4>
                      <p className="leading-relaxed whitespace-pre-line" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '18px', color: '#754C43' }}>
                        Hành {result.supportiveElement} thiếu hụt khiến cơ hội vụt mất, tài lộc khó tụ và thị phi kéo đến. Đây là lúc cần cải thiện lập tức.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bổ Khuyết Ngũ Hành - Data from DB */}
            <div className="mb-16 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="mb-4" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '22px', color: '#9C665A' }}>
                  {result.deficitCompensationTitle || `Bổ Khuyết Ngũ Hành – Cân Bằng Năng Lượng`}
                </h3>
                <p className="mb-8 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '18px', color: '#754C43' }}>
                  {result.deficitCompensationDescription || `Hành ${result.supportiveElement} liên kết trực tiếp với các Luân xa trọng yếu. Khi được kích hoạt đúng cách bằng đá năng lượng phong thủy, bạn sẽ cảm nhận được:`}
                </p>

                <div className="space-y-6 mb-8">
                  {result.deficitCompensationBenefits && result.deficitCompensationBenefits.length > 0 ? (
                    result.deficitCompensationBenefits.map((benefit, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-brand-base flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                          <h4 className="mb-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '18px', color: '#9C665A' }}>{benefit.title}</h4>
                          <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '18px', color: '#754C43' }}>{benefit.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-brand-base flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                          <h4 className="mb-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '18px', color: '#9C665A' }}>Sự Tự Tin Tuyệt Đối:</h4>
                          <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '18px', color: '#754C43' }}>Xóa bỏ nỗi sợ hãi, khẳng định bản thân trong mọi tình huống.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-brand-base flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                          <h4 className="mb-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '18px', color: '#9C665A' }}>Thu Hút Nhân Duyên:</h4>
                          <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '18px', color: '#754C43' }}>Gia tăng sức quyến rũ tự nhiên, cải thiện các mối quan hệ xã hội.</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Danh sách đá phù hợp để bù khuyết */}
                <div className="p-4 border-l-2 border-brand-base bg-white leading-relaxed rounded-r-lg shadow-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: '18px', color: '#9C665A' }}>
                  Để bổ sung hành {result.supportiveElement} có thể ưu tiên dùng đá quý có năng lượng tương ứng như: <br />
                  {result.deficitRecommendedStones && result.deficitRecommendedStones.length > 0
                    ? result.deficitRecommendedStones.map(s => s.name).join(', ')
                    : result.luckyColors.join(', ')
                  }.
                </div>
              </div>

              <div className="relative aspect-square rounded-3xl overflow-hidden border border-brand-tint-60 shadow-luxury">
                <Image src="/images/meditation-glow.jpg" alt="Chakra Balance" fill className="object-cover" unoptimized
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop"; }} />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-32 h-32 rounded-full bg-brand-base/20 blur-3xl animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Recommended Bracelets & Action */}
            {recommendedProducts.length > 0 && (
              <div className="mt-20 pt-16 border-t border-brand-tint-60/30">
                <h3 className="mb-6 sm:mb-10 flex items-center justify-center gap-2 sm:gap-4 uppercase tracking-normal text-[15px] sm:text-2xl md:text-4xl whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, color: '#7A5046' }}>
                  <span className="w-12 h-[1px] bg-brand-base/40"></span>
                  Gợi Ý Sản Phẩm Phù Hợp
                  <span className="w-12 h-[1px] bg-brand-base/40"></span>
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {recommendedProducts.map(({ product, score }) => (
                    <div key={product.id} className="relative">
                      {/* Compatibility Badge */}
                      <span
                        className="absolute top-0 left-0 z-20 inline-flex items-center px-4 py-2 text-white text-sm shadow-sm"
                        style={{
                          fontFamily: 'Roboto, sans-serif',
                          backgroundColor: '#C37F70',
                          borderTopLeftRadius: '1rem',
                          borderBottomRightRadius: '1rem',
                          borderTopRightRadius: 0,
                          borderBottomLeftRadius: 0,
                        }}
                      >
                        {score}% Phù hợp
                      </span>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reset / Actions */}
            <div className="mt-10 sm:mt-16 flex justify-center gap-3 sm:gap-6 pb-4">
              <button
                onClick={handleReset}
                className="relative overflow-hidden px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl text-white font-medium shadow-lg transition-all hover:opacity-90 uppercase tracking-wider sm:tracking-widest flex items-center justify-center"
                style={{ backgroundColor: '#A86B5E' }}
              >
                <div className="absolute inset-0" style={{ backgroundImage: 'url(/brand/back_button.png)', backgroundSize: '180%', backgroundPosition: 'center', opacity: 0.15 }} />
                <span className="relative z-10 text-xs sm:text-sm md:text-base" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800 }}>Tư vấn lại</span>
              </button>
              <Link href="/products" className="px-4 sm:px-8 py-2.5 sm:py-3 hover:opacity-80 transition-all uppercase tracking-wider sm:tracking-widest flex items-center gap-1.5 sm:gap-2 rounded-xl text-xs sm:text-sm md:text-base" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, color: '#C37F70' }}>
                Xem thêm sản phẩm <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Fixed Floating Sound Control - Hidden */}
        {false && result?.soundUrl && step === 2 && (
          <div className="fixed bottom-8 left-8 z-[100] animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={toggleAudio}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 group relative overflow-hidden backdrop-blur-xl border-2",
                isAudioPlaying
                  ? "bg-amber-500 border-white/40 text-black scale-110"
                  : "bg-black/80 border-white/20 text-white/40 hover:text-white"
              )}
            >
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                {isAudioPlaying ? (
                  <>
                    <Volume2 className="w-6 h-6 animate-bounce" />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-6 h-6" />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">Off</span>
                  </>
                )}
              </div>

              {isAudioPlaying && (
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
              )}

              {/* Ripple Effect when playing */}
              {isAudioPlaying && (
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 rounded-full border border-white/40 animate-ping duration-1000"></div>
                  <div className="absolute inset-0 rounded-full border border-white/20 animate-ping duration-1500 delay-300"></div>
                </div>
              )}
            </button>

            {/* Tooltip hint */}
            <div className="absolute bottom-full left-0 mb-3 bg-black/90 text-white text-[10px] py-1 px-3 rounded-full border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {isAudioPlaying ? "Tạm dừng âm thanh" : "Phát âm thanh"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
