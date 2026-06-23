"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';
import {
    Plus, Minus, Search, Trash2, RotateCcw, ChevronDown, ChevronUp
} from 'lucide-react';
import {
    Bead, BeadWithPosition, BraceletMode, BeadCategory, AccessoryShape,
    AVAILABLE_BEADS, BRACELET_CONFIG, INITIAL_PATTERNS, calculateBeadAngle,
    CATEGORY_LABELS
} from './types';
import DesignerSidebar from './DesignerSidebar';
import DesignerCanvas, { DesignerCanvasHandle } from './DesignerCanvas';
import BeadPreviewCircle from '@/app/(shop)/customize/components/BeadPreviewCircle';
import DesignerControls, { BraceletDraft, saveDraftToStorage } from './DesignerControls';
import apiClient from '@/lib/api-client';
import { BeadCalculator } from '@/lib/diy-utils';
import { useCart } from '@/hooks/use-cart';
import { useAppSelector } from '@/lib/redux/hooks';

// Helper to convert SVG string to PNG Data URL
// Helper to convert SVG string to high-resolution PNG Data URL with white background
const svgToDataURL = async (svgStr: string): Promise<string> => {
    // 1. Inline images as Data URLs to ensure they render on canvas
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgStr, "image/svg+xml");
    const svgEl = doc.querySelector("svg");

    if (svgEl) {
        // Use VERY HIGH resolution for crisp display in cart - 2400x2400
        svgEl.setAttribute("width", "2400");
        svgEl.setAttribute("height", "2400");

        const images = Array.from(doc.querySelectorAll("image"));
        await Promise.all(images.map(async (img) => {
            const href = img.getAttribute("href") || img.getAttribute("xlink:href");
            if (href && !href.startsWith("data:")) {
                try {
                    // Fetch the image and convert to Base64
                    const response = await fetch(href);
                    if (response.ok) {
                        const blob = await response.blob();
                        const dataUrl = await new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(blob);
                        });
                        img.setAttribute("href", dataUrl);
                    }
                } catch (e) {
                    console.error("Failed to inline image during SVG capture:", href, e);
                }
            }
        }));
    }

    const inlinedSvgStr = new XMLSerializer().serializeToString(doc);

    return new Promise((resolve) => {
        const svgBlob = new Blob([inlinedSvgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new globalThis.Image();

        img.onload = () => {
            // Create high-resolution canvas - 2400x2400 for crisp display
            const canvas = document.createElement('canvas');
            canvas.width = 2400;
            canvas.height = 2400;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // White background for better visibility
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            }
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve("");
        };
        img.src = url;
    });
};

