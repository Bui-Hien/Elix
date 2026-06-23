'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, HelpCircle, ArrowRight, Zap, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { consultationApi } from '@/lib/api/consultation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/product/product-card';

// --- Types ---
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
  return 'linear-gradient(to right, #ccc, #999)';
}

const IconRenderer = ({ name, size = 24 }: { name: string, size?: number }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <HelpCircle size={size} />;
  return <IconComponent size={size} />;
}

const PurposeRelatedProducts = ({ purposeIds }: { purposeIds: number[] }) => {
  const { products, isLoading } = useProducts({
    purposeIds,
    pageSize: 8,
    sort: 'newest'
  });

  if (isLoading) {
    return (
      <div className="mt-12 animate-in fade-in duration-700">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] rounded-2xl bg-gray-100 animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isLoading && products.length === 0) {
    return (
      <div className="mt-12 bg-white/50 backdrop-blur-sm rounded-3xl p-10 border border-gray-100 text-center animate-in fade-in duration-500">
        <h3 className="text-lg font-medium text-gray-600 mb-2">Hệ thống đang cập nhật sản phẩm cho mục tiêu này</h3>
      </div>
    );
  }

  return (
    <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#4E332D' }}>
            Sản phẩm gợi ý cho nhu cầu của bạn
          </h3>
          <p className="text-gray-500 mt-1">Lựa chọn tinh tuyển giúp bạn đạt được mong muốn</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            const query = purposeIds.join(',');
            window.location.href = `/products?purposeIds=${query}`;
          }}
          className="border-gray-200 text-gray-900 hover:bg-gray-50 rounded-full px-6"
        >
          Xem tất cả <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default function PurposePage() {
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchPurposes = async () => {
      try {
        const data = await consultationApi.getGoals();
        setPurposes(data);
      } catch (error) {
        console.error('Failed to fetch purposes:', error);
        toast.error('Không thể tải danh sách mục đích');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPurposes();
  }, []);

  const togglePurpose = (id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) {
        toast.warning('Bạn chỉ có thể chọn tối đa 3 mục tiêu');
        return prev;
      }
      return [...prev, id];
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] py-24 px-4 overflow-x-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20 space-y-6">
          <h1 className="mb-4 tracking-tight leading-tight">
            <span style={{ fontFamily: "'1FTV VIP Classy Vogue', serif", fontWeight: 400, fontSize: '48px', color: '#754C43' }}>Chọn Trang Sức</span>
            <br className="hidden md:block" />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '42px', color: '#754C43', fontStyle: 'italic' }}>Theo Mục Đích</span>
          </h1>
          <p className="max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 100, fontSize: '20px', color: '#4E332D', fontStyle: 'italic' }}>
            "Mỗi loại đá mang một tần số năng lượng riêng biệt, hãy để Elix giúp bạn tìm thấy sự hỗ trợ phù hợp nhất cho cuộc sống của mình."
          </p>
          <div className="w-16 h-[1px] bg-brand-base/30 mx-auto mt-8"></div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-brand-darkest animate-spin" />
            <p className="mt-4 text-gray-400 font-serif italic text-sm tracking-wide">Đang khởi tạo năng lượng...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {purposes.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <Card
                    key={p.id}
                    onClick={() => togglePurpose(p.id)}
                    className={cn(
                      "cursor-pointer transition-all duration-500 border overflow-hidden hover:shadow-2xl hover:-translate-y-1 group",
                      isSelected ? "border-black ring-1 ring-black/5 shadow-xl scale-[1.02] bg-white" : "border-gray-100 bg-white/50 hover:bg-white hover:border-gray-200"
                    )}
                  >
                    <CardContent className="p-8 text-center relative flex flex-col items-center">
                      {isSelected && (
                        <div className="absolute top-4 right-4 rounded-full p-1.5 text-white animate-in zoom-in duration-500 shadow-lg" style={{ backgroundColor: '#CF998D' }}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-md transition-transform duration-300 group-hover:scale-110"
                        style={{ background: getGradientStyle(p.gradient) }}
                      >
                        <IconRenderer name={p.icon} size={32} />
                      </div>
                      <h3 className="mb-3 tracking-wide" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600, fontSize: '23px', color: '#4E332D' }}>{p.name}</h3>
                      <p className="leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: '14px', color: '#754C43', fontStyle: 'italic' }}>{p.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {selectedIds.length > 0 ? (
              <PurposeRelatedProducts purposeIds={selectedIds} />
            ) : (
              <div className="bg-white/40 backdrop-blur-sm border border-dashed border-gray-200 rounded-3xl p-20 text-center">
                <p className="text-gray-400 italic">Hãy chọn mục tiêu bạn quan tâm để xem các gợi ý phù hợp nhất</p>
              </div>
            )}

            <div className="mt-24 flex flex-col items-center gap-8">
              <a
                href="/tu-van"
                className="relative overflow-hidden rounded-xl text-white shadow-lg transition-all hover:opacity-90 uppercase tracking-widest flex items-center justify-center gap-3 px-12 py-4"
                style={{ backgroundColor: '#A86B5E' }}
              >
                <div className="absolute inset-0" style={{ backgroundImage: 'url(/brand/back_button.png)', backgroundSize: '180%', backgroundPosition: 'center', opacity: 0.15 }} />
                <span className="relative z-10 flex items-center gap-2" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '14px', color: '#FFFFFF' }}>
                  Tư vấn chuyên sâu
                </span>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
