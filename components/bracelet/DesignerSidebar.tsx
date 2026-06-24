"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingBag, Sparkles, ChevronRight, LayoutGrid, CircleDot, Heart, Loader2, Search, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import { Bead, BraceletMode, BeadCategory, AVAILABLE_BEADS, CATEGORY_LABELS } from './types';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/lib/redux/hooks';

interface DesignerSidebarProps {
    selectedBeads: Bead[];
    activeCategory: BeadCategory;
    setActiveCategory: (cat: BeadCategory) => void;
    braceletMode: BraceletMode;
    setBraceletMode: (mode: BraceletMode) => void;
    addBead: (bead: Bead) => void;
    customAssets: Bead[];
    totalValue: number;
    minBeadsLimit: number;
    maxBeadsLimit: number;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onAddToCart?: () => Promise<void>;
    availableBeads?: Bead[];
    braceletBases?: Bead[];
    selectedBaseId?: string;
    setSelectedBaseId?: (id: string) => void;
    availableStoppers?: Bead[];
    selectedStopperId?: string | null;
    setSelectedStopperId?: (id: string | null) => void;
    isMobile?: boolean;
    searchTerm?: string;
    setSearchTerm?: (term: string) => void;
    selectedIdx?: number | null;
    setSelectedIdx?: (idx: number | null) => void;
    updateCalibration?: (idx: number, updates: any) => void;
    syncAll?: (idx: number) => void;
    reset?: (idx: number) => void;
    removeBead: (idx: number) => void;
    categoryLabels?: Record<string, string>;
    requiredSlugs?: string[];
    isAdmin?: boolean;
    saveDefaultCalibration?: (idx: number) => void;
}

const MODE_OPTIONS: { key: BraceletMode; imageSrc: string; label: string }[] = [
    { key: 'full', imageSrc: '/brand/vong_1.png', label: 'Vòng Hạt' },
    { key: 'mini', imageSrc: '/brand/vong_2.png', label: 'Vòng Dây Cáp' },
    { key: 'single', imageSrc: '/brand/vong_3.png', label: 'Vòng Cổ' },
];

