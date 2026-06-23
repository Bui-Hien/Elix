"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Trash2, ShoppingBag, Heart, Ruler, Info } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { BeadCalculator, BEAD_CATEGORIES } from '@/lib/diy-utils';
import apiClient from '@/lib/api-client';
import BeadPreviewCircle from './components/BeadPreviewCircle';
import { useAppSelector } from '@/lib/redux/hooks';
import { toast } from 'sonner';

export default function DIYEditorPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [beads, setBeads] = useState<any[]>([]);
  const [beadType, setBeadType] = useState<'round' | 'special'>('round');
  const [rotation, setRotation] = useState(0);

  const [beadMaterials, setBeadMaterials] = useState<any[]>([]);
  const [beadSpecifications, setBeadSpecifications] = useState<any[]>([]);
  const [categoriesFromDB, setCategoriesFromDB] = useState<any[]>([]);
  const [loadingBeads, setLoadingBeads] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculations
  const totalPrice = BeadCalculator.calculateTotalPrice(beads);
  const wristSizeData = BeadCalculator.calculateWristSize(beads);
  const wristStatusLabel =
    wristSizeData.status === 'too_short'
      ? 'Quá ngắn'
      : wristSizeData.status === 'too_long'
        ? 'Quá dài'
        : wristSizeData.status === 'empty'
          ? '--'
          : `${wristSizeData.value}cm`;

  // Fetch data
  const loadBeadsData = useCallback(async () => {
    try {
      setLoadingBeads(true);
      const [beadsResponse, categoriesResponse] = await Promise.all([
        apiClient.get('/beads').catch(() => ({ success: false, data: { materials: [], specifications: [] } })),
        apiClient.get('/beads/categories').catch(() => ({ success: false, data: { categories: [] } }))
      ]) as any[];

      if (beadsResponse.success && beadsResponse.data) {
        const { materials, specifications } = beadsResponse.data;
        const formattedSpecs = (specifications || []).map((spec: any) => ({
          ...spec,
          materialId: spec.material_id
        }));
        setBeadMaterials(materials || []);
        setBeadSpecifications(formattedSpecs);
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        setCategoriesFromDB(categoriesResponse.data.categories || []);
      }
    } catch (error) {
      console.error('Failed to load beads/categories:', error);
    } finally {
      setLoadingBeads(false);
    }
  }, []);

  useEffect(() => {
    loadBeadsData();
  }, [loadBeadsData]);

  const orderedCategoriesForSidebar = useMemo(() => {
    const base =
      categoriesFromDB.length > 0
        ? [...categoriesFromDB].sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
        : [...BEAD_CATEGORIES];
    return base.filter(cat =>
      beadMaterials.some(
        m =>
          String(m.category_id) === String(cat.id) &&
          (beadType === 'round' ? m.material_type !== 'special' : m.material_type === 'special')
      )
    );
  }, [categoriesFromDB, beadMaterials, beadType]);

  const resolvedCategoryId = useMemo(() => {
    if (orderedCategoriesForSidebar.length === 0) return 'all';
    const validIds = new Set(orderedCategoriesForSidebar.map(c => String(c.id)));
    const cur = selectedCategory != null ? String(selectedCategory) : '';
    if (cur && validIds.has(cur)) return orderedCategoriesForSidebar.find(c => String(c.id) === cur)?.id || 'all';
    return orderedCategoriesForSidebar[0].id;
  }, [orderedCategoriesForSidebar, selectedCategory]);

  const availableBeads = useMemo(() => {
    if (loadingBeads) return [];

    let materials = beadMaterials.filter(m =>
      beadType === 'round' ? m.material_type !== 'special' : m.material_type === 'special'
    );

    if (resolvedCategoryId && resolvedCategoryId !== 'all') {
      materials = materials.filter(m => String(m.category_id) === String(resolvedCategoryId));
    }

    const materialIds = materials.map(m => m.id);
    const specsByMaterial = new Map();
    for (const s of beadSpecifications) {
      if (!materialIds.includes(s.materialId)) continue;
      if (selectedMaterial !== 'all' && s.materialId !== selectedMaterial) continue;
      if (!specsByMaterial.has(s.materialId)) specsByMaterial.set(s.materialId, []);
      specsByMaterial.get(s.materialId).push(s);
    }

    const allBeads: any[] = [];
    const sizes = beadType === 'round' ? [6, 8, 10, 11, 12] : [0, 4, 6, 8, 10, 11, 12, 15];
    for (const m of materials) {
      const specs = specsByMaterial.get(m.id) || [];
      for (const spec of specs) {
        for (const size of sizes) {
          const priceKeyMm = `${size}mm`;
          const priceKeyNum = `${size}`;
          const price = spec.prices?.[priceKeyMm] || spec.prices?.[priceKeyNum];
          if (!price) continue;
          allBeads.push({
            ...spec,
            sizeMm: size,
            price,
            displayId: `${spec.id}_${size}mm`,
            fullName: size === 0 ? `${spec.name} Đệm` : `${spec.name} ${size}mm`,
            material_type: m.material_type || 'round',
            categoryName: m.category_name || m.category || '',
            image: spec.image || m.image,
          });
        }
      }
    }

    return allBeads;
  }, [
    selectedMaterial,
    beadType,
    beadMaterials,
    beadSpecifications,
    loadingBeads,
    resolvedCategoryId
  ]);

  const handleAddBead = (beadSpec: any) => {
    if (wristSizeData.status === 'too_long') return;

    const newBead = {
      ...beadSpec,
      uid: Date.now() + Math.random().toString(36).substr(2, 9),
    };

    setBeads(prev => [...prev, newBead]);
  };

  const handleClearAll = () => {
    if (beads.length === 0) return;
    setBeads([]);
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu thiết kế');
      router.push('/login');
      return;
    }
    if (beads.length === 0) {
      toast.error('Vui lòng thêm hạt trước');
      return;
    }
    toast.success('Đã lưu thiết kế vào bộ sưu tập!');
  };

  const handleCompleteClick = () => {
    if (beads.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 hạt để hoàn thành');
      return;
    }
    if (wristSizeData.status === 'too_short' || wristSizeData.status === 'too_long') {
      toast.error(wristSizeData.status === 'too_short' ? 'Chuỗi hạt quá ngắn' : 'Chuỗi hạt quá dài');
      return;
    }
    toast.success('Thiết kế đã được thêm vào giỏ hàng!');
    // Here we would integrate addToCart properly with the design details
  };

  return (
    <div className="flex min-h-screen flex-col font-sans text-[#1a1814] md:h-[100dvh] md:overflow-hidden bg-[#faf9f6]">
      <header className="sticky top-0 z-[60] flex h-14 flex-shrink-0 items-center justify-between border-b border-[rgba(26,24,20,0.06)] bg-white/50 px-4 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]">
        <button
          onClick={() => router.push('/')}
          className="w-10 h-10 -ml-2 flex items-center justify-center hover:bg-white/50 rounded-full"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 px-2.5 py-1.5 bg-[#0d9488]/10 text-[#0d9488] rounded-full text-[10px] font-medium hover:bg-[#0d9488]/20 transition-colors">
            <Ruler className="w-3 h-3" />
            <span className="hidden sm:inline">Cách đo cổ tay</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-3 text-xs">
            <div className="flex flex-col items-end">
              <span className="text-[7px] sm:text-[9px] text-[#6b6560] uppercase tracking-wider">Cổ tay</span>
              <span className={`text-[9px] sm:text-xs font-semibold ${wristSizeData.status === 'too_short' ? 'text-red-500' :
                wristSizeData.status === 'too_long' ? 'text-red-500' :
                  'text-gray-700'
                }`}>
                {wristStatusLabel}
              </span>
            </div>
            <div className="w-px h-4 sm:h-6 bg-gray-200" />
            <div className="flex flex-col items-end">
              <span className="text-[7px] sm:text-[9px] text-[#6b6560] uppercase tracking-wider">Tổng cộng</span>
              <span className="text-[9px] sm:text-xs font-semibold text-gray-700">₫{totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">

        {/* Left Side - Preview & Actions */}
        <div className="relative flex min-h-0 flex-[1.4] flex-col lg:min-w-0 lg:flex-[1.25]">
          <div className="relative flex min-h-[400px] max-h-[65vh] flex-1 items-center justify-center bg-transparent sm:min-h-[420px] lg:max-h-none lg:min-h-[520px]">
            <BeadPreviewCircle
              beads={beads}
              setBeads={setBeads}
              rotation={rotation}
              setRotation={setRotation}
              beadMaterials={beadMaterials}
            />
          </div>

          <div className="flex items-center justify-between border-t border-[rgba(26,24,20,0.08)] bg-white/75 px-6 py-3 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAll}
                className="w-12 h-9 flex items-center justify-center border border-gray-300 bg-white text-gray-600 rounded-full hover:bg-gray-50 hover:text-[#0d9488] hover:border-[#6b6560]/70 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 h-9 border border-[#0d9488] bg-white text-[#0d9488] rounded-full font-medium text-sm hover:bg-[#0d9488] hover:text-white transition-all"
              >
                <Heart className="w-4 h-4" />
                <span>Lưu</span>
              </button>
            </div>

            <button
              onClick={handleCompleteClick}
              className="flex items-center gap-2 px-6 h-10 bg-[#0d9488] text-white rounded-full font-medium text-sm hover:bg-[#0f766e] transition-all shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              Hoàn thành
            </button>
          </div>
        </div>

        {/* Right Side - Sidebar & Bead Grid */}
        <div className="flex h-[30vh] flex-shrink-0 border-t border-[rgba(26,24,20,0.08)] bg-white/85 backdrop-blur-md lg:h-auto lg:w-[400px] lg:flex-[0_0_400px] lg:border-l lg:border-t-0">
          <div className="w-[72px] flex-shrink-0 overflow-y-auto overflow-x-hidden border-r border-[rgba(26,24,20,0.08)] bg-white/45 py-2 backdrop-blur-sm sm:w-20">
            <div className="px-1 pb-2 mb-2 border-b border-[rgba(26,24,20,0.08)] flex-shrink-0">
              <div
                className="relative bg-white rounded-full p-1 cursor-pointer shadow-sm border border-gray-100"
                onClick={() => {
                  setBeadType(beadType === 'round' ? 'special' : 'round');
                  setSelectedMaterial('all');
                  setSelectedCategory(null);
                }}
              >
                <div
                  className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-[#0d9488] rounded-full transition-all duration-300 ease-out shadow-md pointer-events-none"
                  style={{
                    transform: beadType === 'special' ? 'translateX(100%)' : 'translateX(0)'
                  }}
                />
                <div className="relative flex justify-between z-10 text-[9px] font-medium text-center">
                  <div className={`flex-1 py-1 transition-colors duration-300 ${beadType === 'round' ? 'text-white' : 'text-gray-500'}`}>Tròn</div>
                  <div className={`flex-1 py-1 transition-colors duration-300 ${beadType === 'special' ? 'text-white' : 'text-gray-500'}`}>Đặc biệt</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 px-1">
              {orderedCategoriesForSidebar.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(String(cat.id))}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-all duration-300 ${resolvedCategoryId === String(cat.id)
                    ? 'bg-[#0d9488]/10 text-[#0d9488] shadow-sm'
                    : 'text-gray-500 hover:bg-black/5 hover:text-gray-800'
                    }`}
                >
                  <span className="text-[10px] leading-tight text-center font-medium line-clamp-2">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden bg-white/40 relative">
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                {availableBeads.map(bead => (
                  <div
                    key={bead.displayId}
                    onClick={() => handleAddBead(bead)}
                    className="group relative flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl bg-white p-2 transition-all duration-300 hover:shadow-lg border border-[rgba(26,24,20,0.06)] hover:border-[#0d9488]/30"
                  >
                    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-gray-50/50">
                      {bead.image ? (
                        <img
                          src={bead.image}
                          alt={bead.fullName}
                          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110`}
                          onError={(e: any) => {
                            e.target.src = '/brand/Logo.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200"></div>
                      )}
                    </div>

                    <div className="flex w-full flex-col items-center gap-0.5 text-center">
                      <span className="text-[10px] font-medium text-gray-800 line-clamp-1">
                        {bead.fullName}
                      </span>
                      <span className="text-[10px] font-semibold text-[#0d9488]">
                        ₫{bead.price?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {availableBeads.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                  <Info className="mb-2 h-8 w-8 opacity-20" />
                  <p className="text-sm">Không tìm thấy hạt nào.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
