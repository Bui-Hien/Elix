"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom draggable bead component that handles rotation correctly
const DraggableBead = ({ bead, pos, index, radius, rotation, onDragEnd, getBeadPosition, materialType }: any) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const beadRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, beadX: 0, beadY: 0 });
  
  const { x, y, rotation: rotationToCenter } = getBeadPosition(index);
  
  const isRound = materialType === 'round';
  const isSpacer = bead.sizeMm === 0;

  // Update current position when not dragging
  useEffect(() => {
    if (!isDragging) {
      setCurrentPos({ x, y });
    }
  }, [x, y, isDragging]);

  // Handle mouse/touch down
  const handleStart = useCallback((e: any) => {
    e.stopPropagation();
    e.preventDefault();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    setIsDragging(true);
    setCurrentPos({ x, y });
    
    // Store drag start position
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      beadX: x,
      beadY: y
    };
  }, [x, y]);

  // Handle mouse/touch move
  const handleMove = useCallback((e: any) => {
    if (!isDragging) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Calculate delta in screen space
    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;
    
    // Convert delta to unrotated space
    const rad = -rotation * Math.PI / 180;
    const unrotatedDeltaX = deltaX * Math.cos(rad) - deltaY * Math.sin(rad);
    const unrotatedDeltaY = deltaX * Math.sin(rad) + deltaY * Math.cos(rad);
    
    // Calculate new position
    const newX = dragStartRef.current.beadX + unrotatedDeltaX;
    const newY = dragStartRef.current.beadY + unrotatedDeltaY;
    
    setCurrentPos({ x: newX, y: newY });
  }, [isDragging, rotation]);

  // Handle mouse/touch up
  const handleEnd = useCallback((e: any) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    onDragEnd(bead.uid, currentPos.x, currentPos.y);
  }, [isDragging, currentPos, bead.uid, onDragEnd]);

  // Add global event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, handleMove, handleEnd]);

  return (
    <motion.div
      ref={beadRef}
      data-bead="true"
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isDragging ? 1.2 : 1,
        opacity: 1,
        x: currentPos.x,
        y: currentPos.y,
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      className={`absolute cursor-grab active:cursor-grabbing ${isRound ? 'overflow-hidden rounded-full' : ''}`}
      style={{
        width: pos.visualSize,
        height: pos.visualSize,
        left: '50%',
        top: '50%',
        marginLeft: -pos.visualSize / 2,
        marginTop: -pos.visualSize / 2,
        rotate: rotationToCenter,
        zIndex: isDragging ? 50 : 10,
        boxShadow: isRound ? '0 4px 8px rgba(0,0,0,0.25)' : 'none',
      }}
    >
      {bead.image ? (
        <img
          src={bead.image}
          alt={bead.name}
          draggable={false}
          className={`w-full h-full pointer-events-none ${isRound ? 'object-cover rounded-full' : 'object-contain'}`}
          style={{
            transform: isRound ? 'scale(1.4)' : 'scale(1)',
            userSelect: 'none'
          }}
          onError={(e: any) => {
            console.error('Failed to load bead image:', bead.image, 'for bead:', bead.id);
            e.target.src = '/brand/Logo.png';
          }}
        />
      ) : (
        <div className={`w-full h-full bg-gray-300 ${isRound ? 'rounded-full' : ''}`} />
      )}
    </motion.div>
  );
};