export default function DesignerSidebar({
    selectedBeads, activeCategory, setActiveCategory,
    braceletMode, setBraceletMode, addBead,
    customAssets, totalValue, minBeadsLimit, maxBeadsLimit,
    fileInputRef, handleImageUpload, onAddToCart,
    availableBeads = [],
    braceletBases = [],
    selectedBaseId,
    setSelectedBaseId,
    availableStoppers = [],
    selectedStopperId,
    setSelectedStopperId,
    isMobile = false,
    searchTerm = '',
    setSearchTerm,
    selectedIdx = null,
    setSelectedIdx,
    updateCalibration,
    syncAll,
    reset,
    removeBead,
    categoryLabels = CATEGORY_LABELS,
    requiredSlugs = [],
    isAdmin = false,
    saveDefaultCalibration,
}: DesignerSidebarProps) {
    const isAtLimit = selectedBeads.length >= maxBeadsLimit;

    // Collapsible states
    const [isBasesExpanded, setIsBasesExpanded] = useState(true);
    const [isStoppersExpanded, setIsStoppersExpanded] = useState(true);
    const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    // Drag to scroll logic for categories
    const categoryContainerRef = useRef<HTMLDivElement>(null);
    const [isDraggingCategory, setIsDraggingCategory] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [isDragged, setIsDragged] = useState(false);

    const handleMouseDownCategory = (e: React.MouseEvent) => {
        if (!categoryContainerRef.current) return;
        setIsDraggingCategory(true);
        setIsDragged(false);
        setStartX(e.pageX - categoryContainerRef.current.offsetLeft);
        setScrollLeft(categoryContainerRef.current.scrollLeft);
    };

    const handleMouseLeaveCategory = () => {
        setIsDraggingCategory(false);
    };

    const handleMouseUpCategory = () => {
        setIsDraggingCategory(false);
    };

    const handleMouseMoveCategory = (e: React.MouseEvent) => {
        if (!isDraggingCategory || !categoryContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - categoryContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // scroll-fast multiplier

        if (Math.abs(walk) > 5) {
            setIsDragged(true);
        }

        categoryContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
        <div className="w-full lg:h-full bg-white flex flex-col shadow-2xl relative lg:overflow-hidden">
            {/* Elegant dot-pattern background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#D4AF37 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
            </div>

            {/* Content Layout */}
            <div className="flex flex-col flex-1 lg:overflow-hidden">
                {/* Header & Modes on Desktop */}
                <div className="hidden lg:block w-full h-auto flex-shrink-0 bg-transparent p-6 pb-0 z-20">
                    {/* Header Desktop */}
                    <div className="mb-4">
                        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[#553831]">
                            Thiết kế vòng tay
                        </h1>
                        <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5">
                            Tùy chỉnh theo phong cách của bạn
                        </p>
                    </div>

                    {/* Mode Toggle Desktop */}
                    {/* <div className="flex flex-col lg:flex-row bg-transparent lg:bg-[#F4E5E2] p-0 lg:p-1 rounded-xl gap-2 lg:gap-1 mt-0">
                        {MODE_OPTIONS.map(({ key, imageSrc, label }) => (
                            <button
                                key={key}
                                onClick={() => setBraceletMode(key)}
                                className={cn(
                                    "w-auto h-10 flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex flex-row items-center justify-center gap-2",
                                    braceletMode === key
                                        ? "bg-white text-gray-800 shadow-sm"
                                        : "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                )}
                            >
                                <img src={imageSrc} alt={label} className="w-5 h-5 object-contain" />
                                <span className="text-center leading-[1.1] inline">{label}</span>
                            </button>
                        ))}
                    </div> */}
                </div>

                {/* Right Side / Main Area */}
                <div className="flex-1 flex flex-col lg:overflow-hidden relative z-10 bg-white">
                    <div className="flex-1 lg:overflow-y-auto scroll-smooth">
                        {/* Upper Section: Bases & Stoppers */}
                        <div className="p-2 lg:p-6 pt-2 lg:pt-4 space-y-1.5 lg:space-y-4">
                            {/* Base Selection for Mini/Single Mode - Collapsible */}
                            {(braceletMode === 'mini' || braceletMode === 'single') && braceletBases.length > 0 && setSelectedBaseId && (
                                <div className="border border-gray-100 bg-gray-50/50 rounded-lg lg:rounded-xl p-2 lg:p-3">
                                    <button
                                        onClick={() => setIsBasesExpanded(!isBasesExpanded)}
                                        className="flex items-center justify-between w-full text-left group"
                                    >
                                        <h3 className="text-[11px] lg:text-xs font-bold text-gray-700 group-hover:text-purple-600 transition-colors">
                                            Chọn Loại Dây ({braceletBases.filter(b => braceletMode === 'single' ? b.isSingleStoneMode : !b.isSingleStoneMode).length})
                                        </h3>
                                        {isBasesExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    </button>

                                    {isBasesExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="grid grid-cols-3 lg:grid-cols-4 gap-2 pt-3"
                                        >
                                            {braceletBases
                                                .filter(base => braceletMode === 'single' ? base.isSingleStoneMode : !base.isSingleStoneMode)
                                                .map(base => (
                                                    <button
                                                        key={base.id}
                                                        onClick={() => setSelectedBaseId(base.id)}
                                                        className={cn(
                                                            "flex flex-col items-center gap-1 p-1 lg:p-2 rounded-lg lg:rounded-xl border-2 transition-all",
                                                            selectedBaseId === base.id
                                                                ? "border-purple-500 bg-purple-50 shadow-sm"
                                                                : "border-gray-200 hover:border-purple-300 bg-white"
                                                        )}
                                                    >
                                                        <div className="w-8 h-8 lg:w-12 lg:h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white mix-blend-multiply">
                                                            {base.imageUrl ? (
                                                                <img src={base.imageUrl} alt={base.label} className="w-full h-full object-contain p-0.5" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-800" />
                                                            )}
                                                        </div>
                                                        <span className="text-[9px] lg:text-[10px] font-bold text-gray-800 text-center line-clamp-1 w-full">{base.label}</span>
                                                    </button>
                                                ))}
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* Stopper Selection for Mini Mode - Collapsible */}
                            {braceletMode === 'mini' && availableStoppers.length > 0 && setSelectedStopperId && (
                                <div className="border border-gray-100 bg-gray-50/50 rounded-lg lg:rounded-xl p-2 lg:p-3">
                                    <button
                                        onClick={() => setIsStoppersExpanded(!isStoppersExpanded)}
                                        className="flex items-center justify-between w-full text-left group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[11px] lg:text-xs font-bold text-gray-700 group-hover:text-purple-600 transition-colors">
                                                Chọn Chốt ({availableStoppers.length})
                                            </h3>
                                        </div>
                                        {isStoppersExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    </button>

                                    {isStoppersExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="space-y-2 pt-3"
                                        >
                                            <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
                                                {availableStoppers.map(stopper => (
                                                    <button
                                                        key={stopper.id}
                                                        onClick={() => setSelectedStopperId(selectedStopperId === stopper.id ? null : stopper.id)}
                                                        className={cn(
                                                            "flex flex-col items-center gap-1 p-1 lg:p-2 rounded-lg lg:rounded-xl border-2 transition-all",
                                                            selectedStopperId === stopper.id
                                                                ? "border-purple-500 bg-purple-50 shadow-sm"
                                                                : "border-gray-200 hover:border-purple-300 bg-white"
                                                        )}
                                                    >
                                                        <div className="w-8 h-8 lg:w-12 lg:h-10 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 mix-blend-multiply">
                                                            {stopper.imageUrl ? (
                                                                <img src={stopper.imageUrl} alt={stopper.label} className="w-full h-full object-contain" />
                                                            ) : (
                                                                <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-gray-800" />
                                                            )}
                                                        </div>
                                                        <span className="text-[9px] lg:text-[10px] font-bold text-gray-800 text-center line-clamp-1 w-full">{stopper.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Search & Categories - Sticky Header */}
                        <div className="px-3 lg:px-6 py-1.5 lg:py-2 sticky top-0 bg-white/95 backdrop-blur-md z-30 border-b border-gray-50">
                            {/* Search Bar - Full width on desktop, above categories */}
                            <div className="hidden lg:block mb-2">
                                <div className="relative w-full group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CF9A8D] transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Tìm loại đá, charm..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl h-[36px] pl-9 pr-3 text-xs focus:ring-2 focus:ring-[#CF9A8D]/20 focus:border-[#CF9A8D] transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 lg:gap-2">
                                {/* Mode Toggle Mobile Menu - Hidden as requested */}
                                <div className="hidden">
                                    <button
                                        onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                                        className={cn(
                                            "h-[36px] w-[40px] bg-gray-50 border border-gray-200 rounded-lg lg:rounded-xl flex items-center justify-center transition-colors",
                                            isModeMenuOpen ? "text-[#CF9A8D] border-[#CF9A8D] bg-[#F4E5E2] shrink-0" : "text-gray-700 hover:text-[#CF9A8D] shrink-0"
                                        )}
                                    >
                                        <Menu className="w-5 h-5" />
                                    </button>

                                    {isModeMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setIsModeMenuOpen(false)} />
                                            <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden min-w-[200px] z-50">
                                                {MODE_OPTIONS.map(({ key, imageSrc, label }) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => { setBraceletMode(key); setIsModeMenuOpen(false); }}
                                                        className={cn(
                                                            "flex items-center gap-3 w-full text-left px-4 py-3 text-[13px] font-bold border-b border-gray-50 last:border-0 transition-colors",
                                                            braceletMode === key ? "text-[#CF9A8D] bg-[#F4E5E2]" : "text-gray-700 hover:bg-gray-50"
                                                        )}
                                                    >
                                                        <img src={imageSrc} alt={label} className="w-5 h-5 object-contain" />
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Category Tabs */}
                                <div
                                    ref={categoryContainerRef}
                                    onMouseDown={handleMouseDownCategory}
                                    onMouseLeave={handleMouseLeaveCategory}
                                    onMouseUp={handleMouseUpCategory}
                                    onMouseMove={handleMouseMoveCategory}
                                    className={cn(
                                        "flex-1 flex gap-1.5 overflow-x-auto scrollbar-thin py-2 transition-all cursor-grab active:cursor-grabbing",
                                        isSearchExpanded ? "hidden lg:flex" : "flex"
                                    )}
                                >
                                    {Object.entries(categoryLabels)
                                        .filter(([slug]) => !requiredSlugs.includes(slug))
                                        .map(([slug, label]) => (
                                            <button
                                                key={slug}
                                                onClick={(e) => {
                                                    if (isDragged) {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        return;
                                                    }
                                                    setActiveCategory(slug as BeadCategory);
                                                }}
                                                className={cn(
                                                    "px-3 h-[30px] text-[10px] lg:text-[11px] font-bold rounded-lg transition-all whitespace-nowrap border flex-shrink-0 flex items-center justify-center",
                                                    activeCategory === slug
                                                        ? "bg-[#CF9A8D] text-white border-[#CF9A8D] shadow-sm"
                                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                                                )}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                </div>

                                {/* Expandable Search Bar on Mobile only */}
                                <div className={cn(
                                    "relative transition-all duration-300 flex items-center lg:hidden",
                                    isSearchExpanded ? "flex-1 w-full" : "w-auto"
                                )}>
                                    {/* Mobile Closed State Button */}
                                    <button
                                        className={cn(
                                            "h-[36px] w-[36px] flex items-center justify-center rounded-lg transition-colors text-gray-500 hover:text-gray-800",
                                            isSearchExpanded ? "hidden" : "block"
                                        )}
                                        onClick={() => setIsSearchExpanded(true)}
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>

                                    {/* Mobile Input Container */}
                                    {isSearchExpanded && (
                                        <div className="relative w-full group">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CF9A8D] transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Tìm loại đá, charm..."
                                                value={searchTerm}
                                                autoFocus
                                                onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg h-[36px] pl-9 pr-8 text-[11px] focus:ring-2 focus:ring-[#CF9A8D]/20 focus:border-[#CF9A8D] transition-all outline-none"
                                            />
                                            <button
                                                onClick={() => {
                                                    setIsSearchExpanded(false);
                                                    if (setSearchTerm) setSearchTerm('');
                                                }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bead Grid Area */}
                        <div className="px-3 lg:px-6 pt-1 pb-3 lg:py-4">
                            {selectedIdx !== null && selectedBeads[selectedIdx] && setSelectedIdx && updateCalibration && reset && syncAll && isAdmin && saveDefaultCalibration ? (
                                <div className="lg:hidden h-full">
                                    <MobileCalibrationPanel
                                        index={selectedIdx}
                                        bead={selectedBeads[selectedIdx]}
                                        updateCalibration={updateCalibration}
                                        syncAll={syncAll}
                                        reset={reset}
                                        removeBead={removeBead}
                                        onClose={() => setSelectedIdx(null)}
                                        saveDefault={saveDefaultCalibration}
                                    />
                                </div>
                            ) : activeCategory === 'custom' ? (
                                <CustomAssetsGrid
                                    customAssets={customAssets}
                                    selectedBeads={selectedBeads}
                                    isAtLimit={isAtLimit}
                                    maxBeadsLimit={maxBeadsLimit}
                                    addBead={addBead}
                                    fileInputRef={fileInputRef}
                                    handleImageUpload={handleImageUpload}
                                    isAdmin={isAdmin}
                                />
                            ) : (
                                <BeadGrid
                                    category={activeCategory}
                                    isAtLimit={isAtLimit}
                                    addBead={addBead}
                                    availableBeads={availableBeads}
                                    searchTerm={searchTerm}
                                    requiredSlugs={requiredSlugs}
                                    selectedStopperId={selectedStopperId}
                                    setSelectedStopperId={setSelectedStopperId}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Old footer section removed as requested */}
        </div>
    );
}

// ─── Sub-components ────────────────────────────────────────────────

function BeadGrid({
    category, isAtLimit, addBead, availableBeads = AVAILABLE_BEADS, searchTerm = '',
    requiredSlugs = [], selectedStopperId, setSelectedStopperId
}: {
    category: BeadCategory;
    isAtLimit: boolean;
    addBead: (bead: Bead) => void;
    availableBeads?: Bead[];
    searchTerm?: string;
    requiredSlugs?: string[];
    selectedStopperId?: string | null;
    setSelectedStopperId?: (id: string | null) => void;
}) {
    const [selectedSize, setSelectedSize] = React.useState<number | null>(null);

    const categoryBeads = availableBeads.filter(b => b.type === category);

    // Build a map of numeric size → display label
    // Use the first bead's displaySize for each unique numeric size
    const sizeDisplayMap = React.useMemo(() => {
        const map = new Map<number, string>();
        categoryBeads.forEach(b => {
            const numSize = Number(b.size) || 0;
            if (numSize > 0 && !map.has(numSize)) {
                map.set(numSize, b.displaySize || `${numSize}mm`);
            }
        });
        return map;
    }, [categoryBeads]);

    const uniqueSizes = Array.from(sizeDisplayMap.keys()).sort((a, b) => a - b);

    const activeSize = selectedSize !== null && uniqueSizes.includes(selectedSize)
        ? selectedSize
        : (uniqueSizes.length > 0 ? uniqueSizes[0] : null);

    const filteredBeads = categoryBeads.filter(b =>
        (activeSize === null || b.size === activeSize) &&
        (b.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.type.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex flex-col space-y-1.5 lg:space-y-3">
            {/* Size Selector */}
            {uniqueSizes.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-0 lg:pb-1 mb-1 lg:mb-0">
                    <span className="text-[10px] lg:text-xs font-semibold text-gray-500 whitespace-nowrap px-1">Size:</span>
                    {uniqueSizes.map(size => (
                        <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                                "px-2 lg:px-3 py-0.5 h-[22px] lg:h-[26px] text-[10px] lg:text-xs font-bold rounded-lg transition-all whitespace-nowrap border lg:rounded-xl flex items-center justify-center",
                                activeSize === size
                                    ? "bg-[#E7CCC6] text-[#553831] border-[#E7CCC6] shadow-sm"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            {sizeDisplayMap.get(size) || `${size}mm`}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-2 lg:gap-4 pb-2 lg:pb-0 scrollbar-hide snap-x px-0.5">
                {filteredBeads.map(bead => (
                    <motion.button
                        key={bead.id}
                        whileHover={{ scale: isAtLimit ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            // If this bead is a stopper/required item, toggle it instead of adding normally
                            const isStopper = requiredSlugs.includes(bead.type) || bead.type === 'stopper';
                            if (isStopper && setSelectedStopperId) {
                                if (selectedStopperId === bead.id) {
                                    setSelectedStopperId(null);
                                } else {
                                    setSelectedStopperId(bead.id);
                                }
                                return;
                            }
                            addBead(bead);
                        }}
                        disabled={isAtLimit}
                        className={cn(
                            "group relative bg-white border-2 rounded-xl lg:rounded-2xl p-2 lg:p-3 flex flex-col items-center transition-all shrink-0 w-[76px] lg:w-auto snap-start lg:snap-align-none",
                            selectedStopperId === bead.id
                                ? "border-[#CF9A8D] shadow-md ring-2 ring-[#F3E4E0]"
                                : "border-[#F3E4E0] hover:shadow-lg hover:border-[#CF9A8D]",
                            isAtLimit && !selectedStopperId && "opacity-40 cursor-not-allowed"
                        )}
                    >
                        <div className="relative w-12 h-12 lg:w-16 lg:h-16 mb-2 flex flex-shrink-0 items-center justify-center">
                            {bead.imageUrl ? (
                                <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full overflow-hidden shadow-sm">
                                    <img
                                        src={bead.imageUrl}
                                        alt={bead.label}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div
                                    className="w-10 h-10 lg:w-14 lg:h-14 rounded-full shadow-sm"
                                    style={{
                                        background: `radial-gradient(circle at 35% 35%, #fff, ${bead.color}, ${bead.color})`,
                                    }}
                                />
                            )}
                            {bead.shape === 'heart' && !bead.imageUrl && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-white/40 fill-white/20" />
                                </div>
                            )}

                            {/* Price Tag Overlay */}
                            <div
                                className="absolute -top-1 -right-6 lg:-top-2 lg:-right-8 text-[8px] lg:text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-md"
                                style={{
                                    background: 'linear-gradient(to bottom, #CB9487, #FFFFFF)',
                                    color: '#4C322C',
                                    fontFamily: 'var(--font-roboto), Roboto, sans-serif'
                                }}
                            >
                                {bead.price.toLocaleString('vi-VN')}đ
                            </div>
                        </div>

                        {/* Bead Name */}
                        <span
                            className="w-full text-[9px] lg:text-[11px] font-semibold leading-tight text-center line-clamp-2 mt-auto"
                            style={{ color: '#553831', fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                        >
                            {bead.label}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

function CustomAssetsGrid({ customAssets, selectedBeads, isAtLimit, maxBeadsLimit, addBead, fileInputRef, handleImageUpload, isAdmin }: {
    customAssets: Bead[];
    selectedBeads: Bead[];
    isAtLimit: boolean;
    maxBeadsLimit: number;
    addBead: (b: Bead) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isAdmin: boolean;
}) {
    return (
        <div className="space-y-8">
            <input
                type="file" ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*" className="hidden"
            />

            <div className="grid grid-cols-2 gap-4 lg:gap-5">
                {/* Upload Button */}
                {isAdmin && (
                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-luxury-gold/20 rounded-[40px] flex flex-col items-center justify-center space-y-2 transition-colors bg-luxury-silk/30"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-luxury flex items-center justify-center text-luxury-gold border border-luxury-gold/10">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-luxury-gold/80">Mẫu Mới</span>
                    </motion.button>
                )}

                {/* Gallery */}
                {customAssets.map(asset => (
                    <motion.button
                        key={asset.id}
                        whileHover={{ scale: isAtLimit ? 1 : 1.05, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addBead(asset)}
                        disabled={isAtLimit}
                        className={cn(
                            "group relative bg-white border border-luxury-gold/10 rounded-[40px] aspect-square flex flex-col items-center justify-center transition-all",
                            isAtLimit
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:shadow-[0_20px_50px_-15px_rgba(212,175,55,0.15)] hover:border-luxury-gold/30"
                        )}
                    >
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full shadow-lg overflow-hidden border border-luxury-gold/5">
                                <img src={asset.imageUrl} alt="Custom" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <span className="text-[8px] font-black text-luxury-gold mt-2 tracking-widest uppercase">Thư Viện</span>
                    </motion.button>
                ))}
            </div>

            {customAssets.length === 0 && (
                <div className="p-6 lg:p-8 bg-luxury-cream/50 rounded-[32px] border border-luxury-gold/15 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-12 h-12 text-luxury-gold" />
                    </div>
                    <p className="text-[11px] text-luxury-onyx/80 font-medium leading-relaxed italic relative z-10">
                        "Tải lên dấu ấn của bạn để lưu vào xưởng chế tác cá nhân. Tái sử dụng chúng bao nhiêu lần tùy thích cho mọi thiết kế của bạn."
                    </p>
                </div>
            )}
        </div>
    );
}

// Removed SidebarFooter

// ─── Mobile Calibration Panel ────────────────────────────────────────

function MobileCalibrationPanel({ index, bead, updateCalibration, syncAll, reset, removeBead, onClose, saveDefault }: {
    index: number;
    bead: Bead;
    updateCalibration: (idx: number, updates: any) => void;
    syncAll: (idx: number) => void;
    reset: (idx: number) => void;
    removeBead: (idx: number) => void;
    onClose: () => void;
    saveDefault: (idx: number) => void;
}) {
    return (
        <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-sm font-bold text-gray-800">Hiệu chỉnh điểm treo</h3>
                    <p className="text-[10px] text-gray-500">{bead.label}</p>
                </div>
                <button
                    onClick={onClose}
                    className="px-4 py-1.5 bg-purple-600 text-white text-[10px] font-bold uppercase rounded-full shadow-sm"
                >
                    Xong
                </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto pb-6 pr-1">
                <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-semibold text-gray-700">
                        <span>Vị trí X (Ngang)</span>
                        <span className="text-purple-600">{Math.round((bead.anchorX || 0.5) * 100)}%</span>
                    </div>
                    <input
                        type="range" min="0" max="1" step="0.01"
                        value={bead.anchorX ?? 0.5}
                        onChange={(e) => updateCalibration(index, { anchorX: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-semibold text-gray-700">
                        <span>Vị trí Y (Dọc)</span>
                        <span className="text-purple-600">{Math.round((bead.anchorY || (bead.type === 'charm' ? 0 : 0.5)) * 100)}%</span>
                    </div>
                    <input
                        type="range" min="0" max="1" step="0.01"
                        value={bead.anchorY ?? (bead.type === 'charm' ? 0 : 0.5)}
                        onChange={(e) => updateCalibration(index, { anchorY: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-semibold text-gray-700">
                        <span>Xoay Phụ Kiện</span>
                        <span className="text-purple-600">{bead.rotationOffset || 0}°</span>
                    </div>
                    <input
                        type="range" min="-180" max="180" step="1"
                        value={bead.rotationOffset ?? 0}
                        onChange={(e) => updateCalibration(index, { rotationOffset: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-4">
                    <div className="flex justify-between text-[11px] font-semibold text-gray-700">
                        <span>Kích thước đá/charm</span>
                        <span className="text-purple-600">{Math.round((bead.scale || 1.0) * 100)}%</span>
                    </div>
                    <input
                        type="range" min="0.5" max="2.5" step="0.05"
                        value={bead.scale ?? 1.0}
                        onChange={(e) => updateCalibration(index, { scale: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between text-[9px] text-gray-400">
                        <span>Nhỏ</span>
                        <span>Mặc định</span>
                        <span>Lớn</span>
                    </div>
                </div>

                <div className="flex gap-2 pt-2 flex-wrap">
                    <button
                        onClick={() => syncAll(index)}
                        className="flex-1 min-w-[45%] py-3 bg-gray-800 text-white text-[10px] font-bold uppercase rounded-xl shadow-sm active:scale-95 transition-all"
                    >
                        Đồng bộ tất cả
                    </button>
                    <button
                        onClick={() => saveDefault(index)}
                        className="flex-1 min-w-[45%] py-3 bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-xl active:scale-95 transition-all"
                    >
                        Lưu mặc định
                    </button>
                    <button
                        onClick={() => reset(index)}
                        className="flex-1 min-w-[45%] py-3 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-xl active:scale-95 transition-all"
                    >
                        Reset
                    </button>
                    <button
                        onClick={() => { removeBead(index); onClose(); }}
                        className="flex-1 min-w-[45%] py-3 bg-red-50 text-red-500 text-[10px] font-bold uppercase rounded-xl hover:bg-red-100 active:scale-95 transition-all"
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
}
