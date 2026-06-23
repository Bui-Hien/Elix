import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { 
    setCategories, setRequiredSlugs, setActiveCategory, 
    setBeadMaterials, setAvailableBeads 
} from '@/lib/redux/slices/designerSlice';
import apiClient from '@/lib/api-client';
import { Bead, BeadCategory, AccessoryShape, CATEGORY_LABELS } from '@/components/bracelet/types';

export function useBraceletDesignerData() {
    const dispatch = useAppDispatch();
    const { availableBeads, categories } = useAppSelector(state => state.designer);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                let currentCategories: Record<string, string> = {};
                // Load categories
                const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/beads/categories`);
                if (categoriesResponse.ok) {
                    const categoryData = await categoriesResponse.json();
                    if (categoryData && categoryData.success) {
                        const dbRequiredSlugs: string[] = [];
                        categoryData.data.categories.forEach((cat: any) => {
                            let slug = String(cat.id);
                            currentCategories[slug] = cat.name_vi || cat.name;
                        });
                        if (isMounted) {
                            dispatch(setCategories(currentCategories));
                            dispatch(setRequiredSlugs(dbRequiredSlugs));

                            const slugs = Object.keys(currentCategories);
                            if (slugs.length > 0) {
                                dispatch(setActiveCategory(slugs[0] as string));
                            }
                        }
                    } else if (isMounted) {
                        currentCategories = { ...CATEGORY_LABELS };
                        dispatch(setCategories(currentCategories));
                    }
                } else if (isMounted) {
                    currentCategories = { ...CATEGORY_LABELS };
                    dispatch(setCategories(currentCategories));
                }

                // Load beads from DIY Editor API
                const beadsResponse = (await apiClient.get('/beads').catch(() => ({ success: false, data: { materials: [], specifications: [] } }))) as any;
                let stoneBeads: Bead[] = [];
                if (beadsResponse && beadsResponse.success && beadsResponse.data) {
                    const { materials, specifications } = beadsResponse.data;
                    if (isMounted) {
                        dispatch(setBeadMaterials(materials));
                    }
                    
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
                                    uid: '',
                                    dbId: spec.id,
                                    materialId: m.id,
                                    sizeMm: size,
                                    type: beadType as BeadCategory,
                                    color: m.hex_color || '#888888',
                                    size: size === 0 ? 6 : size,
                                    displaySize: size === 0 ? 'Đệm' : `${size}mm`,
                                    label: size === 0 ? `${spec.name} Đệm` : `${spec.name} ${size}mm`,
                                    name: size === 0 ? `${spec.name} Đệm` : `${spec.name} ${size}mm`,
                                    price: price,
                                    shape: 'sphere',
                                    imageUrl: spec.image || m.image,
                                    image: spec.image || m.image
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
                        ellipseCenterX: base.ellipseCenterX,
                        ellipseCenterY: base.ellipseCenterY,
                        ellipseRadiusX: base.ellipseRadiusX,
                        ellipseRadiusY: base.ellipseRadiusY,
                        arcStartAngle: base.arcStartAngle,
                        arcEndAngle: base.arcEndAngle,
                        isSingleStoneMode: base.isSingleStoneMode,
                        singleStoneX: base.singleStoneX,
                        singleStoneY: base.singleStoneY,
                    }));
                    console.log('Loaded bracelet bases from DB:', baseBeads.length);
                }

                if (isMounted) {
                    console.log('Setting availableBeads:', { stones: stoneBeads.length, bases: baseBeads.length, total: stoneBeads.length + baseBeads.length });
                    dispatch(setAvailableBeads([...stoneBeads, ...baseBeads]));

                    const uniqueTypes = Array.from(new Set(stoneBeads.map(s => s.type as string)));
                    const newCategories = { ...currentCategories };
                    let updated = false;

                    uniqueTypes.forEach(type => {
                        if (!newCategories[type]) {
                            const fallbackLabel = (CATEGORY_LABELS as any)[type] || (type.charAt(0).toUpperCase() + type.slice(1));
                            newCategories[type] = fallbackLabel;
                            updated = true;
                        }
                    });
                    
                    if (updated) {
                        dispatch(setCategories(newCategories));
                    }
                }
            } catch (error) {
                console.error('Failed to load data:', error);
                if (isMounted) {
                    dispatch(setAvailableBeads([]));
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [dispatch]);
}
