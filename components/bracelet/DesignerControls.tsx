"use client";

import React, { useState, useEffect } from 'react';
import { Layers, Trash2, RotateCcw, Save, FolderOpen, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BraceletMode } from './types';

export interface BraceletDraft {
    id: string;
    name: string;
    braceletMode: BraceletMode;
    beads: any[];
    baseId: string | null;
    stopperId: string | null;
    createdAt: number;
    updatedAt: number;
}

const DRAFTS_KEY = 'bracelet-drafts';

export function getDrafts(): BraceletDraft[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
    } catch { return []; }
}

export function saveDraftToStorage(draft: BraceletDraft) {
    const drafts = getDrafts();
    const idx = drafts.findIndex(d => d.id === draft.id);
    if (idx >= 0) drafts[idx] = draft;
    else drafts.unshift(draft);
    // Keep max 10 drafts
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts.slice(0, 10)));
}

export function deleteDraftFromStorage(id: string) {
    const drafts = getDrafts().filter(d => d.id !== id);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

const MODE_LABELS: Record<string, string> = {
    full: 'Vòng Hạt',
    mini: 'Dây Cáp',
    single: 'Vòng Cổ',
};

interface DesignerControlsProps {
    clearLastBead: () => void;
    resetDesigner: () => void;
    hasBeads: boolean;
    totalValue?: number;
    count?: number;
    maxBeadsLimit?: number;
    onAddToCart?: () => Promise<void>;
    onSaveDraft?: () => void;
    onLoadDraft?: (draft: BraceletDraft) => void;
}
export default function DesignerControls({ clearLastBead, resetDesigner, hasBeads, totalValue, count, maxBeadsLimit, onAddToCart, onSaveDraft, onLoadDraft }: DesignerControlsProps) {
    const [showDrafts, setShowDrafts] = useState(false);
    const [drafts, setDrafts] = useState<BraceletDraft[]>([]);

    useEffect(() => {
        if (showDrafts) setDrafts(getDrafts());
    }, [showDrafts]);

    const handleDeleteDraft = (id: string) => {
        deleteDraftFromStorage(id);
        setDrafts(getDrafts());
    };

    return (
        <>
            {/* Info and Add to Cart Button */}
            <div className="absolute top-4 left-4 lg:top-8 lg:left-8 z-40">
                <div className="flex bg-white/90 backdrop-blur-md rounded-full shadow-md border border-gray-100 p-1 lg:p-2 items-center">
                    <div className="flex flex-col px-2 lg:px-4 text-center min-w-[60px] lg:min-w-[80px]">
                        <span className="text-[10px] lg:text-sm font-bold text-gray-800">
                            {totalValue?.toLocaleString('vi-VN')}₫
                        </span>
                        <span className="text-[8px] lg:text-[10px] font-medium text-gray-500">
                            {count}/{maxBeadsLimit} Hạt
                        </span>
                    </div>
                    <button
                        onClick={onAddToCart}
                        disabled={count === 0}
                        className={cn(
                            "h-8 lg:h-10 px-3 lg:px-6 rounded-full text-[10px] lg:text-xs font-bold transition-all whitespace-nowrap",
                            count === 0
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-[#BD7C6F] text-white shadow-sm hover:bg-[#A86B5E] active:scale-95"
                        )}
                    >
                        MUA NGAY
                    </button>
                </div>
            </div>

            {/* Default Controls + Draft Buttons */}
            <div className="absolute top-4 right-4 lg:top-8 lg:right-8 flex gap-2 z-40">
                {/* Draft buttons */}
                <div className="flex bg-white/90 backdrop-blur-md rounded-full shadow-md border border-gray-100">
                    {onSaveDraft && (
                        <button
                            onClick={onSaveDraft}
                            disabled={!hasBeads}
                            className={cn(
                                "p-2 lg:p-3 rounded-l-full transition-all",
                                hasBeads
                                    ? "text-emerald-600 hover:bg-emerald-50"
                                    : "text-gray-300 cursor-not-allowed"
                            )}
                            title="Lưu bản nháp"
                        >
                            <Save className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>
                    )}
                    {onSaveDraft && <div className="w-px bg-gray-200" />}
                    <button
                        onClick={() => setShowDrafts(!showDrafts)}
                        className={cn(
                            "p-2 lg:p-3 transition-all",
                            onSaveDraft ? "rounded-r-full" : "rounded-full",
                            showDrafts ? "bg-purple-50 text-purple-600" : "text-gray-500 hover:bg-gray-100"
                        )}
                        title="Xem bản nháp"
                    >
                        <FolderOpen className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                </div>

                {/* Undo / Reset */}
                <div className="flex bg-white/90 backdrop-blur-md rounded-full shadow-md border border-gray-100">
                    <button
                        onClick={clearLastBead}
                        disabled={!hasBeads}
                        className={cn(
                            "p-2 lg:p-3 rounded-l-full transition-all",
                            hasBeads
                                ? "text-gray-500 hover:bg-red-50 hover:text-red-500"
                                : "text-gray-300 cursor-not-allowed"
                        )}
                        title="Xóa hạt cuối"
                    >
                        <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                    <div className="w-px bg-gray-200" />
                    <button
                        onClick={resetDesigner}
                        disabled={!hasBeads}
                        className={cn(
                            "p-2 lg:p-3 rounded-r-full transition-all",
                            hasBeads
                                ? "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                : "text-gray-300 cursor-not-allowed"
                        )}
                        title="Làm mới thiết kế"
                    >
                        <RotateCcw className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                </div>
            </div>

            {/* Drafts Dropdown */}
            {showDrafts && (
                <div className="absolute top-16 right-4 lg:top-20 lg:right-8 z-50 w-72 lg:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800">Bản nháp của bạn</h3>
                        <button onClick={() => setShowDrafts(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {drafts.length === 0 ? (
                            <div className="p-6 text-center text-gray-400">
                                <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">Chưa có bản nháp nào</p>
                                <p className="text-xs mt-1">Hãy thiết kế và lưu lại!</p>
                            </div>
                        ) : (
                            drafts.map(draft => (
                                <div key={draft.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 group">
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { onLoadDraft?.(draft); setShowDrafts(false); }}>
                                        <p className="text-sm font-semibold text-gray-800 truncate">{draft.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">
                                                {MODE_LABELS[draft.braceletMode] || draft.braceletMode}
                                            </span>
                                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                                <Clock className="w-3 h-3" />
                                                {new Date(draft.updatedAt).toLocaleDateString('vi-VN')}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {draft.beads.length} hạt
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteDraft(draft.id); }}
                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Xóa bản nháp"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