export default function BraceletDesigner() {
    const canvasRef = useRef<DesignerCanvasHandle>(null);
    const router = useRouter();
    const { addCustomItemToCart } = useCart();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role === 'Admin';

    const [selectedBeads, setSelectedBeads] = useState<Bead[]>([]);
    const [activeCategory, setActiveCategory] = useState<BeadCategory>('stone');
    const [braceletMode, setBraceletMode] = useState<BraceletMode>('full');
    const [customAssets, setCustomAssets] = useState<Bead[]>([]);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [availableBeads, setAvailableBeads] = useState<Bead[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedBaseId, setSelectedBaseId] = useState<string | null>(null);
    const [selectedStopperId, setSelectedStopperId] = useState<string | null>(null);
    const [zoomScale, setZoomScale] = useState(1);
    const [rotation, setRotation] = useState(0); // Bracelet rotation angle
    const pinchDistRef = useRef<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<Record<string, string>>({});
    const [requiredSlugs, setRequiredSlugs] = useState<string[]>([]);
    const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
    const [beadMaterials, setBeadMaterials] = useState<any[]>([]); // For BeadPreviewCircle

    // ── Draft save/load ─────────────────────────────────────────────────
    const handleSaveDraft = useCallback(() => {
        const MODE_NAMES: Record<string, string> = { full: 'Vòng Hạt', mini: 'Dây Cáp', single: 'Vòng Cổ' };
        const draftId = currentDraftId || `draft-${Date.now()}`;
        const now = Date.now();
        const draft: BraceletDraft = {
            id: draftId,
            name: `${MODE_NAMES[braceletMode] || braceletMode} - ${selectedBeads.length} hạt`,
            braceletMode,
            beads: selectedBeads,
            baseId: selectedBaseId,
            stopperId: selectedStopperId,
            createdAt: currentDraftId ? now : now,
            updatedAt: now,
        };
        saveDraftToStorage(draft);
        setCurrentDraftId(draftId);
        toast.success('\u0110\u00e3 l\u01b0u b\u1ea3n nh\u00e1p!');
    }, [braceletMode, selectedBeads, selectedBaseId, selectedStopperId, currentDraftId]);

    const handleLoadDraft = useCallback((draft: BraceletDraft) => {
        setBraceletMode(draft.braceletMode);
        setSelectedBeads(draft.beads);
        if (draft.baseId) setSelectedBaseId(draft.baseId);
        setSelectedStopperId(draft.stopperId);
        setCurrentDraftId(draft.id);
        toast.success(`\u0110\u00e3 t\u1ea3i b\u1ea3n nh\u00e1p: ${draft.name}`);
    }, []);

    // Update calibration for the selected bead
    const updateBeadCalibration = useCallback((index: number, updates: Partial<Pick<Bead, 'anchorX' | 'anchorY' | 'rotationOffset' | 'scale'>>) => {
        setSelectedBeads(prev => {
            const next = [...prev];
            next[index] = { ...next[index], ...updates };
            return next;
        });
    }, []);

    const syncAllSameType = useCallback((index: number) => {
        setSelectedBeads(prev => {
            const target = prev[index];
            if (!target) return prev;
            return prev.map(b => {
                // Strict matching: must be same label AND same type (charm, stone, etc)
                const isSameType = b.label === target.label && b.type === target.type;
                if (isSameType) {
                    return {
                        ...b,
                        anchorX: target.anchorX,
                        anchorY: target.anchorY,
                        rotationOffset: target.rotationOffset
                    };
                }
                return b;
            });
        });
        toast.success(`Đã áp dụng hiệu chỉnh cho tất cả ${selectedBeads[index]?.label || 'phụ kiện cùng loại'}`);
    }, [selectedBeads]);

    const resetBeadCalibration = useCallback((index: number) => {
        setSelectedBeads(prev => {
            const next = [...prev];
            const b = next[index];
            if (!b) return prev;
            next[index] = {
                ...b,
                anchorX: undefined,
                anchorY: undefined,
                rotationOffset: undefined,
                scale: undefined
            };
            return next;
        });
        toast.info("Đã đặt lại hiệu chỉnh cho vật phẩm này");
    }, []);

    const saveDefaultCalibration = useCallback(async (index: number) => {
        const bead = selectedBeads[index];
        if (!bead) return;

        try {
            // Check if there is a real dbId, otherwise try to extract it from the ID structure carefully (e.g. "db-stone-12-0-12345" -> "12")
            const originalId = bead.dbId ? bead.dbId.toString() : bead.id.split('-')[2];

            if (!originalId || isNaN(Number(originalId))) {
                toast.error("Vật phẩm này không hỗ trợ lưu mặc định");
                return;
            }

            await apiClient.put(`/admin/stones/${originalId}/calibration`, {
                anchorX: bead.anchorX ?? 0.5,
                anchorY: bead.anchorY ?? (bead.type === 'charm' ? 0 : 0.5),
                rotationOffset: bead.rotationOffset ?? 0,
                scale: bead.scale ?? 1.0
            });
            toast.success(`Đã lưu thiết lập mặc định cho ${bead.label}`);

            // Cập nhật lại list availableBeads cho các phiên chọn sau
            setAvailableBeads(prev => prev.map(b => (b.dbId?.toString() === originalId || b.id.toString().includes(`-${originalId}`)) ? {
                ...b,
                anchorX: bead.anchorX,
                anchorY: bead.anchorY,
                rotationOffset: bead.rotationOffset,
                scale: bead.scale
            } : b));
        } catch (e) {
            toast.error("Lỗi khi lưu cấu hình điểm treo");
        }
    }, [selectedBeads]);

    // Load stones from API
    useEffect(() => {
        let isMounted = true; // Prevent state updates if component unmounts

        const loadData = async () => {
            try {
                // Load categories
                const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/beads/categories`);
                if (categoriesResponse.ok) {
                    const categoryData = await categoriesResponse.json();
                    if (categoryData && categoryData.success) {
                        const dbCategoryMap: Record<string, string> = {};
                        const dbRequiredSlugs: string[] = [];
                        categoryData.data.categories.forEach((cat: any) => {
                            let slug = String(cat.id);
                            dbCategoryMap[slug] = cat.name_vi || cat.name;
                        });
                        if (isMounted) {
                            setCategories(dbCategoryMap);
                            setRequiredSlugs(dbRequiredSlugs);

                            const slugs = Object.keys(dbCategoryMap);
                            if (slugs.length > 0) {
                                setActiveCategory(slugs[0] as BeadCategory);
                            }
                        }
                    } else if (isMounted) {
                        setCategories(CATEGORY_LABELS);
                    }
                } else if (isMounted) {
                    setCategories(CATEGORY_LABELS);
                }

                // Load beads from DIY Editor API
                const beadsResponse = await apiClient.get('/beads').catch(() => ({ success: false, data: { materials: [], specifications: [] } }));
                let stoneBeads: Bead[] = [];
                if (beadsResponse && beadsResponse.success && beadsResponse.data) {
                    const { materials, specifications } = beadsResponse.data;
                    if (isMounted) {
                        setBeadMaterials(materials);
                    }
                    
                    // Map old materials and specs to new Bead format
                    const sizes = [0, 4, 6, 8, 10, 11, 12, 15];
                    for (const m of materials) {
                        const specs = specifications.filter((s: any) => s.material_id === m.id);
                        for (const spec of specs) {
                            for (const size of sizes) {
                                const priceKeyMm = `${size}mm`;
                                const priceKeyNum = `${size}`;
                                const price = spec.prices?.[priceKeyMm] || spec.prices?.[priceKeyNum];
                                if (!price) continue;
                                
                                let beadType = String(m.category_id);
                                
                                stoneBeads.push({
                                    id: `db-${beadType}-${spec.id}-${size}`,
                                    uid: '', // for BeadPreviewCircle
                                    dbId: spec.id,
                                    materialId: m.id,
                                    sizeMm: size,
                                    type: beadType as BeadCategory,
                                    color: m.hex_color || '#888888',
                                    size: size === 0 ? 6 : size,
                                    displaySize: size === 0 ? 'Đệm' : `${size}mm`,
                                    label: size === 0 ? `${spec.name} Đệm` : `${spec.name} ${size}mm`,
                                    name: size === 0 ? `${spec.name} Đệm` : `${spec.name} ${size}mm`, // For BeadPreviewCircle
                                    price: price,
                                    shape: 'sphere',
                                    imageUrl: spec.image || m.image,
                                    image: spec.image || m.image // For BeadPreviewCircle
                                } as any);
                            }
                        }
                    }
                    console.log('Loaded beads from DIY API:', stoneBeads.length);
                }

                // Load bracelet bases
                const basesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/admin/bracelet-bases/public`);
                let baseBeads: Bead[] = [];
                if (basesResponse.ok) {
                    const bases = await basesResponse.json();
                    baseBeads = bases.map((base: any) => ({
                        id: `base-${base.id}`,
                        type: 'base' as BeadCategory,
                        color: '#000000',
                        size: 10,
                        label: base.name,
                        price: base.price,
                        shape: 'ring' as AccessoryShape,
                        imageUrl: base.imageUrl || undefined,
                        // Ellipse config
                        ellipseCenterX: base.ellipseCenterX,
                        ellipseCenterY: base.ellipseCenterY,
                        ellipseRadiusX: base.ellipseRadiusX,
                        ellipseRadiusY: base.ellipseRadiusY,
                        arcStartAngle: base.arcStartAngle,
                        arcEndAngle: base.arcEndAngle,
                        // Single stone config
                        isSingleStoneMode: base.isSingleStoneMode,
                        singleStoneX: base.singleStoneX,
                        singleStoneY: base.singleStoneY,
                    }));
                    console.log('Loaded bracelet bases from DB:', baseBeads.length);
                }

                // Set all beads at once to avoid race conditions (only if component is still mounted)
                if (isMounted) {
                    console.log('Setting availableBeads:', { stones: stoneBeads.length, bases: baseBeads.length, total: stoneBeads.length + baseBeads.length });
                    setAvailableBeads([...stoneBeads, ...baseBeads]);

                    const uniqueTypes = Array.from(new Set(stoneBeads.map(s => s.type as string)));
                    setCategories(prev => {
                        const newCategories = { ...prev };
                        const existingLabels = new Set(Object.values(newCategories).map(l => l.toLowerCase()));
                        let updated = false;

                        uniqueTypes.forEach(type => {
                            if (!newCategories[type]) {
                                const fallbackLabel = (CATEGORY_LABELS as any)[type] || (type.charAt(0).toUpperCase() + type.slice(1));
                                // Only add if the label doesn't already exist under a different slug
                                if (!existingLabels.has(fallbackLabel.toLowerCase())) {
                                    newCategories[type] = fallbackLabel;
                                    existingLabels.add(fallbackLabel.toLowerCase());
                                    updated = true;
                                }
                            }
                        });
                        return updated ? newCategories : prev;
                    });
                }
            } catch (error) {
                console.error('Failed to load data:', error);
                if (isMounted) {
                    setAvailableBeads([]);
                }
            }
        };

        loadData();

        // Cleanup function to prevent state updates after unmount
        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array - only run once on mount

    // Ensure activeCategory is valid when categories change
    useEffect(() => {
        const slugs = Object.keys(categories);
        if (slugs.length > 0 && activeCategory !== 'custom' && !slugs.includes(activeCategory as string)) {
            setActiveCategory(slugs[0] as BeadCategory);
        }
    }, [categories]);

    const { centerX, centerY } = BRACELET_CONFIG;
    const modeConfig = BRACELET_CONFIG[braceletMode];
    const minBeadsLimit = modeConfig.minBeads || 0;
    const maxBeadsLimit = modeConfig.maxBeads;

    // ── Bracelet Base Selection (must be before addBead) ────────────────────────────────────────
    const braceletBases = useMemo(() => {
        const bases = availableBeads.filter(b => b.type === 'base');
        console.log('braceletBases computed:', bases.length, bases);
        return bases;
    }, [availableBeads]);

    // Get available stoppers for mini mode
    const availableStoppers = useMemo(() => {
        // Use slugs marked as isRequiredFirst from DB, or fallback to 'stopper'
        if (requiredSlugs.length > 0) {
            return availableBeads.filter(b => requiredSlugs.includes(b.type));
        }
        return availableBeads.filter(b => b.type === 'stopper');
    }, [availableBeads, requiredSlugs]);

    useEffect(() => {
        if (!selectedBaseId && braceletBases.length > 0) {
            // Auto-select first appropriate base for current mode
            const appropriateBases = braceletBases.filter(b =>
                braceletMode === 'single' ? b.isSingleStoneMode : !b.isSingleStoneMode
            );
            if (appropriateBases.length > 0) {
                setSelectedBaseId(appropriateBases[0].id);
            }
        }

        // Auto-switch to single mode ONLY if selected base is single stone mode
        if (selectedBaseId) {
            const selectedBase = braceletBases.find(b => b.id === selectedBaseId);
            if (selectedBase?.isSingleStoneMode) {
                // Force single mode for single stone bases
                if (braceletMode !== 'single') {
                    setBraceletMode('single');
                    setSelectedBeads([]); // Clear beads when switching to single mode
                }
            }
        }
    }, [braceletBases, selectedBaseId]);

    // Clear beads when manually switching between modes
    useEffect(() => {
        // Clear beads when switching to a different mode to avoid confusion
        // (e.g., 22 beads from 'full' mode showing in 'mini' or 'single' mode)
        setSelectedBeads([]);
        setSelectedStopperId(null); // Also clear stopper selection
    }, [braceletMode]);

    // When stopper is selected/deselected in mini mode
    useEffect(() => {
        if (braceletMode === 'mini') {
            if (selectedStopperId) {
                const stopper = availableStoppers.find(s => s.id === selectedStopperId);
                if (stopper) {
                    // Add 2 stoppers at the beginning
                    setSelectedBeads([
                        { ...stopper, id: `${stopper.id}-left-${Date.now()}` },
                        { ...stopper, id: `${stopper.id}-right-${Date.now()}` }
                    ]);
                }
            } else {
                // When stopper is deselected, remove all stoppers from beads (both legacy 'stopper' and dynamic slugs)
                setSelectedBeads(prev => prev.filter(b => b.type !== 'stopper' && !requiredSlugs.includes(b.type)));
            }
        }
    }, [selectedStopperId, braceletMode, availableStoppers, requiredSlugs]);

    // When mode changes, switch to appropriate base
    useEffect(() => {
        if (braceletMode === 'single' || braceletMode === 'mini') {
            const currentBase = braceletBases.find(b => b.id === selectedBaseId);
            const needsSingleBase = braceletMode === 'single';
            const currentIsSingle = currentBase?.isSingleStoneMode || false;

            // If mode doesn't match current base, switch to appropriate base
            if (needsSingleBase !== currentIsSingle) {
                const appropriateBases = braceletBases.filter(b =>
                    needsSingleBase ? b.isSingleStoneMode : !b.isSingleStoneMode
                );
                if (appropriateBases.length > 0) {
                    setSelectedBaseId(appropriateBases[0].id);
                    // No need to clear beads here as it's already cleared above
                }
            }
        }
    }, [braceletMode]);

    const baseBead = useMemo(() => {
        return braceletBases.find(b => b.id === selectedBaseId) || braceletBases[0];
    }, [braceletBases, selectedBaseId]);

    // ── Mode logic (can be used for other purposes later) ─────────────────────────
    useEffect(() => {
        const pattern = INITIAL_PATTERNS[braceletMode] || [];
        const initial = pattern
            .map((id, i) => {
                const base = availableBeads.find(x => x.id === id) || AVAILABLE_BEADS.find(x => x.id === id);
                if (!base) return null;
                return { ...base, id: `${id}-${i}-${Date.now()}` };
            })
            .filter((b): b is Bead => b !== null);

        if (initial.length > 0) {
            setSelectedBeads(initial);
        }
    }, [braceletMode, availableBeads]);

    const getSpacingMultiplier = (b: Bead) => {
        if (b.type === 'charm') return 0.45;
        if (b.type === 'stone') return 0.65;
        if (b.type === 'spacer' || b.shape === 'tube' || b.shape === 'ring') return 0.55;
        if (b.type === 'stopper') return 0.7;
        return 0.55;
    };

    // ── Bead Actions (memoized to prevent child re-renders) ───────────
    const addBead = useCallback((bead: Bead) => {
        setSelectedBeads(prev => {
            // Uniformly check max beads limit across all modes
            if (prev.length >= maxBeadsLimit) {
                const limitMsg = braceletMode === 'mini' ? '5 charm' : `${maxBeadsLimit} vật phẩm`;
                toast.error(`Chỉ được chọn tối đa ${limitMsg} cho chế độ này!`, { id: 'max-beads-limit' });
                return prev;
            }

            // Dynamic check for Required item first (usually Chốt chặn)
            const isAnyRequiredItemSelected = prev.some(b =>
                requiredSlugs.length > 0 ? requiredSlugs.includes(b.type) : b.type === 'stopper'
            );

            const isAddingRequiredItem = requiredSlugs.length > 0 ? requiredSlugs.includes(bead.type) : bead.type === 'stopper';

            if (braceletMode === 'mini' && !isAnyRequiredItemSelected && !isAddingRequiredItem) {
                const requiredNames = requiredSlugs.length > 0
                    ? requiredSlugs.map(s => categories[s] || s).join(' hoặc ')
                    : 'Chốt chặn';
                toast.warning(`Vui lòng chọn ${requiredNames} ở mục "Chọn Chốt" trước nhé!`, { id: 'need-stopper-first' });
                return prev;
            }

            // In mini mode with stoppers, insert beads between the 2 stoppers
            if (braceletMode === 'mini' && selectedStopperId) {
                // Check if we have exactly 2 stoppers (left and right)
                // Use requiredSlugs to identify stoppers dynamically
                const isStopperType = (type: string) => requiredSlugs.includes(type) || type === 'stopper';
                const stopperCount = prev.filter(b => isStopperType(b.type)).length;

                if (stopperCount === 2) {
                    // Find the index of the last stopper
                    const lastStopperIndex = [...prev].reverse().findIndex(b => isStopperType(b.type));
                    const insertionIndex = lastStopperIndex !== -1 ? prev.length - 1 - lastStopperIndex : prev.length - 1;

                    // Insert new bead before the last stopper
                    const newBead = { ...bead, uid: `${bead.id}-${Date.now()}-${Math.random()}` };
                    const result = [...prev];
                    result.splice(insertionIndex, 0, newBead);

                    // Check if beads fit within the arc
                    const ellipseRadiusX = baseBead?.ellipseRadiusX;
                    const ellipseRadiusY = baseBead?.ellipseRadiusY;
                    const arcStartAngle = baseBead?.arcStartAngle;
                    const arcEndAngle = baseBead?.arcEndAngle;

                    if (ellipseRadiusX !== undefined && ellipseRadiusY !== undefined &&
                        arcStartAngle !== undefined && arcEndAngle !== undefined) {

                        const baseImageSize = modeConfig.canvasRadius * 2;
                        const rx = ellipseRadiusX * baseImageSize;
                        const ry = ellipseRadiusY * baseImageSize;
                        const avgRadius = (rx + ry) / 2;
                        const arcAngle = Math.abs(arcEndAngle - arcStartAngle);
                        const arcLength = avgRadius * arcAngle;

                        const totalBeadSize = result.reduce((sum, b) => sum + b.size * modeConfig.beadScale * (b.scale || 1) * getSpacingMultiplier(b), 0);

                        if (totalBeadSize > arcLength) {
                            toast.error('Không đủ chỗ trên vòng! Vui lòng chọn đá nhỏ hơn hoặc xóa bớt đá.', { id: 'not-enough-space' });
                            return prev;
                        }
                    }

                    return result;
                }
            }

            // For mini mode, check if beads fit within the arc
            if (braceletMode === 'mini') {
                // Calculate total arc length and bead sizes
                const ellipseRadiusX = baseBead?.ellipseRadiusX;
                const ellipseRadiusY = baseBead?.ellipseRadiusY;
                const arcStartAngle = baseBead?.arcStartAngle;
                const arcEndAngle = baseBead?.arcEndAngle;

                if (ellipseRadiusX !== undefined && ellipseRadiusY !== undefined &&
                    arcStartAngle !== undefined && arcEndAngle !== undefined) {

                    // Calculate arc length (approximate for ellipse)
                    const baseImageSize = modeConfig.canvasRadius * 2;
                    const rx = ellipseRadiusX * baseImageSize;
                    const ry = ellipseRadiusY * baseImageSize;
                    const avgRadius = (rx + ry) / 2;
                    const arcAngle = Math.abs(arcEndAngle - arcStartAngle);
                    const arcLength = avgRadius * arcAngle;

                    // Calculate total bead size (including new bead) with overlap
                    const newBeadSize = bead.size * modeConfig.beadScale * (bead.scale || 1);
                    const totalBeadSize = prev.reduce((sum, b) => sum + b.size * modeConfig.beadScale * (b.scale || 1) * getSpacingMultiplier(b), 0) + newBeadSize * getSpacingMultiplier(bead);

                    // No spacing - beads overlap at 90% to touch closely
                    const totalRequired = totalBeadSize;

                    if (totalRequired > arcLength) {
                        toast.error('Không đủ chỗ trên vòng! Vui lòng chọn đá nhỏ hơn hoặc xóa bớt đá.', { id: 'not-enough-space-mini' });
                        return prev;
                    }
                }
            }

            return [...prev, { ...bead, id: `${bead.id}-${Date.now()}-${Math.random()}`, uid: `${bead.id}-${Date.now()}-${Math.random()}` }];
        });
    }, [maxBeadsLimit, braceletMode, modeConfig, baseBead, selectedStopperId]);

    // const swapBeads = useCallback((indexA: number, indexB: number) => {
    //     if (indexA === indexB) return;
    //     setSelectedBeads(prev => {
    //         const N = prev.length;
    //         if (N <= 1) return prev;

    //         const distRight = (indexB - indexA + N) % N;
    //         const distLeft = (indexA - indexB + N) % N;

    //         const newBeads = [...prev];
    //         const movedItem = prev[indexA];

    //         if (distRight <= distLeft) {
    //             // Theo chiều kim đồng hồ (hoặc bằng nhau) -> Dịch các hạt bên phải lùi lại
    //             let curr = indexA;
    //             while (curr !== indexB) {
    //                 const next = (curr + 1) % N;
    //                 newBeads[curr] = prev[next];
    //                 curr = next;
    //             }
    //             newBeads[indexB] = movedItem;
    //         } else {
    //             // Ngược chiều kim đồng hồ -> Dịch các hạt bên trái tiến lên
    //             let curr = indexA;
    //             while (curr !== indexB) {
    //                 const prevIdx = (curr - 1 + N) % N;
    //                 newBeads[curr] = prev[prevIdx];
    //                 curr = prevIdx;
    //             }
    //             newBeads[indexB] = movedItem;
    //         }

    //         return newBeads;
    //     });
    // }, []);

    // Thay thế toàn bộ hàm swapBeads
    const swapBeads = useCallback((fromIndex: number, toIndex: number) => {
        setSelectedBeads(prev => {
            const N = prev.length;
            if (N <= 1 || fromIndex < 0 || fromIndex >= N) return prev;

            // Chuẩn hóa toIndex
            let insertIndex = Math.max(0, Math.min(N, toIndex));

            // Không làm gì nếu không thay đổi vị trí
            if (fromIndex === insertIndex || fromIndex === insertIndex - 1) {
                return prev;
            }

            const newBeads = [...prev];
            const [movedBead] = newBeads.splice(fromIndex, 1);

            // Sau khi splice, insertIndex có thể cần điều chỉnh
            if (fromIndex < insertIndex) {
                insertIndex -= 1;
            }

            newBeads.splice(insertIndex, 0, movedBead);

            return newBeads;
        });
    }, []);

    const clearLastBead = useCallback(() => {
        setSelectedBeads(prev => {
            if (prev.length === 0) return prev;

            // In mini mode, the last item might be a stopper because stones are inserted BETWEEN stoppers.
            // When user clicks 'Delete last bead', they usually mean the last STONE they added.
            if (braceletMode === 'mini') {
                const isStopperType = (type: string) => requiredSlugs.includes(type) || type === 'stopper';
                // Find the last item that is NOT a stopper/required item
                for (let i = prev.length - 1; i >= 0; i--) {
                    if (!isStopperType(prev[i].type)) {
                        const next = [...prev];
                        next.splice(i, 1);
                        return next;
                    }
                }
            }
            // Fallback for full/single mode or if only stoppers are left (which shouldn't happen via this button, but just in case)
            return prev.slice(0, -1);
        });
    }, [braceletMode]);

    const resetDesigner = useCallback(() => setSelectedBeads([]), []);

    const removeBead = useCallback((index: number) => {
        setSelectedBeads(prev => prev.filter((_, i) => i !== index));
    }, []);

    // ── Image Upload ──────────────────────────────────────────────────
    const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            const newBead: Bead = {
                id: `custom-asset-${Date.now()}`,
                type: 'custom',
                color: '#ffffff',
                size: 10,
                label: 'Custom Gem',
                price: 50,
                shape: 'sphere',
                imageUrl,
            };
            setCustomAssets(prev => [newBead, ...prev]);
            addBead(newBead);
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    }, [addBead]);

    // ── Add to Cart Handler ───────────────────────────────────────────
    const handleAddToCart = useCallback(async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
            router.push('/login');
            return;
        }

        if (selectedBeads.length === 0) {
            toast.error('Chưa có vật phẩm nào trong vòng tay');
            return;
        }

        // Check minimum beads requirement for full mode
        const minBeads = modeConfig.minBeads || 0;
        if (selectedBeads.length < minBeads) {
            toast.error(`Chế độ ${braceletMode === 'full' ? 'Vòng Hạt' : braceletMode} yêu cầu tối thiểu ${minBeads} vật phẩm!`);
            return;
        }

        try {
            // Build description from beads
            const beadSummary = selectedBeads.reduce((acc, bead) => {
                acc[bead.label] = (acc[bead.label] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            let description = Object.entries(beadSummary)
                .map(([name, qty]) => `${name} x${qty}`)
                .join(', ');

            // Calculate total in VND
            let totalPrice = selectedBeads.reduce((sum, b) => sum + b.price, 0);

            // Add base price if in mini mode
            const baseBead = availableBeads.find(b => b.id === selectedBaseId) || availableBeads.find(b => b.type === 'base');
            if (braceletMode === 'mini' && baseBead) {
                totalPrice += baseBead.price;
                const baseDescription = `1x Phôi vòng nền (${baseBead.label})`;
                description = `${baseDescription}, ${description}`;
            }

            // Generate preview image
            let previewImageUrl = "";
            if (canvasRef.current) {
                const svgStr = canvasRef.current.getSVG();
                if (svgStr) {
                    previewImageUrl = await svgToDataURL(svgStr);
                }
            }

            // Step 1: Create custom product
            const customProduct = await apiClient.post('/customproducts', {
                name: `Vòng tay thiết kế ${new Date().toLocaleDateString('vi-VN')}`,
                description: `Vòng tay customize ${selectedBeads.length} vật phẩm: ${description}`,
                notes: description,
                totalPrice: totalPrice,
                previewImageUrl: previewImageUrl, // Sent as base64, backend will save as file
                stones: [], // Using TotalPrice override since beads don't map 1:1 to DB stones
            }) as { id: number };

            // Step 2: Add custom product to cart
            await addCustomItemToCart(customProduct.id);

            toast.success('Đã thêm vòng tay vào giỏ hàng!', {
                description: `${selectedBeads.length} vật phẩm - ${totalPrice.toLocaleString('vi-VN')}₫`,
                action: {
                    label: 'Xem giỏ hàng',
                    onClick: () => router.push('/cart'),
                },
            });

            router.push('/cart');
        } catch (error: any) {
            console.error('Add to cart failed:', error);
            toast.error(error?.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
        }
    }, [selectedBeads, isAuthenticated, router, addCustomItemToCart, modeConfig, braceletMode]);

    // ── Computed Positions ─────────────────────────────────────────────
    const beadsWithPositions = useMemo((): BeadWithPosition[] => {
        const total = selectedBeads.length;
        if (total === 0) return [];

        let chosenScale: number = modeConfig.beadScale;
        let dynamicRadius: number = modeConfig.canvasRadius;

        // Old app multipliers — roundPosMult tuned so visual/position ratio ≈ 1.087 (same as old app: 4.35/4.0)
        const minRadius = modeConfig.canvasRadius * 0.7; // ~154
        const maxRadius = modeConfig.canvasRadius; // 220
        const minScale = 0.65;
        const maxScale = 1.35; // Tuned for 800x700 viewBox to match old app relative scale
        const roundVisualMult = 16.0;  // Visual draw size multiplier (slightly larger → natural touching)
        const specialVisualMult = 22.0;
        // roundSizeMult = roundPosMult so chosenScale is calibrated correctly
        // (totalBeadWidthAtScale1 uses same mult as position → no residual gaps)
        const roundPosMult = 14.7;     // 16.0 / 1.087 ≈ 14.7, matches old app overlap ratio
        const roundSizeMult = roundPosMult;
        const specialPosMult = 13.2;   // proportionally adjusted
        const specialSizeMult = specialPosMult; // same principle
        const spacerMult = 8.8;

        if (braceletMode === 'full') {
            let totalBeadWidthAtScale1 = 0;
            for (const b of selectedBeads) {
                const isSpecial = b.type === 'charm';
                const isSpacer = b.type === 'spacer' || b.shape === 'tube' || b.shape === 'ring';
                const sizeMultiplier = isSpacer ? spacerMult : (isSpecial ? specialSizeMult : roundSizeMult);
                // Include bead.scale so custom-scaled beads contribute correctly to circumference
                totalBeadWidthAtScale1 += (b.size || 10) * sizeMultiplier * (b.scale || 1);
            }

            const minCircumference = 2 * Math.PI * minRadius;
            const scaleForMinRadius = totalBeadWidthAtScale1 > 0 ? minCircumference / totalBeadWidthAtScale1 : maxScale;

            if (total <= 1) {
                chosenScale = maxScale;
                dynamicRadius = minRadius;
            } else if (scaleForMinRadius >= minScale) {
                chosenScale = Math.min(maxScale, scaleForMinRadius);
                dynamicRadius = minRadius;
            } else {
                chosenScale = minScale;
                const neededCircumference = totalBeadWidthAtScale1 * minScale;
                dynamicRadius = Math.min(maxRadius, neededCircumference / (2 * Math.PI));
            }
        }

        // Helper: get the effective draw size for a bead (what's actually rendered)
        const getDrawSize = (b: Bead) => {
            if (braceletMode === 'full') {
                const isSpecial = b.type === 'charm';
                const isSpacer = b.type === 'spacer' || b.shape === 'tube' || b.shape === 'ring';
                const visualMultiplier = isSpacer ? spacerMult : (isSpecial ? specialVisualMult : roundVisualMult);
                return (b.size || 10) * visualMultiplier * chosenScale * (b.scale || 1);
            }
            return b.size * chosenScale * (b.scale || 1);
        };

        // Single stone mode: fixed position
        if (braceletMode === 'single' && baseBead?.singleStoneX !== undefined && baseBead?.singleStoneY !== undefined) {
            const singleStoneRadius = modeConfig.canvasRadius;
            const baseImageSize = singleStoneRadius * 2;
            const baseImageLeft = centerX - singleStoneRadius;
            const baseImageTop = centerY - singleStoneRadius;

            const x = baseImageLeft + (baseBead.singleStoneX * baseImageSize);
            const y = baseImageTop + (baseBead.singleStoneY * baseImageSize);
            const angle = 0; // No rotation for single stone
            const drawSize = getDrawSize(selectedBeads[0]);

            return [{
                ...selectedBeads[0],
                x,
                y,
                scale: 1,
                drawSize,
                angle,
                originalIndex: 0
            }];
        }

        // Get ellipse config from selected base (mini mode only)
        const ellipseCenterX = baseBead?.ellipseCenterX;
        const ellipseCenterY = baseBead?.ellipseCenterY;
        const ellipseRadiusX = baseBead?.ellipseRadiusX;
        const ellipseRadiusY = baseBead?.ellipseRadiusY;
        const arcStartAngle = baseBead?.arcStartAngle;
        const arcEndAngle = baseBead?.arcEndAngle;

        let useEllipse = false;

        // Mini mode: use ellipse if configured
        if (braceletMode === 'mini' && ellipseCenterX !== undefined && ellipseCenterY !== undefined) {
            useEllipse = true;
            dynamicRadius = modeConfig.canvasRadius; // Still need for base image size
        } else if (braceletMode === 'mini') {
            dynamicRadius = modeConfig.canvasRadius;
        }

        return selectedBeads.map((bead, index) => {
            let x: number, y: number, angle: number;
            const drawSize = getDrawSize(bead);

            if (useEllipse && ellipseCenterX !== undefined && ellipseCenterY !== undefined &&
                ellipseRadiusX !== undefined && ellipseRadiusY !== undefined &&
                arcStartAngle !== undefined && arcEndAngle !== undefined) {

                // Calculate angle based on cumulative bead sizes (beads touching each other)
                const baseImageSize = dynamicRadius * 2;
                const rx = ellipseRadiusX * baseImageSize;
                const ry = ellipseRadiusY * baseImageSize;
                const avgRadius = (rx + ry) / 2;

                // Center logic: Calculate total width using drawSize (synced with visual scale)
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

                // Calculate cumulative arc length up to this bead using drawSize
                let cumulativeLength = 0;
                for (let i = 0; i < index; i++) {
                    const ds = getDrawSize(selectedBeads[i]);
                    cumulativeLength += ds * getSpacingMultiplier(selectedBeads[i]);
                }

                // Add half of current bead drawSize to center it
                cumulativeLength += drawSize / 2;

                const arcLengthToAngle = cumulativeLength / avgRadius;
                angle = centeredStartAngle + arcLengthToAngle;

                const baseImageLeft = centerX - dynamicRadius;
                const baseImageTop = centerY - dynamicRadius;

                // Convert ellipse config from relative (0-1) to absolute pixels within base image
                const cx = ellipseCenterX * baseImageSize + baseImageLeft;
                const cy = ellipseCenterY * baseImageSize + baseImageTop;

                x = cx + Math.cos(angle) * rx;
                y = cy + Math.sin(angle) * ry;
            } else if (braceletMode === 'full') {
                // Full mode: cumulative positioning using position multipliers (like old app)
                // Include bead.scale so beads with custom scale occupy proportional arc space
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
                // Fallback to equal-angle circle
                angle = calculateBeadAngle(index, total, braceletMode, arcStartAngle, arcEndAngle);
                x = centerX + Math.cos(angle) * dynamicRadius;
                y = centerY + Math.sin(angle) * dynamicRadius;
            }

            return { ...bead, x, y, scale: 1, drawSize, angle, originalIndex: index };
        });
    }, [selectedBeads, braceletMode, modeConfig, centerX, centerY, baseBead]);

    // Calculate dynamic radius for canvas guide (must match beadsWithPositions logic)
    const canvasRadius = useMemo(() => {
        if (selectedBeads.length === 0) return modeConfig.canvasRadius;

        // Mini and Single mode: fixed radius
        if (braceletMode === 'mini' || braceletMode === 'single') {
            return modeConfig.canvasRadius;
        }

        // Full mode: dynamic radius using old app logic
        const minRadius = modeConfig.canvasRadius * 0.7; // ~154
        const maxRadius = modeConfig.canvasRadius; // 220
        const minScale = 0.65;
        // Must mirror beadsWithPositions: roundSizeMult = roundPosMult so radius calc is consistent
        const roundPosMult = 14.7;
        const roundSizeMult = roundPosMult;
        const specialSizeMult = 13.2;
        const spacerMult = 8.8;

        let totalBeadWidthAtScale1 = 0;
        for (const b of selectedBeads) {
            const isSpecial = b.type === 'charm';
            const isSpacer = b.type === 'spacer' || b.shape === 'tube' || b.shape === 'ring';
            const sizeMultiplier = isSpacer ? spacerMult : (isSpecial ? specialSizeMult : roundSizeMult);
            // Include bead.scale to stay in sync with beadsWithPositions calculation
            totalBeadWidthAtScale1 += (b.size || 10) * sizeMultiplier * (b.scale || 1);
        }

        const minCircumference = 2 * Math.PI * minRadius;
        const scaleForMinRadius = totalBeadWidthAtScale1 > 0 ? minCircumference / totalBeadWidthAtScale1 : 1.35;

        if (selectedBeads.length <= 1) {
            return minRadius;
        } else if (scaleForMinRadius >= minScale) {
            return minRadius;
        } else {
            const neededCircumference = totalBeadWidthAtScale1 * minScale;
            return Math.min(maxRadius, neededCircumference / (2 * Math.PI));
        }
    }, [selectedBeads, modeConfig, braceletMode]);

    const totalValue = useMemo(() => {
        const beadsValue = BeadCalculator.calculateTotalPrice(selectedBeads);
        if (braceletMode === 'mini') {
            const baseBead = availableBeads.find(b => b.id === selectedBaseId) || availableBeads.find(b => b.type === 'base');
            return beadsValue + (baseBead?.price || 0);
        }
        return beadsValue;
    }, [selectedBeads, braceletMode, availableBeads, selectedBaseId]);

    const wristSizeInfo = useMemo(() => BeadCalculator.calculateWristSize(selectedBeads), [selectedBeads]);

    const hasBeads = selectedBeads.length > 0;

    // ── Render ─────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] overflow-hidden">

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-gray-50/50">
                {/* Persistent Sidebar Wrapper - 30% width on Desktop */}
                <div className="w-full lg:w-[30%] lg:flex-none flex-1 lg:h-full bg-white border-t lg:border-t-0 lg:border-r border-gray-200 flex-shrink-0 order-2 lg:order-1 flex flex-col min-h-0">
                    <DesignerSidebar
                        selectedBeads={selectedBeads}
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        braceletMode={braceletMode}
                        setBraceletMode={setBraceletMode}
                        addBead={addBead}
                        customAssets={customAssets}
                        totalValue={totalValue}
                        minBeadsLimit={minBeadsLimit}
                        maxBeadsLimit={maxBeadsLimit}
                        fileInputRef={fileInputRef}
                        handleImageUpload={handleImageUpload}
                        onAddToCart={handleAddToCart}
                        availableBeads={availableBeads}
                        braceletBases={braceletBases}
                        selectedBaseId={selectedBaseId || undefined}
                        setSelectedBaseId={setSelectedBaseId}
                        availableStoppers={availableStoppers}
                        selectedStopperId={selectedStopperId}
                        setSelectedStopperId={setSelectedStopperId}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        selectedIdx={selectedIdx}
                        setSelectedIdx={setSelectedIdx}
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

                {/* Canvas Area - 70% width on Desktop, fixed height on mobile (50/50 split) */}
                <div className="h-1/2 lg:h-full lg:w-[70%] lg:flex-none lg:flex-1 relative flex flex-col overflow-hidden order-1 lg:order-2 bg-white lg:bg-transparent shadow-sm lg:shadow-none z-10">
                    {/* Controls at top */}
                    <div className="flex-shrink-0">
                        <DesignerControls
                            clearLastBead={clearLastBead}
                            resetDesigner={resetDesigner}
                            hasBeads={hasBeads}
                            totalValue={totalValue}
                            wristSizeInfo={wristSizeInfo}
                            count={selectedBeads.length}
                            maxBeadsLimit={maxBeadsLimit}
                            onAddToCart={handleAddToCart}
                            onSaveDraft={handleSaveDraft}
                            onLoadDraft={handleLoadDraft}
                        />
                    </div>

                    {/* Canvas in center - scrollable */}
                    <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                        <div className="w-full h-full min-h-[400px] flex items-center justify-center relative">
                            {braceletMode === 'full' ? (
                                <BeadPreviewCircle 
                                    beads={selectedBeads} 
                                    setBeads={setSelectedBeads} 
                                    rotation={rotation} 
                                    setRotation={setRotation}
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
                                    onSelect={setSelectedIdx}
                                    baseImageUrl={baseBead?.imageUrl}
                                    zoomScale={zoomScale}
                                    rotation={rotation}
                                    setRotation={setRotation}
                                />
                            )}
                        </div>
                    </div>

                    {/* Zoom Controls */}
                    <div className="absolute bottom-20 right-4 lg:bottom-24 lg:right-8 flex flex-col gap-2 z-40 bg-white/90 backdrop-blur-md rounded-full shadow-md border border-gray-100 p-1">
                        <button onClick={() => setZoomScale(s => Math.min(s + 0.1, 2.5))} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                        <div className="w-full h-px bg-gray-200" />
                        <button onClick={() => setZoomScale(s => Math.max(s - 0.1, 0.5))} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                            <Minus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Rotation Control */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-md border border-gray-100">
                        <RotateCcw className="w-4 h-4 text-gray-500" />
                        <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            value={rotation}
                            onChange={(e) => setRotation(Number(e.target.value))}
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
                                onClose={() => setSelectedIdx(null)}
                                saveDefault={saveDefaultCalibration}
                            />
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

// ─── Calibration Panel Component ─────────────────────────────────────

function CalibrationPanel({ index, bead, updateCalibration, syncAll, reset, removeBead, onClose, saveDefault }: {
    index: number;
    bead: Bead;
    updateCalibration: (idx: number, updates: any) => void;
    syncAll: (idx: number) => void;
    reset: (idx: number) => void;
    removeBead: (idx: number) => void;
    onClose: () => void;
    saveDefault: (idx: number) => void;
}) {
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
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
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
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
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
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>Kích thước đá/charm</span>
                        <span className="text-purple-600">{Math.round((bead.scale || 1.0) * 100)}%</span>
                    </div>
                    <input
                        type="range" min="0.5" max="2.5" step="0.05"
                        value={bead.scale ?? 1.0}
                        onChange={(e) => updateCalibration(index, { scale: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 px-1">
                        <span>Nhỏ hơn</span>
                        <span>Mặc định</span>
                        <span>Lớn hơn</span>
                    </div>
                </div>

                <div className="flex gap-2 pt-2 flex-wrap">
                    <button
                        onClick={() => syncAll(index)}
                        className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[11px] font-bold uppercase rounded-lg hover:shadow-lg transition-all"
                    >
                        Áp dụng tất cả
                    </button>
                    <button
                        onClick={() => saveDefault(index)}
                        className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-bold uppercase rounded-lg hover:shadow-lg transition-all"
                        title="Lưu vào CSDL làm mặc định"
                    >
                        Lưu mặc định
                    </button>
                    <button
                        onClick={() => reset(index)}
                        className="flex-1 py-2 bg-gray-100 text-gray-600 text-[11px] font-bold uppercase rounded-lg hover:bg-gray-200 transition-all"
                        title="Đặt lại giá trị mặc định"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                        title="Xóa vật phẩm này"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-xs text-gray-500 italic text-center leading-relaxed">
                    Kéo thanh trượt để điều chỉnh điểm treo dây
                </p>
            </div>
        </motion.div>
    );
}
