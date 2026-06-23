import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Bead, BraceletMode } from '@/components/bracelet/types';

interface DesignerState {
    selectedBeads: Bead[];
    activeCategory: string;
    braceletMode: BraceletMode;
    customAssets: Bead[];
    selectedIdx: number | null;
    availableBeads: Bead[];
    selectedBaseId: string | null;
    selectedStopperId: string | null;
    zoomScale: number;
    rotation: number;
    searchTerm: string;
    categories: Record<string, string>;
    requiredSlugs: string[];
    currentDraftId: string | null;
    beadMaterials: any[];
}

const initialState: DesignerState = {
    selectedBeads: [],
    activeCategory: 'stone',
    braceletMode: 'full',
    customAssets: [],
    selectedIdx: null,
    availableBeads: [],
    selectedBaseId: null,
    selectedStopperId: null,
    zoomScale: 1,
    rotation: 0,
    searchTerm: '',
    categories: {},
    requiredSlugs: [],
    currentDraftId: null,
    beadMaterials: [],
};

const designerSlice = createSlice({
    name: 'designer',
    initialState,
    reducers: {
        setSelectedBeads: (state, action: PayloadAction<Bead[]>) => {
            state.selectedBeads = action.payload.map(b => ({ ...b, uid: (b as any).uid || `${b.id}-${Date.now()}-${Math.random()}` }));
        },
        addBead: (state, action: PayloadAction<Bead>) => {
            const bead = action.payload;
            state.selectedBeads.push({ 
                ...bead, 
                id: `${bead.id}-${Date.now()}-${Math.random()}`, 
                uid: `${bead.id}-${Date.now()}-${Math.random()}` 
            });
        },
        removeBead: (state, action: PayloadAction<number>) => {
            state.selectedBeads.splice(action.payload, 1);
            if (state.selectedIdx === action.payload) {
                state.selectedIdx = null;
            } else if (state.selectedIdx !== null && state.selectedIdx > action.payload) {
                state.selectedIdx -= 1;
            }
        },
        swapBeads: (state, action: PayloadAction<{ sourceIndex: number; destinationIndex: number }>) => {
            const { sourceIndex, destinationIndex } = action.payload;
            const newBeads = [...state.selectedBeads];
            const [moved] = newBeads.splice(sourceIndex, 1);
            newBeads.splice(destinationIndex, 0, moved);
            state.selectedBeads = newBeads;

            if (state.selectedIdx === sourceIndex) {
                state.selectedIdx = destinationIndex;
            } else if (state.selectedIdx === destinationIndex) {
                state.selectedIdx = sourceIndex;
            }
        },
        clearLastBead: (state) => {
            if (state.selectedBeads.length > 0) {
                state.selectedBeads.pop();
                if (state.selectedIdx === state.selectedBeads.length) {
                    state.selectedIdx = null;
                }
            }
        },
        resetDesigner: (state) => {
            state.selectedBeads = [];
            state.selectedIdx = null;
            state.zoomScale = 1;
            state.rotation = 0;
            state.currentDraftId = null;
            state.searchTerm = '';
            state.activeCategory = Object.keys(state.categories)[0] || 'stone';
        },
        updateBeadCalibration: (state, action: PayloadAction<{ index: number; updates: Partial<Pick<Bead, 'anchorX' | 'anchorY' | 'rotationOffset' | 'scale'>> }>) => {
            const { index, updates } = action.payload;
            if (state.selectedBeads[index]) {
                state.selectedBeads[index] = { ...state.selectedBeads[index], ...updates };
            }
        },
        syncAllSameType: (state, action: PayloadAction<number>) => {
            const index = action.payload;
            const refBead = state.selectedBeads[index];
            if (!refBead) return;

            state.selectedBeads = state.selectedBeads.map((bead) => {
                if (bead.id.split('-')[0] === refBead.id.split('-')[0]) {
                    return {
                        ...bead,
                        anchorX: refBead.anchorX,
                        anchorY: refBead.anchorY,
                        rotationOffset: refBead.rotationOffset,
                        scale: refBead.scale
                    };
                }
                return bead;
            });
        },
        resetBeadCalibration: (state, action: PayloadAction<number>) => {
            const index = action.payload;
            const bead = state.selectedBeads[index];
            if (bead) {
                const baseId = bead.id.split('-')[0];
                const availableBead = state.availableBeads.find(b => b.id === baseId) || state.customAssets.find(b => b.id === baseId);
                if (availableBead) {
                    state.selectedBeads[index] = {
                        ...bead,
                        anchorX: availableBead.anchorX,
                        anchorY: availableBead.anchorY,
                        rotationOffset: availableBead.rotationOffset,
                        scale: availableBead.scale
                    };
                }
            }
        },
        setActiveCategory: (state, action: PayloadAction<string>) => {
            state.activeCategory = action.payload;
        },
        setBraceletMode: (state, action: PayloadAction<BraceletMode>) => {
            state.braceletMode = action.payload;
        },
        setCustomAssets: (state, action: PayloadAction<Bead[]>) => {
            state.customAssets = action.payload;
        },
        setSelectedIdx: (state, action: PayloadAction<number | null>) => {
            state.selectedIdx = action.payload;
        },
        setAvailableBeads: (state, action: PayloadAction<Bead[]>) => {
            state.availableBeads = action.payload;
        },
        setSelectedBaseId: (state, action: PayloadAction<string | null>) => {
            state.selectedBaseId = action.payload;
        },
        setSelectedStopperId: (state, action: PayloadAction<string | null>) => {
            state.selectedStopperId = action.payload;
        },
        setZoomScale: (state, action: PayloadAction<number>) => {
            state.zoomScale = action.payload;
        },
        setRotation: (state, action: PayloadAction<number>) => {
            state.rotation = action.payload;
        },
        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload;
        },
        setCategories: (state, action: PayloadAction<Record<string, string>>) => {
            state.categories = action.payload;
        },
        setRequiredSlugs: (state, action: PayloadAction<string[]>) => {
            state.requiredSlugs = action.payload;
        },
        setCurrentDraftId: (state, action: PayloadAction<string | null>) => {
            state.currentDraftId = action.payload;
        },
        setBeadMaterials: (state, action: PayloadAction<any[]>) => {
            state.beadMaterials = action.payload;
        },
        loadDraft: (state, action: PayloadAction<any>) => {
            const draft = action.payload;
            state.braceletMode = draft.braceletMode;
            state.selectedBeads = draft.beads;
            state.selectedBaseId = draft.baseId || null;
            state.selectedStopperId = draft.stopperId || null;
            state.currentDraftId = draft.id;
        }
    }
});

export const {
    setSelectedBeads, addBead, removeBead, swapBeads, clearLastBead, resetDesigner,
    updateBeadCalibration, syncAllSameType, resetBeadCalibration,
    setActiveCategory, setBraceletMode, setCustomAssets, setSelectedIdx,
    setAvailableBeads, setSelectedBaseId, setSelectedStopperId,
    setZoomScale, setRotation, setSearchTerm, setCategories, setRequiredSlugs,
    setCurrentDraftId, setBeadMaterials, loadDraft
} = designerSlice.actions;

export default designerSlice.reducer;
