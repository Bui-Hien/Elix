"use client";

import React, { useRef, useCallback, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BeadWithPosition, BraceletMode, shadeColor } from './types';
import { getImageUrl } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Shape Renderers ────────────────────────────────────────────────

function renderImageBead(bead: BeadWithPosition, gradId: string, isSelected: boolean) {
    const { drawSize, id, imageUrl, angle, type, shape, anchorX, anchorY, rotationOffset } = bead;

    const isCharm = type === 'charm';
    const baseRotation = (angle * 180) / Math.PI + (isCharm ? -90 : 90);
    // rotationOffset is applied separately as inner rotation (pure image spin)

    // For non-sphere shapes (charms, spacers), show full image without clipping
    const useClipping = shape === 'sphere' || type === 'stone' || type === 'metal';

    // Anchor Point Logic
    const ax = anchorX !== undefined ? anchorX : 0.5;
    const ay = anchorY !== undefined ? anchorY : (isCharm ? 0 : 0.5);

    const translateX = -(ax - 0.5) * drawSize;
    const translateY = -(ay - 0.5) * drawSize;

    const highlight = isSelected && (
        <circle r={drawSize / 2 + 6} fill="none" stroke="gold" strokeWidth="2" strokeDasharray="4 2" />
    );

    // Outer: position on bracelet (base rotation + anchor offset)
    const outerTransform = `rotate(${baseRotation}) translate(${translateX}, ${translateY})`;
    // Inner: pure visual spin of the image
    const innerRotation = rotationOffset ? `rotate(${rotationOffset})` : undefined;

    if (useClipping) {
        return (
            <g transform={outerTransform}>
                <defs>
                    <clipPath id={`clip-${id}`}>
                        <circle r={drawSize / 2} />
                    </clipPath>
                </defs>
                {highlight}
                <g transform={innerRotation}>
                    <image
                        href={getImageUrl(imageUrl)}
                        x={-drawSize / 2} y={-drawSize / 2}
                        width={drawSize} height={drawSize}
                        clipPath={`url(#clip-${id})`}
                        preserveAspectRatio="xMidYMid slice"
                        {...{ draggable: "false" }}
                    />
                </g>
            </g>
        );
    } else {
        return (
            <g transform={outerTransform}>
                {highlight}
                <g transform={innerRotation}>
                    <image
                        href={getImageUrl(imageUrl)}
                        x={-drawSize / 2} y={-drawSize / 2}
                        width={drawSize} height={drawSize}
                        preserveAspectRatio="xMidYMid meet"
                        {...{ draggable: "false" }}
                    />
                </g>
                {/* For charms, draw a small shadow catch where it meets the cord */}
                {isCharm && (
                    <ellipse cy={-translateY} rx={2} ry={1} fill="rgba(0,0,0,0.2)" />
                )}
                {/* For spacers and rings, draw a small cord segment on top to look threaded */}
                {(type === 'spacer' || shape === 'ring' || shape === 'tube') && !isCharm && (
                    <line
                        x1={-drawSize / 2 * 0.8} y1={-translateY}
                        x2={drawSize / 2 * 0.8} y2={-translateY}
                        stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round"
                        opacity="0.8"
                    />
                )}
            </g>
        );
    }
}

