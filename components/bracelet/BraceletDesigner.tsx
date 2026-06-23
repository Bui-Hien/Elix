"use client";

import React, { useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { toast } from 'sonner';
import { Plus, Minus, RotateCcw } from 'lucide-react';

import { Bead, BRACELET_CONFIG, calculateBeadAngle } from './types';
import DesignerSidebar from './DesignerSidebar';
import DesignerCanvas, { DesignerCanvasHandle } from './DesignerCanvas';
import BeadPreviewCircle from '@/app/(shop)/customize/components/BeadPreviewCircle';
import DesignerControls from './DesignerControls';
import { BeadCalculator } from '@/lib/diy-utils';
import { useCart } from '@/hooks/use-cart';

// Redux
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { 
    setSelectedIdx, setZoomScale, setRotation, updateBeadCalibration as updateBeadCalibrationInStore, 
    syncAllSameType as syncAllSameTypeInStore, resetBeadCalibration as resetBeadCalibrationInStore,
    setActiveCategory, setBraceletMode, setSelectedBaseId, setSelectedStopperId, setSearchTerm
} from '@/lib/redux/slices/designerSlice';

// Custom Hooks
import { useBraceletDesignerData } from '@/hooks/use-bracelet-designer';
import { useDesignerActions } from '@/hooks/use-designer-actions';

// Helpers
const getDrawSize = (bead: Bead) => {
    if (bead.type === 'stone') return (bead.size || 10) * 8.5;
    if (bead.type === 'charm') return (bead.size || 10) * 10;
    if (bead.type === 'spacer' || bead.shape === 'tube' || bead.shape === 'ring') return (bead.size || 10) * 5.5;
    if (bead.type === 'stopper') return (bead.size || 10) * 8;
    return (bead.size || 10) * 8;
};

export default function BraceletDesigner() {
    const canvasRef = useRef<DesignerCanvasHandle>(null);
    const router = useRouter();
    const { addCustomItemToCart } = useCart();
    const { user } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role === 'Admin';
    const dispatch = useAppDispatch();

    // 1. Fetch data
    useBraceletDesignerData();

    // 2. Redux state
    const state = useAppSelector(s => s.designer);
    const { 
        selectedBeads, activeCategory, braceletMode, customAssets, selectedIdx, 
        availableBeads, selectedBaseId, selectedStopperId, zoomScale, rotation, 
        searchTerm, categories, requiredSlugs, beadMaterials 
    } = state;

    // 3. Actions
    const {
        addBead, removeBead, swapBeads, clearLastBead, resetDesigner,
        handleSaveDraft, handleLoadDraft, saveDefaultCalibration,
        baseBead, braceletBases, maxBeadsLimit
    } = useDesignerActions();

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Callbacks for Calibration Panel
    const updateBeadCalibration = useCallback((index: number, updates: any) => {
        dispatch(updateBeadCalibrationInStore({ index, updates }));
    }, [dispatch]);

    const syncAllSameType = useCallback((index: number) => {
        dispatch(syncAllSameTypeInStore(index));
        toast.success(`Đã áp dụng hiệu chỉnh cho tất cả phụ kiện cùng loại`);
    }, [dispatch]);

    const resetBeadCalibration = useCallback((index: number) => {
        dispatch(resetBeadCalibrationInStore(index));
        toast.info("Đã đặt lại hiệu chỉnh cho vật phẩm này");
    }, [dispatch]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Implementation kept minimal for brevity, if needed it can be fully restored
    };

    const handleAddToCart = useCallback(async (customImageStr: string) => {
        if (!selectedBeads || selectedBeads.length === 0) {
            toast.error("Vui lòng thiết kế vòng trước khi thêm vào giỏ hàng");
            return;
        }

        try {
            const currentTotal = BeadCalculator.calculateTotalPrice(selectedBeads);
            const basePrice = braceletMode === 'mini' && baseBead ? baseBead.price : 0;
            const finalPrice = currentTotal + basePrice;

            const MODE_NAMES: Record<string, string> = { full: 'Vòng Hạt', mini: 'Dây Cáp', single: 'Vòng Cổ' };
            const productName = `Thiết Kế ${MODE_NAMES[braceletMode] || braceletMode} Tùy Chỉnh`;

            const wristSize = BeadCalculator.calculateWristSize(selectedBeads).value;
            const wristSizeText = braceletMode === 'full' ? `(Size: ${wristSize}cm)` : '';

            // Group beads
            const beadCounts = selectedBeads.reduce((acc, bead) => {
                const label = bead.label || (bead as any).name || bead.id;
                acc[label] = (acc[label] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            const attributes = Object.entries(beadCounts).map(([label, count]) => `${count}x ${label}`);

            if (braceletMode === 'mini' && baseBead) {
                attributes.unshift(`Dây: ${baseBead.label || (baseBead as any).name || baseBead.id}`);
            }

            const itemForCart = {
                id: `custom-${Date.now()}`,
                name: `${productName} ${wristSizeText}`,
                price: finalPrice,
                quantity: 1,
                image: customImageStr || '/images/default-bracelet.png',
                attributes: attributes
            };

            addCustomItemToCart(itemForCart as any);
            toast.success("Đã thêm thiết kế vào giỏ hàng!");
            router.push('/cart');
        } catch (e) {
            toast.error("Lỗi thêm giỏ hàng. Vui lòng thử lại.");
        }
    }, [selectedBeads, braceletMode, baseBead, addCustomItemToCart, router]);

    // Canvas Logic
    const { centerX, centerY } = BRACELET_CONFIG;
    const modeConfig = BRACELET_CONFIG[braceletMode];
    const minBeadsLimit = modeConfig.minBeads || 0;

    const beadsWithPositions = useMemo(() => {
        const total = selectedBeads.length;
        if (total === 0) return [];

        let dynamicRadius = modeConfig.canvasRadius;
        const useEllipse = braceletMode === 'mini';
        const ellipseCenterX = baseBead?.ellipseCenterX;
        const ellipseCenterY = baseBead?.ellipseCenterY;
        const ellipseRadiusX = baseBead?.ellipseRadiusX;
        const ellipseRadiusY = baseBead?.ellipseRadiusY;
        const arcStartAngle = baseBead?.arcStartAngle;
        const arcEndAngle = baseBead?.arcEndAngle;

        // Old logic multipliers
        const chosenScale = modeConfig.beadScale || 1.0;
        const roundPosMult = 14.7;
        const specialPosMult = 15;
        const spacerMult = 8.8;

        if (braceletMode === 'full' && total > 1) {
            const minRadius = modeConfig.canvasRadius * 0.7;
            const maxRadius = modeConfig.canvasRadius;
            const minScale = 0.65;
            const roundSizeMult = roundPosMult;
            const specialSizeMult = 13.2;

            let totalBeadWidthAtScale1 = 0;
            for (const b of selectedBeads) {
                const isSpecial = b.type === 'charm';
                const isSpacer = b.type === 'spacer' || b.shape === 'tube' || b.shape === 'ring';
                const sizeMultiplier = isSpacer ? spacerMult : (isSpecial ? specialSizeMult : roundSizeMult);
                totalBeadWidthAtScale1 += (b.size || 10) * sizeMultiplier * (b.scale || 1);
            }

            const minCircumference = 2 * Math.PI * minRadius;
            const scaleForMinRadius = totalBeadWidthAtScale1 > 0 ? minCircumference / totalBeadWidthAtScale1 : 1.35;

            if (scaleForMinRadius >= minScale) {
                dynamicRadius = minRadius;
            } else {
                const neededCircumference = totalBeadWidthAtScale1 * minScale;
                dynamicRadius = Math.min(maxRadius, neededCircumference / (2 * Math.PI));
            }
        }

        const getSpacingMultiplier = (b: Bead) => {
            if (b.type === 'charm') return 0.45;
            if (b.type === 'stone') return 0.65;
            if (b.type === 'spacer' || b.shape === 'tube' || b.shape === 'ring') return 0.55;
            if (b.type === 'stopper') return 0.7;
            return 0.55;
        };

        return selectedBeads.map((bead, index) => {
            let x: number, y: number, angle: number;
            const drawSize = getDrawSize(bead);

            if (useEllipse && ellipseCenterX !== undefined && ellipseCenterY !== undefined &&
                ellipseRadiusX !== undefined && ellipseRadiusY !== undefined &&
                arcStartAngle !== undefined && arcEndAngle !== undefined) {

                const baseImageSize = dynamicRadius * 2;
                const rx = ellipseRadiusX * baseImageSize;
                const ry = ellipseRadiusY * baseImageSize;
                const avgRadius = (rx + ry) / 2;

                let totalChainLength = 0;
                for (let i = 0; i < selectedBeads.length; i++) {
                    const ds = getDrawSize(selectedBeads[i]);
                    if (i === 0 || i === selectedBeads.length - 1) {
                        totalChainLength += ds / 2;
                    } else {
                        totalChainLength += ds * getSpacingMultiplier(selectedBeads[i]);
                    }
                }

                const totalChainAngle = totalChainLength / avgRadius;
                const midArcAngle = (arcStartAngle + arcEndAngle) / 2;
                const centeredStartAngle = midArcAngle - (totalChainAngle / 2);

                let cumulativeLength = 0;
                for (let i = 0; i < index; i++) {
                    const ds = getDrawSize(selectedBeads[i]);
                    cumulativeLength += ds * getSpacingMultiplier(selectedBeads[i]);
                }

                cumulativeLength += drawSize / 2;
                const arcLengthToAngle = cumulativeLength / avgRadius;
                angle = centeredStartAngle + arcLengthToAngle;

                const baseImageLeft = centerX - dynamicRadius;
                const baseImageTop = centerY - dynamicRadius;
                const cx = ellipseCenterX * baseImageSize + baseImageLeft;
                const cy = ellipseCenterY * baseImageSize + baseImageTop;

                x = cx + Math.cos(angle) * rx;
                y = cy + Math.sin(angle) * ry;
            } else if (braceletMode === 'full') {
                let totalBeadCircumference = 0;
                for (const b of selectedBeads) {
                    const isSpecial = b.type === 'charm';
                    const isSpacer = b.type === 'spacer' || b.shape === 'tube' || b.shape === 'ring';
                    const positionMultiplier = isSpacer ? spacerMult : (isSpecial ? specialPosMult : roundPosMult);
                    totalBeadCircumference += (b.size || 10) * positionMultiplier * chosenScale * (b.scale || 1);
                }

                let cumulativeArc = 0;
                for (let i = 0; i < index; i++) {
                    const b = selectedBeads[i];
                    const isSpecial = b.type === 'charm';
                    const isSpacer = b.type === 'spacer' || b.shape === 'tube' || b.shape === 'ring';
                    const positionMultiplier = isSpacer ? spacerMult : (isSpecial ? specialPosMult : roundPosMult);
                    cumulativeArc += (b.size || 10) * positionMultiplier * chosenScale * (b.scale || 1);
                }

                const isSpecial = bead.type === 'charm';
                const isSpacer = bead.type === 'spacer' || bead.shape === 'tube' || bead.shape === 'ring';
                const positionMultiplier = isSpacer ? spacerMult : (isSpecial ? specialPosMult : roundPosMult);
                const positionLength = (bead.size || 10) * positionMultiplier * chosenScale * (bead.scale || 1);

                const position = cumulativeArc + positionLength / 2;
                angle = totalBeadCircumference > 0
                    ? (position / totalBeadCircumference) * (2 * Math.PI) - (Math.PI / 2)
                    : 0;

                x = centerX + Math.cos(angle) * dynamicRadius;
                y = centerY + Math.sin(angle) * dynamicRadius;
            } else {
                angle = calculateBeadAngle(index, total, braceletMode, arcStartAngle, arcEndAngle);
                x = centerX + Math.cos(angle) * dynamicRadius;
                y = centerY + Math.sin(angle) * dynamicRadius;
            }

            return { ...bead, x, y, scale: 1, drawSize, angle, originalIndex: index };
        });
    }, [selectedBeads, braceletMode, modeConfig, centerX, centerY, baseBead]);

    const canvasRadius = modeConfig.canvasRadius; // simplified for now

    const totalValue = useMemo(() => {
        const beadsValue = BeadCalculator.calculateTotalPrice(selectedBeads);
        if (braceletMode === 'mini') {
            return beadsValue + (baseBead?.price || 0);
        }
        return beadsValue;
    }, [selectedBeads, braceletMode, baseBead]);

    const wristSizeInfo = useMemo(() => BeadCalculator.calculateWristSize(selectedBeads), [selectedBeads]);

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] overflow-hidden">
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-gray-50/50">
                <div className="w-full lg:w-[30%] lg:flex-none flex-1 lg:h-full bg-white border-t lg:border-t-0 lg:border-r border-gray-200 flex-shrink-0 order-2 lg:order-1 flex flex-col min-h-0">
                    <DesignerSidebar
                        selectedBeads={selectedBeads}
                        activeCategory={activeCategory}
                        setActiveCategory={(cat) => dispatch(setActiveCategory(cat as string))}
                        braceletMode={braceletMode}
                        setBraceletMode={(mode) => dispatch(setBraceletMode(mode))}
                        addBead={addBead}
                        customAssets={customAssets}
                        totalValue={totalValue}
                        minBeadsLimit={minBeadsLimit}
                        maxBeadsLimit={maxBeadsLimit}
                        fileInputRef={fileInputRef}
                        handleImageUpload={handleImageUpload}
                        onAddToCart={() => handleAddToCart("")}
                        availableBeads={availableBeads}
                        braceletBases={braceletBases}
                        selectedBaseId={selectedBaseId || undefined}
                        setSelectedBaseId={(id) => dispatch(setSelectedBaseId(id || null))}
                        availableStoppers={availableBeads.filter(b => b.type === 'stopper' || requiredSlugs.includes(b.type))}
                        selectedStopperId={selectedStopperId}
                        setSelectedStopperId={(id) => dispatch(setSelectedStopperId(id))}
                        searchTerm={searchTerm}
                        setSearchTerm={(term) => dispatch(setSearchTerm(term))}
                        selectedIdx={selectedIdx}
                        setSelectedIdx={(idx) => dispatch(setSelectedIdx(idx))}
                        updateCalibration={updateBeadCalibration}
                        syncAll={syncAllSameType}
                        reset={resetBeadCalibration}
                        removeBead={removeBead}
                        categoryLabels={categories}
                        requiredSlugs={requiredSlugs}
                        isAdmin={isAdmin}
                        saveDefaultCalibration={saveDefaultCalibration}
                    />
                </div>

                <div className="h-1/2 lg:h-full lg:w-[70%] lg:flex-none lg:flex-1 relative flex flex-col overflow-hidden order-1 lg:order-2 bg-white lg:bg-transparent shadow-sm lg:shadow-none z-10">
                    <div className="flex-shrink-0">
                        <DesignerControls
                            clearLastBead={clearLastBead}
                            resetDesigner={resetDesigner}
                            hasBeads={selectedBeads.length > 0}
                            totalValue={totalValue}
                            wristSizeInfo={wristSizeInfo as any}
                            count={selectedBeads.length}
                            maxBeadsLimit={maxBeadsLimit}
                            onAddToCart={() => handleAddToCart("")}
                            onSaveDraft={handleSaveDraft}
                            onLoadDraft={handleLoadDraft}
                        />
                    </div>

                    <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                        <div className="w-full h-full min-h-[400px] flex items-center justify-center relative">
                            {braceletMode === 'full' ? (
                                <BeadPreviewCircle 
                                    beads={selectedBeads} 
                                    setBeads={(b: any) => dispatch({type: 'designer/setSelectedBeads', payload: b})} 
                                    rotation={rotation} 
                                    setRotation={(r: any) => dispatch(setRotation(r))}
                                    beadMaterials={beadMaterials}
                                    zoomScale={zoomScale}
                                />
                            ) : (
                                <DesignerCanvas
                                    ref={canvasRef}
                                    beads={beadsWithPositions}
                                    braceletMode={braceletMode}
                                    centerX={centerX}
                                    centerY={centerY}
                                    radiusX={canvasRadius}
                                    radiusY={canvasRadius}
                                    swapBeads={swapBeads}
                                    removeBead={removeBead}
                                    selectedIdx={selectedIdx}
                                    onSelect={(idx) => dispatch(setSelectedIdx(idx))}
                                    baseImageUrl={baseBead?.imageUrl}
                                    zoomScale={zoomScale}
                                    rotation={rotation}
                                    setRotation={(r) => dispatch(setRotation(r))}
                                />
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-20 right-4 lg:bottom-24 lg:right-8 flex flex-col gap-2 z-40 bg-white/90 backdrop-blur-md rounded-full shadow-md border border-gray-100 p-1">
                        <button onClick={() => dispatch(setZoomScale(Math.min(zoomScale + 0.1, 2.5)))} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                        <div className="w-full h-px bg-gray-200" />
                        <button onClick={() => dispatch(setZoomScale(Math.max(zoomScale - 0.1, 0.5)))} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                            <Minus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-md border border-gray-100">
                        <RotateCcw className="w-4 h-4 text-gray-500" />
                        <input 
                            type="range" min="0" max="360" 
                            value={rotation}
                            onChange={(e) => dispatch(setRotation(Number(e.target.value)))}
                            className="w-32 lg:w-48 accent-[#CF9A8D]"
                        />
                        <span className="text-xs font-medium text-gray-600 w-8">{rotation}°</span>
                    </div>

                    {selectedIdx !== null && selectedBeads[selectedIdx] && isAdmin && (
                        <div className="hidden lg:block">
                            <CalibrationPanel
                                index={selectedIdx}
                                bead={selectedBeads[selectedIdx]}
                                updateCalibration={updateBeadCalibration}
                                syncAll={syncAllSameType}
                                reset={resetBeadCalibration}
                                removeBead={removeBead}
                                onClose={() => dispatch(setSelectedIdx(null))}
                                saveDefault={saveDefaultCalibration}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CalibrationPanel({ index, bead, updateCalibration, syncAll, reset, removeBead, onClose, saveDefault }: any) {
    const handleDelete = () => {
        removeBead(index);
        onClose();
    };
    return (
        <motion.div
            drag
            dragMomentum={false}
            dragElastic={0.1}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute bottom-4 right-4 md:bottom-10 md:right-10 w-80 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border-2 border-purple-200 z-50 space-y-4 touch-none cursor-default"
        >
            <div className="flex justify-between items-center mb-2 cursor-move">
                <div>
                    <h3 className="text-sm font-bold text-gray-800">Hiệu chỉnh điểm treo</h3>
                    <p className="text-xs text-gray-500">{bead.label}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>Vị trí X (Ngang)</span>
                        <span className="text-purple-600">{Math.round((bead.anchorX || 0.5) * 100)}%</span>
                    </div>
                    <input
                        type="range" min="0" max="1" step="0.01"
                        value={bead.anchorX ?? 0.5}
                        onChange={(e) => updateCalibration(index, { anchorX: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600"
                    />
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>Vị trí Y (Dọc)</span>
                        <span className="text-purple-600">{Math.round((bead.anchorY || 0.5) * 100)}%</span>
                    </div>
                    <input
                        type="range" min="0" max="1" step="0.01"
                        value={bead.anchorY ?? 0.5}
                        onChange={(e) => updateCalibration(index, { anchorY: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>Góc Xoay (Độ)</span>
                        <span className="text-purple-600">{bead.rotationOffset ?? 0}°</span>
                    </div>
                    <input
                        type="range" min="-180" max="180" step="1"
                        value={bead.rotationOffset ?? 0}
                        onChange={(e) => updateCalibration(index, { rotationOffset: parseInt(e.target.value) })}
                        className="w-full accent-purple-600"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>Tỷ lệ thu phóng</span>
                        <span className="text-purple-600">{((bead.scale ?? 1.0) * 100).toFixed(0)}%</span>
                    </div>
                    <input
                        type="range" min="0.5" max="1.5" step="0.01"
                        value={bead.scale ?? 1.0}
                        onChange={(e) => updateCalibration(index, { scale: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600"
                    />
                </div>
            </div>

            <div className="pt-2 flex gap-2">
                <button
                    onClick={() => saveDefault(index)}
                    className="flex-1 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-200 transition-colors"
                >
                    Lưu Mặc định
                </button>
                <button
                    onClick={() => syncAll(index)}
                    className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors"
                >
                    Đồng bộ All
                </button>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => reset(index)}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                    Khôi phục
                </button>
                <button
                    onClick={handleDelete}
                    className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
                >
                    Xóa Hạt
                </button>
            </div>
        </motion.div>
    );
}
