import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { toast } from 'sonner';
import { 
    setSelectedBeads, addBead as addBeadToStore, removeBead as removeBeadFromStore, 
    swapBeads as swapBeadsInStore, clearLastBead as clearLastBeadInStore, resetDesigner as resetDesignerInStore,
    setCurrentDraftId, setBraceletMode, setSelectedBaseId, setSelectedStopperId
} from '@/lib/redux/slices/designerSlice';
import { Bead, BRACELET_CONFIG } from '@/components/bracelet/types';
import { saveDraftToStorage, BraceletDraft } from '@/components/bracelet/DesignerControls';
import apiClient from '@/lib/api-client';

export function useDesignerActions() {
    const dispatch = useAppDispatch();
    const state = useAppSelector(s => s.designer);
    const { 
        selectedBeads, braceletMode, availableBeads, selectedBaseId, 
        selectedStopperId, requiredSlugs, categories, currentDraftId 
    } = state;

    const modeConfig = BRACELET_CONFIG[braceletMode];
    const maxBeadsLimit = modeConfig.maxBeads;

    const braceletBases = useMemo(() => {
        return availableBeads.filter(b => b.type === 'base');
    }, [availableBeads]);

    const baseBead = useMemo(() => {
        return braceletBases.find(b => b.id === selectedBaseId) || braceletBases[0];
    }, [braceletBases, selectedBaseId]);

    const getSpacingMultiplier = (b: Bead) => {
        if (b.type === 'charm') return 0.45;
        if (b.type === 'stone') return 0.65;
        if (b.type === 'spacer' || b.shape === 'tube' || b.shape === 'ring') return 0.55;
        if (b.type === 'stopper') return 0.7;
        return 0.55;
    };

    const addBead = useCallback((bead: Bead) => {
        if (selectedBeads.length >= maxBeadsLimit) {
            const limitMsg = braceletMode === 'mini' ? '5 charm' : `${maxBeadsLimit} vật phẩm`;
            toast.error(`Chỉ được chọn tối đa ${limitMsg} cho chế độ này!`, { id: 'max-beads-limit' });
            return;
        }

        const isAnyRequiredItemSelected = selectedBeads.some(b =>
            requiredSlugs.length > 0 ? requiredSlugs.includes(b.type) : b.type === 'stopper'
        );

        const isAddingRequiredItem = requiredSlugs.length > 0 ? requiredSlugs.includes(bead.type) : bead.type === 'stopper';

        if (braceletMode === 'mini' && !isAnyRequiredItemSelected && !isAddingRequiredItem) {
            const requiredNames = requiredSlugs.length > 0
                ? requiredSlugs.map(s => categories[s] || s).join(' hoặc ')
                : 'Chốt chặn';
            toast.warning(`Vui lòng chọn ${requiredNames} ở mục "Chọn Chốt" trước nhé!`, { id: 'need-stopper-first' });
            return;
        }

        let newSelectedBeads = [...selectedBeads];

        if (braceletMode === 'mini' && selectedStopperId) {
            const isStopperType = (type: string) => requiredSlugs.includes(type) || type === 'stopper';
            const stopperCount = newSelectedBeads.filter(b => isStopperType(b.type)).length;

            if (stopperCount === 2) {
                const lastStopperIndex = [...newSelectedBeads].reverse().findIndex(b => isStopperType(b.type));
                const insertionIndex = lastStopperIndex !== -1 ? newSelectedBeads.length - 1 - lastStopperIndex : newSelectedBeads.length - 1;

                const newBead = { ...bead, id: `${bead.id}-${Date.now()}-${Math.random()}`, uid: `${bead.id}-${Date.now()}-${Math.random()}` };
                newSelectedBeads.splice(insertionIndex, 0, newBead);

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

                    const totalBeadSize = newSelectedBeads.reduce((sum, b) => sum + b.size * modeConfig.beadScale * (b.scale || 1) * getSpacingMultiplier(b), 0);

                    if (totalBeadSize > arcLength) {
                        toast.error('Không đủ chỗ trên vòng! Vui lòng chọn đá nhỏ hơn hoặc xóa bớt đá.', { id: 'not-enough-space' });
                        return;
                    }
                }

                dispatch(setSelectedBeads(newSelectedBeads));
                return;
            }
        }

        if (braceletMode === 'mini') {
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

                const newBeadSize = bead.size * modeConfig.beadScale * (bead.scale || 1);
                const totalBeadSize = newSelectedBeads.reduce((sum, b) => sum + b.size * modeConfig.beadScale * (b.scale || 1) * getSpacingMultiplier(b), 0) + newBeadSize * getSpacingMultiplier(bead);

                if (totalBeadSize > arcLength) {
                    toast.error('Không đủ chỗ trên vòng! Vui lòng chọn đá nhỏ hơn hoặc xóa bớt đá.', { id: 'not-enough-space-mini' });
                    return;
                }
            }
        }

        dispatch(addBeadToStore(bead));
    }, [selectedBeads, braceletMode, maxBeadsLimit, requiredSlugs, categories, selectedStopperId, baseBead, modeConfig, dispatch]);

    const removeBead = useCallback((index: number) => {
        dispatch(removeBeadFromStore(index));
    }, [dispatch]);

    const swapBeads = useCallback((sourceIndex: number, destinationIndex: number) => {
        dispatch(swapBeadsInStore({ sourceIndex, destinationIndex }));
    }, [dispatch]);

    const clearLastBead = useCallback(() => {
        dispatch(clearLastBeadInStore());
    }, [dispatch]);

    const resetDesigner = useCallback(() => {
        dispatch(resetDesignerInStore());
    }, [dispatch]);

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
        dispatch(setCurrentDraftId(draftId));
        toast.success('\u0110\u00e3 l\u01b0u b\u1ea3n nh\u00e1p!');
    }, [braceletMode, selectedBeads, selectedBaseId, selectedStopperId, currentDraftId, dispatch]);

    const handleLoadDraft = useCallback((draft: BraceletDraft) => {
        dispatch(setBraceletMode(draft.braceletMode));
        dispatch(setSelectedBeads(draft.beads));
        if (draft.baseId) dispatch(setSelectedBaseId(draft.baseId));
        dispatch(setSelectedStopperId(draft.stopperId || null));
        dispatch(setCurrentDraftId(draft.id));
        toast.success(`\u0110\u00e3 t\u1ea3i b\u1ea3n nh\u00e1p: ${draft.name}`);
    }, [dispatch]);

    const saveDefaultCalibration = useCallback(async (index: number) => {
        const bead = selectedBeads[index];
        if (!bead) return;

        try {
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
            
            // NOTE: Updating availableBeads is handled via another action if needed, but for simplicity here we assume it's fine.
        } catch (e) {
            toast.error("Lỗi khi lưu cấu hình điểm treo");
        }
    }, [selectedBeads]);

    return {
        addBead,
        removeBead,
        swapBeads,
        clearLastBead,
        resetDesigner,
        handleSaveDraft,
        handleLoadDraft,
        saveDefaultCalibration,
        baseBead,
        braceletBases,
        maxBeadsLimit
    };
}