function renderShapeSVG(bead: BeadWithPosition, gradId: string, isSelected: boolean) {
    const { shape, drawSize, color, imageUrl, type, angle, anchorX, anchorY, rotationOffset } = bead;
    if (imageUrl) return renderImageBead(bead, gradId, isSelected);

    const darkColor = shadeColor(color, -40);
    const isCharm = type === 'charm';

    // Base rotation follows the bracelet curve
    const baseRotation = (angle * 180) / Math.PI + (isCharm ? -90 : 90);
    // rotationOffset is applied as inner rotation (pure visual spin)

    const ax = anchorX !== undefined ? anchorX : 0.5;
    const ay = anchorY !== undefined ? anchorY : (isCharm ? 0 : 0.5);

    const translateX = -(ax - 0.5) * drawSize;
    const translateY = -(ay - 0.5) * drawSize;

    const highlight = isSelected && (
        <circle r={drawSize / 2 + 6} fill="none" stroke="gold" strokeWidth="2" strokeDasharray="4 2" />
    );

    const shadowCatch = isCharm && (
        <ellipse cy={-translateY} rx={2} ry={1} fill="rgba(0,0,0,0.1)" />
    );

    const outerTransform = `rotate(${baseRotation}) translate(${translateX}, ${translateY})`;
    const innerRotation = rotationOffset ? `rotate(${rotationOffset})` : undefined;

    switch (shape) {
        case 'snowflake':
            return (
                <g transform={outerTransform}>
                    {highlight}
                    {shadowCatch}
                    <g transform={innerRotation}>
                        <g transform={`scale(${drawSize / 40})`}>
                            {[0, 60, 120, 180, 240, 300].map(deg => (
                                <g key={deg} transform={`rotate(${deg})`}>
                                    <rect x="-1" y="-12" width="2" height="12" fill={color} rx="1" />
                                    <path d="M -3 -8 L 0 -5 L 3 -8" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                                    <path d="M -4 -11 L 0 -8 L 4 -11" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />
                                </g>
                            ))}
                            <circle r="4" fill={`url(#${gradId})`} />
                        </g>
                    </g>
                </g>
            );
        case 'butterfly':
            return (
                <g transform={outerTransform}>
                    {highlight}
                    {shadowCatch}
                    <g transform={innerRotation}>
                        <g transform={`scale(${drawSize / 30})`}>
                            <path d="M 0 0 C -12 -12 -15 2 -2 2 C -15 10 -10 15 0 2 C 10 15 15 10 2 2 C 15 2 12 -12 0 0"
                                fill={`url(#${gradId})`} stroke={darkColor} strokeWidth="0.5" />
                            <rect x="-0.8" y="-4" width="1.6" height="8" rx="0.8" fill={darkColor} />
                        </g>
                    </g>
                </g>
            );
        case 'heart':
            return (
                <g transform={outerTransform}>
                    {highlight}
                    {shadowCatch}
                    <g transform={innerRotation}>
                        <g transform={`scale(${drawSize / 25})`}>
                            <path d="M 0 8 C -8 3 -10 -2 -5 -6 C -2 -8 0 -4 0 -4 C 0 -4 2 -8 5 -6 C 10 -2 8 3 0 8"
                                fill={`url(#${gradId})`} />
                            <path d="M -4 -5 C -2 -6 0 -4 0 -4" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
                        </g>
                    </g>
                </g>
            );
        case 'ring':
            return (
                <g transform={outerTransform}>
                    {highlight}
                    <g transform={innerRotation}>
                        <ellipse rx={drawSize * 0.4} ry={drawSize * 1.8} fill={color} stroke={darkColor} strokeWidth="0.5" />
                        <ellipse rx={drawSize * 0.3} ry={drawSize * 1.5} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
                        <ellipse rx={drawSize * 0.2} ry={drawSize * 1.2} fill="none" />
                    </g>
                    <line x1={-drawSize * 0.2} y1={-translateY} x2={drawSize * 0.2} y2={-translateY} stroke="#1a1a1a" strokeWidth="2.2" />
                </g>
            );
        case 'tube':
            return (
                <g transform={outerTransform}>
                    {highlight}
                    <g transform={innerRotation}>
                        <rect x={-drawSize * 0.6} y={-drawSize * 1.5} width={drawSize * 1.2} height={drawSize * 3} rx={2} fill={`url(#${gradId})`} stroke={darkColor} strokeWidth="1" />
                        <line x1={-drawSize * 0.6} y1="0" x2={drawSize * 0.6} y2="0" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
                    </g>
                </g>
            );
        default:
            return (
                <g transform={outerTransform}>
                    {highlight}
                    <g transform={innerRotation}>
                        <circle r={drawSize / 2} fill={`url(#${gradId})`}
                            stroke={type === 'metal' ? 'rgba(255,255,255,0.3)' : 'none'} strokeWidth="0.5" />
                    </g>
                </g>
            );
    }
}

// ─── Component ──────────────────────────────────────────────────────

interface DesignerCanvasProps {
    beads: BeadWithPosition[];
    braceletMode: BraceletMode;
    centerX: number;
    centerY: number;
    radiusX: number;
    radiusY: number;
    swapBeads: (indexA: number, indexB: number) => void;
    removeBead: (index: number) => void;
    selectedIdx?: number | null;
    onSelect?: (index: number | null) => void;
    baseImageUrl?: string;
    zoomScale?: number;
    rotation?: number;
    setRotation?: (deg: number) => void;
}

interface DragUI {
    origIdx: number;
    ghostX: number;
    ghostY: number;
    targetOrigIdx: number | null;
}

