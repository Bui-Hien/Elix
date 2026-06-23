// ─── Types ─────────────────────────────────────────────────────────

export type AccessoryShape = 'sphere' | 'heart' | 'star' | 'snowflake' | 'butterfly' | 'ring' | 'tube';
export type BeadCategory = 'stone' | 'metal' | 'charm' | 'spacer' | 'stopper' | 'custom' | 'base' | string;
export type BraceletMode = 'full' | 'mini' | 'single';

export interface Bead {
    id: string;
    type: BeadCategory;
    color: string;
    size: number;
    displaySize?: string; // User-facing size label (e.g., "10mm")
    label: string;
    price: number;
    shape?: AccessoryShape;
    imageUrl?: string;
    dbId?: number; // Database ID for calibration updates
    // Calibration fields for irregular shapes (0-1 range for anchors)
    anchorX?: number;
    anchorY?: number;
    rotationOffset?: number;
    // Ellipse configuration for base beads (mini mode)
    ellipseCenterX?: number;
    ellipseCenterY?: number;
    ellipseRadiusX?: number;
    ellipseRadiusY?: number;
    arcStartAngle?: number;
    arcEndAngle?: number;
    // Single stone configuration
    isSingleStoneMode?: boolean;
    singleStoneX?: number;
    singleStoneY?: number;
    scale?: number; // Visual scale multiplier (0.5 to 2.5)
}

export interface BeadWithPosition extends Bead {
    x: number;
    y: number;
    scale: number;
    drawSize: number;
    angle: number;
    originalIndex: number;
}

// ─── Layout Constants ──────────────────────────────────────────────

export const BRACELET_CONFIG = {
    full: {
        minBeads: 22,
        maxBeads: 25,
        radiusX: 210,
        radiusY: 180,
        canvasRadius: 220,
        beadScale: 4.1,
    },
    mini: {
        minBeads: 0,
        maxBeads: 7, // 5 charms + 2 stoppers
        radiusX: 160,
        radiusY: 130,
        canvasRadius: 220,
        beadScale: 5.5,
        arcWidth: 1.3,
    },
    single: {
        minBeads: 1,
        maxBeads: 1, // Only 1 stone allowed
        radiusX: 160,
        radiusY: 130,
        canvasRadius: 220,
        beadScale: 6.0, // Larger stone for single mode
        arcWidth: 1.0,
    },
    centerX: 400,
    centerY: 350,
} as const;

export const CATEGORY_LABELS: Record<Exclude<BeadCategory, 'custom' | 'base' | 'stopper'>, string> = {
    stone: 'Đá Quý',
    metal: 'Charm Bạc',
    charm: 'Linh Vật',
    spacer: 'Phụ Kiện',
};

// ─── Geometry Helpers ──────────────────────────────────────────────

/** Calculate the angle of a bead at `index` out of `total` beads */
export function calculateBeadAngle(
    index: number,
    total: number,
    mode: BraceletMode,
    arcStartAngle?: number,
    arcEndAngle?: number
): number {
    if (mode === 'mini') {
        // Use custom arc config if provided
        if (arcStartAngle !== undefined && arcEndAngle !== undefined) {
            const t = index / (total - 1 || 1);
            return arcStartAngle + t * (arcEndAngle - arcStartAngle);
        }
        // Default: bottom arc
        const start = Math.PI * 1.17; // ~210°
        const end = Math.PI * 1.6; // ~288°
        const t = index / (total - 1 || 1);
        return start + t * (end - start);
    }
    // Full mode: full circle
    return (index / total) * Math.PI * 2 - Math.PI / 2;
}

// ─── Color Helpers ─────────────────────────────────────────────────

export function shadeColor(color: string, percent: number): string {
    if (!color || color.length < 7) return color;
    const clamp = (v: number) => Math.min(255, Math.max(0, v));
    const R = clamp(Math.floor((parseInt(color.slice(1, 3), 16) * (100 + percent)) / 100));
    const G = clamp(Math.floor((parseInt(color.slice(3, 5), 16) * (100 + percent)) / 100));
    const B = clamp(Math.floor((parseInt(color.slice(5, 7), 16) * (100 + percent)) / 100));
    return `#${R.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;
}

// ─── Preset Patterns ───────────────────────────────────────────────

export const INITIAL_PATTERNS: Record<BraceletMode, string[]> = {
    full: [],
    mini: [],
    single: [],
};

// ─── Bead Catalog ──────────────────────────────────────────────────

export const AVAILABLE_BEADS: Bead[] = [];