const BeadPreviewCircle = ({ beads, setBeads, rotation, setRotation, beadMaterials = [] }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    const observer = typeof ResizeObserver !== 'undefined' && containerRef.current
      ? new ResizeObserver(updateSize)
      : null;
    if (observer && containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      window.removeEventListener('resize', updateSize);
      observer?.disconnect();
    };
  }, []);

  // Memoize all calculations
  const { baseScale, radius, beadPositions } = useMemo(() => {
    const beadCount = beads.length;
    const containerMinSize = Math.min(containerSize.width, containerSize.height) || 300;
    const isMobileLayout = containerSize.width > 0 && containerSize.width < 1024;

    const minRadius = containerMinSize * (isMobileLayout ? 0.38 : 0.34);
    const maxRadius = containerMinSize * (isMobileLayout ? 0.58 : 0.52);

    const minScale = 0.65;
    const maxScale = isMobileLayout ? 1.75 : 1.55;
    const roundVisualMult = isMobileLayout ? 4.35 : 4.0;
    const specialVisualMult = isMobileLayout ? 5.85 : 5.5;
    const roundSizeMult = isMobileLayout ? 4.35 : 4.0;
    const specialSizeMult = isMobileLayout ? 5.85 : 5.5;
    const spacerMult = 2.2;
    const roundPosMult = isMobileLayout ? 4.0 : 3.8;
    const specialPosMult = isMobileLayout ? 3.55 : 3.4;

    // Calculate total width with special beads getting larger multiplier
    let totalBeadWidthAtScale1 = 0;
    beads.forEach((bead: any) => {
      const material = beadMaterials.find((m: any) => m.id === bead.materialId);
      const isSpecial = material?.material_type === 'special';
      const isSpacer = bead.sizeMm === 0;
      if (isSpacer) {
        totalBeadWidthAtScale1 += 6 * spacerMult;
      } else {
        const sizeMultiplier = isSpecial ? specialSizeMult : roundSizeMult;
        totalBeadWidthAtScale1 += (bead.sizeMm || 10) * sizeMultiplier;
      }
    });

    const minCircumference = 2 * Math.PI * minRadius;
    const scaleForMinRadius = totalBeadWidthAtScale1 > 0
      ? minCircumference / totalBeadWidthAtScale1
      : maxScale;

    let calculatedBaseScale;
    let calculatedRadius;

    if (beadCount <= 1) {
      calculatedBaseScale = maxScale;
      calculatedRadius = minRadius;
    } else if (scaleForMinRadius >= minScale) {
      calculatedBaseScale = Math.min(maxScale, scaleForMinRadius);
      calculatedRadius = minRadius;
    } else {
      calculatedBaseScale = minScale;
      const neededCircumference = totalBeadWidthAtScale1 * minScale;
      calculatedRadius = Math.min(maxRadius, neededCircumference / (2 * Math.PI));
    }

    // Calculate bead positions (angles on the circle)
    const positions: any[] = [];
    if (beads.length > 0) {
      let totalBeadCircumference = 0;
      beads.forEach((b: any) => {
        const material = beadMaterials.find((m: any) => m.id === b.materialId);
        const isSpecial = material?.material_type === 'special';
        const isSpacer = b.sizeMm === 0;
        const positionMultiplier = isSpacer ? spacerMult : (isSpecial ? specialPosMult : roundPosMult);
        const effectiveSize = isSpacer ? 6 : (b.sizeMm || 10);
        totalBeadCircumference += effectiveSize * positionMultiplier * calculatedBaseScale;
      });

      let cumulativeLength = 0;
      for (let i = 0; i < beads.length; i++) {
        const bead = beads[i];
        const material = beadMaterials.find((m: any) => m.id === bead.materialId);
        const isSpecial = material?.material_type === 'special';
        const isSpacer = bead.sizeMm === 0;
        const positionMultiplier = isSpacer ? spacerMult : (isSpecial ? specialPosMult : roundPosMult);
        const visualMultiplier = isSpecial ? specialVisualMult : roundVisualMult;
        const effectiveSize = isSpacer ? 6 : (bead.sizeMm || 10);
        const positionLength = effectiveSize * positionMultiplier * calculatedBaseScale;
        const visualSize = effectiveSize * visualMultiplier * calculatedBaseScale;
        const position = cumulativeLength + positionLength / 2;
        const baseAngle = totalBeadCircumference > 0
          ? (position / totalBeadCircumference) * (2 * Math.PI) - (Math.PI / 2)
          : 0;
        positions.push({
          baseAngle: baseAngle,
          visualSize: visualSize,
          materialId: bead.materialId,
          uid: bead.uid,
          isSpecial: isSpecial,
        });
        cumulativeLength += positionLength;
      }
    }

    return {
      baseScale: calculatedBaseScale,
      radius: calculatedRadius,
      beadPositions: positions
    };
  }, [beads, containerSize.width, containerSize.height, beadMaterials]);

  // Calculate position for a bead at a given index
  const getBeadPosition = useCallback((index: number) => {
    const pos = beadPositions[index];
    if (!pos) return { x: 0, y: 0, rotation: 0 };

    const x = Math.cos(pos.baseAngle) * radius;
    const y = Math.sin(pos.baseAngle) * radius;
    const rotationToCenter = (pos.baseAngle * 180 / Math.PI) + 90;

    return { x, y, rotation: rotationToCenter };
  }, [beadPositions, radius]);

  // Handle bead drag end
  const handleDragEnd = useCallback((id: string, unrotatedX: number, unrotatedY: number) => {
    const dist = Math.sqrt(unrotatedX * unrotatedX + unrotatedY * unrotatedY);

    if (dist > radius + 60) {
      setBeads((prev: any[]) => prev.filter(b => b.uid !== id));
      if (navigator.vibrate) navigator.vibrate(50);
    } else {
      // Calculate angle from center
      let angle = Math.atan2(unrotatedY, unrotatedX);
      if (angle < 0) angle += 2 * Math.PI;

      const total = beads.length;
      if (total > 1 && beadPositions.length > 0) {
        const currentIndex = beads.findIndex((b: any) => b.uid === id);

        let targetIndex = 0;
        let minAngleDiff = Infinity;

        for (let i = 0; i < total; i++) {
          const beadBaseAngle = beadPositions[i]?.baseAngle || 0;
          // Normalize beadBaseAngle to 0-2π
          let normalizedBeadAngle = beadBaseAngle;
          if (normalizedBeadAngle < 0) normalizedBeadAngle += 2 * Math.PI;
          if (normalizedBeadAngle >= 2 * Math.PI) normalizedBeadAngle -= 2 * Math.PI;
          
          let diff = Math.abs(normalizedBeadAngle - angle);
          let diffWrapped = Math.abs(normalizedBeadAngle - angle + 2 * Math.PI);
          let diffNegWrapped = Math.abs(normalizedBeadAngle - angle - 2 * Math.PI);
          diff = Math.min(diff, diffWrapped, diffNegWrapped);

          if (diff < minAngleDiff) {
            minAngleDiff = diff;
            targetIndex = i;
          }
        }

        if (targetIndex !== currentIndex && targetIndex >= 0) {
           const newBeads = [...beads];
           const [moved] = newBeads.splice(currentIndex, 1);
           newBeads.splice(targetIndex, 0, moved);
           setBeads(newBeads);
        }
      }
    }
  }, [radius, beads, beadPositions, setBeads]);

  const lastBead = beads.length > 0 ? beads[beads.length - 1] : null;
  const materialColorMap: Record<string, string> = {
    'white_crystal': '#9ca3af',
    'amethyst': '#8b5cf6',
    'citrine': '#f59e0b',
    'rose_quartz': '#f472b6',
    'smoky_quartz': '#78716c',
  };
  const logoColor = lastBead ? (materialColorMap[lastBead.materialId] || '#9ca3af') : '#d1d5db';

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full min-h-[340px] items-center justify-center sm:min-h-[360px] lg:min-h-[480px]"
      style={{ touchAction: 'none' }}
    >
      {/* Seravian Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <h1
          className="text-xl sm:text-2xl font-serif font-bold tracking-widest select-none opacity-90 transition-all duration-500"
          style={{ color: logoColor }}
        >
          seravian
        </h1>
      </div>

      {/* Connection circle/ring */}
      {beads.length > 0 && (
        <div
          className="absolute rounded-full border-2 border-gray-300 pointer-events-none"
          style={{
            width: radius * 2,
            height: radius * 2,
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%)`,
          }}
        />
      )}

      {/* Rotating container - handles rotation cleanly */}
      <div
        className="absolute inset-0 flex items-center justify-center z-20"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <AnimatePresence>
          {beads.map((bead: any, index: number) => {
            const pos = beadPositions[index];
            if (!pos) return null;

            // Get material type for this bead
            const material = beadMaterials.find((m: any) => m.id === bead.materialId);
            const materialType = material?.material_type || 'round';

            return (
              <DraggableBead
                key={bead.uid}
                bead={bead}
                pos={pos}
                index={index}
                radius={radius}
                rotation={rotation}
                onDragEnd={handleDragEnd}
                getBeadPosition={getBeadPosition}
                materialType={materialType}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BeadPreviewCircle;