export interface DesignerCanvasHandle {
    getSVG: () => string;
}

function unrotatePoint(x: number, y: number, cx: number, cy: number, deg: number) {
    const rad = -deg * Math.PI / 180;
    const dx = x - cx;
    const dy = y - cy;
    return {
        x: cx + (dx * Math.cos(rad) - dy * Math.sin(rad)),
        y: cy + (dx * Math.sin(rad) + dy * Math.cos(rad))
    };
}

const DesignerCanvas = forwardRef<DesignerCanvasHandle, DesignerCanvasProps>(({
    beads, braceletMode, centerX, centerY, radiusX, radiusY, swapBeads, removeBead,
    selectedIdx, onSelect, baseImageUrl, zoomScale = 1, rotation = 0, setRotation
}, ref) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useImperativeHandle(ref, () => ({
        getSVG: () => {
            if (!svgRef.current) return "";
            const serializer = new XMLSerializer();
            return serializer.serializeToString(svgRef.current);
        }
    }));
    const canvasRadius = radiusX; // Use dynamic radius

    // Keep beads in a ref so window event listeners always see latest data
    const beadsRef = useRef(beads);
    beadsRef.current = beads;

    // Keep rotation in a ref so window event listeners always see latest value (avoid stale closure)
    const rotationRef = useRef(rotation);
    rotationRef.current = rotation;

    // Keep canvasRadius in a ref so window event listeners see current dynamic value
    const canvasRadiusRef = useRef(canvasRadius);
    canvasRadiusRef.current = canvasRadius;

    // Track initial mount — stagger only on first load
    const hasMounted = useRef(false);
    useEffect(() => {
        const t = setTimeout(() => { hasMounted.current = true; }, 1500);
        return () => clearTimeout(t);
    }, []);

    // No need to manually track bead changes — Framer Motion handles position animation
    // automatically when animate.x/y changes (spring from old → new position, like old app).

    // UI state for rendering ghost + highlights
    const activeDragRef = useRef<DragUI | null>(null);
    const [forceRender, setForceRender] = useState(0);

    // Double-click detection
    const lastClick = useRef<{ origIdx: number; time: number } | null>(null);

    // ── Coord conversion: screen → SVG viewBox ──────────────────────
    // Correctly handles preserveAspectRatio="xMidYMid meet"
    const toSVG = useCallback((clientX: number, clientY: number) => {
        const svg = svgRef.current;
        if (!svg) return { x: 400, y: 350 };
        const rect = svg.getBoundingClientRect();

        const vbW = 800, vbH = 700;
        const vbAspect = vbW / vbH;
        const elAspect = rect.width / rect.height;

        let renderW: number, renderH: number, padX: number, padY: number;
        if (elAspect > vbAspect) {
            // wider → horizontal padding
            renderH = rect.height;
            renderW = renderH * vbAspect;
            padX = (rect.width - renderW) / 2;
            padY = 0;
        } else {
            // taller → vertical padding
            renderW = rect.width;
            renderH = renderW / vbAspect;
            padX = 0;
            padY = (rect.height - renderH) / 2;
        }
        return {
            x: ((clientX - rect.left - padX) / renderW) * vbW,
            y: ((clientY - rect.top - padY) / renderH) * vbH,
        };
    }, []);

    // ── Coord conversion for interaction: accounting for zoom ────────
    const toZoomedSVG = useCallback((clientX: number, clientY: number) => {
        const pt = toSVG(clientX, clientY);
        if (zoomScale === 1) return pt;

        // Origin for zoom is center (400, 350)
        const dx = (pt.x - 400) / zoomScale;
        const dy = (pt.y - 350) / zoomScale;

        return {
            x: 400 + dx,
            y: 350 + dy
        };
    }, [toSVG, zoomScale]);

    // ── Find nearest bead (excluding one) ────────────────────────────
    const findNearest = useCallback((svgX: number, svgY: number, excludeOrigIdx: number) => {
        const bs = beadsRef.current;
        if (bs.length <= 1) return null;

        let best: BeadWithPosition | null = null;
        let minDistance = Infinity;

        for (const b of bs) {
            const dist = Math.hypot(svgX - b.x, svgY - b.y);
            if (dist < minDistance) {
                minDistance = dist;
                best = b;
            }
        }
        return best;
    }, []); // Uses beadsRef — no stale closures

    // ── PointerDown on SVG — start drag + attach window listeners ───
    const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
        const ptRaw = toZoomedSVG(e.clientX, e.clientY);
        const pt = unrotatePoint(ptRaw.x, ptRaw.y, 400, 350, rotation);
        const isTouch = e.pointerType === 'touch';

        // Touch offset (SVG units) to keep the bead visible above the finger
        const TOUCH_OFFSET_Y = 50;
        const effectivePt = isTouch ? { x: pt.x, y: pt.y - TOUCH_OFFSET_Y } : pt;

        // Hit-test: find which bead was clicked
        const bs = beadsRef.current;
        let hitBead: BeadWithPosition | null = null;
        let hitDist = Infinity;
        for (const b of bs) {
            // Generous hit area: at least 22px for mouse, 28px for touch
            const r = Math.max(b.drawSize / 2 + (isTouch ? 14 : 8), isTouch ? 28 : 22);
            const d = Math.hypot(pt.x - b.x, pt.y - b.y);
            if (d <= r && d < hitDist) { hitDist = d; hitBead = b; }
        }

        if (!hitBead) {
            // Empty area -> rotate bracelet
            if (!setRotation) return;
            e.preventDefault();

            // Calculate start angle of pointer relative to center (400, 350)
            const startAngle = Math.atan2(ptRaw.y - 350, ptRaw.x - 400) * 180 / Math.PI;
            const startRotation = rotation;

            const onRotateMove = (ev: PointerEvent) => {
                ev.preventDefault();
                const currentPt = toZoomedSVG(ev.clientX, ev.clientY);
                const currentAngle = Math.atan2(currentPt.y - 350, currentPt.x - 400) * 180 / Math.PI;
                const angleDiff = currentAngle - startAngle;
                let newRotation = (startRotation - angleDiff) % 360;
                if (newRotation < 0) newRotation += 360;
                setRotation(newRotation);
            };

            const onRotateUp = () => {
                window.removeEventListener('pointermove', onRotateMove);
                window.removeEventListener('pointerup', onRotateUp);
            };

            window.addEventListener('pointermove', onRotateMove);
            window.addEventListener('pointerup', onRotateUp);
            return;
        }

        // Double-click → remove bead
        const now = Date.now();
        const lc = lastClick.current;
        if (lc && lc.origIdx === hitBead.originalIndex && now - lc.time < 350) {
            removeBead(hitBead.originalIndex);
            lastClick.current = null;
            return;
        }
        lastClick.current = { origIdx: hitBead.originalIndex, time: now };

        e.preventDefault();

        // Calculate offset between mouse click and bead center to prevent snapping
        const isTouchDown = e.pointerType === 'touch';
        const downRaw = toZoomedSVG(e.clientX, e.clientY);
        const downPt = unrotatePoint(downRaw.x, downRaw.y, 400, 350, rotationRef.current);
        const effectiveDownPt = isTouchDown ? { x: downPt.x, y: downPt.y - TOUCH_OFFSET_Y } : downPt;

        const pointerOffsetX = pt.x - effectiveDownPt.x;
        const pointerOffsetY = pt.y - effectiveDownPt.y;

        // Captured constants for this drag operation
        const dragOrigIdx = hitBead.originalIndex;
        const startX = pt.x;
        const startY = pt.y;

        // Show initial drag UI
        activeDragRef.current = {
            origIdx: dragOrigIdx,
            ghostX: pt.x,
            ghostY: pt.y,
            targetOrigIdx: null,
        };
        setForceRender(prev => prev + 1);

        // Single click → select bead
        if (onSelect) onSelect(dragOrigIdx);

        // ── Window-level listeners: 100% reliable, no pointer capture needed ──

        const onMove = (ev: PointerEvent) => {
            ev.preventDefault();
            const isTouchMove = ev.pointerType === 'touch';
            const mpRaw = toZoomedSVG(ev.clientX, ev.clientY);
            // Use rotationRef to always get the current rotation value (avoid stale closure)
            const mp = unrotatePoint(mpRaw.x, mpRaw.y, 400, 350, rotationRef.current);
            const effectiveMp = isTouchMove ? { x: mp.x, y: mp.y - TOUCH_OFFSET_Y } : mp;

            const ghostX = effectiveMp.x + pointerOffsetX;
            const ghostY = effectiveMp.y + pointerOffsetY;

            const dist = Math.hypot(ghostX - startX, ghostY - startY);
            const distFromCenter = Math.hypot(ghostX - 400, ghostY - 350);
            const isDeleteZone = (braceletMode === 'full' || braceletMode === 'mini') && (distFromCenter > canvasRadiusRef.current + 60);
            const nearest = findNearest(ghostX, ghostY, dragOrigIdx);

            activeDragRef.current = {
                origIdx: dragOrigIdx,
                ghostX: ghostX,
                ghostY: ghostY,
                targetOrigIdx: isDeleteZone ? -1 : (dist > 10 && nearest ? nearest.originalIndex : null),
            };
            setForceRender(prev => prev + 1);
        };

        const onUp = (ev: PointerEvent) => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);

            const dragUI = activeDragRef.current;
            if (!dragUI) return;

            const dragOrigIdx = dragUI.origIdx;
            let parentWillRender = false;

            if (dragUI.targetOrigIdx === -1) {
                removeBead(dragOrigIdx);
                parentWillRender = true;
            } else {
                const dropX = dragUI.ghostX;
                const dropY = dragUI.ghostY;

                const nearest = findNearest(dropX, dropY, dragOrigIdx);
                if (nearest && dragOrigIdx !== nearest.originalIndex) {
                    swapBeads(dragOrigIdx, nearest.originalIndex);
                    parentWillRender = true;
                }
            }

            activeDragRef.current = null;
            onSelect?.(null);

            if (!parentWillRender) {
                setForceRender(prev => prev + 1);
            }
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    }, [toSVG, toZoomedSVG, findNearest, removeBead, swapBeads, onSelect, rotation, setRotation, braceletMode]);

    // Render loop state
    const dragUI = activeDragRef.current;

    return (
        <div className="flex-1 relative flex flex-col items-center justify-center">

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">

                <svg
                    ref={svgRef}
                    viewBox="0 0 800 700"
                    className="w-full h-full overflow-visible select-none relative z-[1]"
                    preserveAspectRatio="xMidYMid meet"
                    style={{
                        cursor: dragUI ? 'grabbing' : 'default',
                        touchAction: 'none',
                    }}
                    onPointerDown={handlePointerDown}
                    onDragStart={(e) => e.preventDefault()}
                >
                    <defs>
                        <filter id="ghostGlow" x="-80%" y="-80%" width="260%" height="260%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>

                        <filter id="deleteGlow" x="-80%" y="-80%" width="260%" height="260%">
                            <feColorMatrix type="matrix" values="
                                1 0 0 0 0.8
                                0 0.3 0 0 0
                                0 0 0.3 0 0
                                0 0 0 1 0
                            " />
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        {beads.map(b => {
                            const gid = `grad-${b.id.replace(/[^a-zA-Z0-9]/g, '-')}`;
                            return (
                                <radialGradient key={gid} id={gid} cx="33%" cy="33%" r="70%">
                                    <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                                    <stop offset="25%" stopColor={shadeColor(b.color, 25)} />
                                    <stop offset="65%" stopColor={b.color} />
                                    <stop offset="85%" stopColor={shadeColor(b.color, -25)} />
                                    <stop offset="100%" stopColor={shadeColor(b.color, -50)} />
                                </radialGradient>
                            );
                        })}
                    </defs>

                    {/* Zoomable & Rotatable Content Wrapper */}
                    <g style={{
                        transform: `scale(${zoomScale}) rotate(${rotation}deg)`,
                        transformOrigin: '400px 350px',
                        transition: 'transform 0.1s ease-out'
                    }}>
                        {/* Render default cord rings only when NOT using a custom base image in mini/single mode */}
                        {!((braceletMode === 'mini' || braceletMode === 'single') && baseImageUrl) && (
                            <>
                                {/* Guide Cord — Base layer (behind beads) */}
                                <ellipse cx={centerX} cy={centerY} rx={canvasRadius} ry={canvasRadius}
                                    fill="none" stroke="#2c2c2e" strokeWidth="3" opacity="0.15" />

                                {/* Realistic Cord (Black Elastic/Wire) */}
                                <ellipse cx={centerX} cy={centerY} rx={canvasRadius} ry={canvasRadius}
                                    fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />

                                {/* Subtle highlight on cord for depth */}
                                <ellipse cx={centerX} cy={centerY} rx={canvasRadius} ry={canvasRadius}
                                    fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" strokeDasharray="1, 10" opacity="0.5" />
                            </>
                        )}

                        {/* Render base image for mini/single mode */}
                        {(braceletMode === 'mini' || braceletMode === 'single') && baseImageUrl && (
                            <image
                                href={getImageUrl(baseImageUrl)}
                                x={centerX - canvasRadius}
                                y={centerY - canvasRadius}
                                width={canvasRadius * 2}
                                height={canvasRadius * 2}
                                preserveAspectRatio="xMidYMid meet"
                                opacity="1"
                                {...{ draggable: "false" }}
                            />
                        )}

                        {/* Fallback cord ring when no base image */}
                        {(braceletMode === 'mini' || braceletMode === 'single') && !baseImageUrl && (
                            <ellipse cx={centerX} cy={centerY} rx={canvasRadius} ry={canvasRadius}
                                fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
                        )}

                        {/* Drop target ring */}
                        {dragUI?.targetOrigIdx != null && (() => {
                            const tb = beads.find(b => b.originalIndex === dragUI.targetOrigIdx);
                            if (!tb) return null;
                            return (
                                <circle cx={tb.x} cy={tb.y}
                                    r={tb.drawSize / 2 + 8}
                                    fill="rgba(212,175,55,0.06)"
                                    stroke="rgba(212,175,55,0.65)"
                                    strokeWidth="2.5" strokeDasharray="5 3" />
                            );
                        })()}

                        {/* Beads — AnimatePresence enables smooth exit when bead removed */}
                        <AnimatePresence>
                            {beads.map(bead => {
                                const gradId = `grad-${bead.id.replace(/[^a-zA-Z0-9]/g, '-')}`;
                                const isDragging = dragUI?.origIdx === bead.originalIndex;
                                const isTarget = dragUI?.targetOrigIdx === bead.originalIndex;

                                const isInitial = !hasMounted.current;
                                const startX = centerX;
                                const startY = centerY;
                                const stagger = isInitial ? bead.originalIndex * 0.06 : 0;

                                return (
                                    <motion.g
                                        key={bead.id}
                                        initial={{
                                            x: isInitial ? startX : bead.x,
                                            y: isInitial ? startY : bead.y,
                                            opacity: 0,
                                            scale: 0.3,
                                        }}
                                        animate={{
                                            x: isDragging ? dragUI.ghostX : bead.x,
                                            y: isDragging ? dragUI.ghostY : bead.y,
                                            opacity: (isDragging && dragUI.targetOrigIdx === -1) ? 0.45 : 1,
                                            scale: isDragging
                                                ? (dragUI.targetOrigIdx === -1 ? 0.95 : 1.3)
                                                : (isTarget ? 1.15 : 1),
                                        }}
                                        exit={{
                                            // AnimatePresence — removed beads fade+shrink out like old app
                                            scale: 0,
                                            opacity: 0,
                                            transition: { type: 'spring', stiffness: 300, damping: 25 },
                                        }}
                                        transition={isInitial ? {
                                            // First-load stagger — beads fan out from center
                                            x: { type: 'spring', stiffness: 200, damping: 20, delay: stagger },
                                            y: { type: 'spring', stiffness: 200, damping: 20, delay: stagger },
                                            scale: { type: 'spring', stiffness: 300, damping: 22, delay: stagger },
                                            opacity: { duration: 0.35, delay: stagger },
                                        } : isDragging ? {
                                            // Tween instantly to follow cursor
                                            x: { type: 'tween', duration: 0 },
                                            y: { type: 'tween', duration: 0 },
                                            scale: { type: 'spring', stiffness: 400, damping: 25 },
                                        } : {
                                            // Like old app: spring stiffness:200 damping:20.
                                            // Animates smoothly from drop position to final slot
                                            type: 'spring', stiffness: 200, damping: 20,
                                        }}
                                        filter={(isDragging && dragUI.targetOrigIdx === -1) ? "url(#deleteGlow)" : (isDragging ? "url(#ghostGlow)" : undefined)}
                                        style={{
                                            cursor: dragUI ? 'grabbing' : 'grab',
                                            zIndex: isDragging ? 50 : 1
                                        }}
                                    >
                                        {renderShapeSVG(bead, gradId, selectedIdx === bead.originalIndex)}
                                        <circle r={Math.max(bead.drawSize / 2 + 5, 18)} fill="transparent" />
                                    </motion.g>
                                );
                            })}
                        </AnimatePresence>

                    </g>
                </svg>
            </div>
        </div>
    );
});

export default DesignerCanvas;
