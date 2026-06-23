'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { getImageUrl } from '@/lib/utils'

interface EllipseArcConfig {
  ellipseCenterX: number
  ellipseCenterY: number
  ellipseRadiusX: number
  ellipseRadiusY: number
  arcStartAngle: number
  arcEndAngle: number
}

interface Props {
  imageUrl: string
  config: EllipseArcConfig
  onChange: (config: EllipseArcConfig) => void
}

type DragMode = 'none' | 'center' | 'radiusX' | 'radiusY' | 'startAngle' | 'endAngle'

export default function EllipseArcEditor({ imageUrl, config, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [dragMode, setDragMode] = useState<DragMode>('none')
  const [hoveredHandle, setHoveredHandle] = useState<DragMode>('none')

  // Load image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setImage(img)
    img.src = getImageUrl(imageUrl)
  }, [imageUrl])

  // Draw canvas
  useEffect(() => {
    if (!canvasRef.current || !image) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const maxWidth = 800
    const maxHeight = 600
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1)
    canvas.width = image.width * scale
    canvas.height = image.height * scale

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    // Calculate ellipse position in canvas coordinates
    const centerX = config.ellipseCenterX * canvas.width
    const centerY = config.ellipseCenterY * canvas.height
    const radiusX = config.ellipseRadiusX * canvas.width
    const radiusY = config.ellipseRadiusY * canvas.height

    // Draw ellipse
    ctx.strokeStyle = '#9333ea'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw arc section
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, config.arcStartAngle, config.arcEndAngle)
    ctx.stroke()

    // Draw sample beads on arc
    const numBeads = 5
    for (let i = 0; i < numBeads; i++) {
      const angle = config.arcStartAngle + (i / (numBeads - 1)) * (config.arcEndAngle - config.arcStartAngle)
      const x = centerX + Math.cos(angle) * radiusX
      const y = centerY + Math.sin(angle) * radiusY
      
      ctx.fillStyle = '#10b981'
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    // Draw handles
    const handles = [
      { type: 'center', x: centerX, y: centerY, color: '#3b82f6', label: 'C' },
      { type: 'radiusX', x: centerX + radiusX, y: centerY, color: '#f59e0b', label: 'X' },
      { type: 'radiusY', x: centerX, y: centerY + radiusY, color: '#f59e0b', label: 'Y' },
      { 
        type: 'startAngle', 
        x: centerX + Math.cos(config.arcStartAngle) * radiusX, 
        y: centerY + Math.sin(config.arcStartAngle) * radiusY, 
        color: '#ef4444', 
        label: 'S' 
      },
      { 
        type: 'endAngle', 
        x: centerX + Math.cos(config.arcEndAngle) * radiusX, 
        y: centerY + Math.sin(config.arcEndAngle) * radiusY, 
        color: '#8b5cf6', 
        label: 'E' 
      },
    ]

    handles.forEach(handle => {
      const isHovered = hoveredHandle === handle.type
      const size = isHovered ? 12 : 10
      
      ctx.fillStyle = handle.color
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(handle.x, handle.y, size, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Draw label
      ctx.fillStyle = 'white'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(handle.label, handle.x, handle.y)
    })

  }, [image, config, hoveredHandle])

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / rect.width * canvas.width,
      y: (e.clientY - rect.top) / rect.height * canvas.height,
    }
  }

  const getHandleAtPos = (x: number, y: number): DragMode => {
    if (!canvasRef.current) return 'none'
    
    const canvas = canvasRef.current
    const centerX = config.ellipseCenterX * canvas.width
    const centerY = config.ellipseCenterY * canvas.height
    const radiusX = config.ellipseRadiusX * canvas.width
    const radiusY = config.ellipseRadiusY * canvas.height

    const handles = [
      { type: 'center' as DragMode, x: centerX, y: centerY },
      { type: 'radiusX' as DragMode, x: centerX + radiusX, y: centerY },
      { type: 'radiusY' as DragMode, x: centerX, y: centerY + radiusY },
      { 
        type: 'startAngle' as DragMode, 
        x: centerX + Math.cos(config.arcStartAngle) * radiusX, 
        y: centerY + Math.sin(config.arcStartAngle) * radiusY 
      },
      { 
        type: 'endAngle' as DragMode, 
        x: centerX + Math.cos(config.arcEndAngle) * radiusX, 
        y: centerY + Math.sin(config.arcEndAngle) * radiusY 
      },
    ]

    for (const handle of handles) {
      const dist = Math.sqrt((x - handle.x) ** 2 + (y - handle.y) ** 2)
      if (dist < 15) return handle.type
    }

    return 'none'
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e)
    const handle = getHandleAtPos(pos.x, pos.y)
    setDragMode(handle)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const pos = getMousePos(e)

    if (dragMode === 'none') {
      // Update hover state
      const handle = getHandleAtPos(pos.x, pos.y)
      setHoveredHandle(handle)
      canvas.style.cursor = handle !== 'none' ? 'pointer' : 'default'
      return
    }

    // Handle dragging
    const relX = pos.x / canvas.width
    const relY = pos.y / canvas.height

    if (dragMode === 'center') {
      onChange({ ...config, ellipseCenterX: relX, ellipseCenterY: relY })
    } else if (dragMode === 'radiusX') {
      const newRadiusX = Math.abs(relX - config.ellipseCenterX)
      onChange({ ...config, ellipseRadiusX: newRadiusX })
    } else if (dragMode === 'radiusY') {
      const newRadiusY = Math.abs(relY - config.ellipseCenterY)
      onChange({ ...config, ellipseRadiusY: newRadiusY })
    } else if (dragMode === 'startAngle' || dragMode === 'endAngle') {
      const centerX = config.ellipseCenterX * canvas.width
      const centerY = config.ellipseCenterY * canvas.height
      const angle = Math.atan2(pos.y - centerY, pos.x - centerX)
      
      if (dragMode === 'startAngle') {
        onChange({ ...config, arcStartAngle: angle })
      } else {
        onChange({ ...config, arcEndAngle: angle })
      }
    }
  }

  const handleMouseUp = () => {
    setDragMode('none')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Vẽ ellipse và chọn vùng đặt đá</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange({
              ellipseCenterX: 0.5,
              ellipseCenterY: 0.5,
              ellipseRadiusX: 0.35,
              ellipseRadiusY: 0.25,
              arcStartAngle: 3.67,
              arcEndAngle: 5.0,
            })}
          >
            Đặt lại mặc định
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-gray-50">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="max-w-full h-auto"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span>Tâm ellipse (C) - Kéo để di chuyển</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500" />
            <span>Bán kính X/Y - Kéo để thay đổi kích thước</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span>Điểm bắt đầu (S) - Kéo để xoay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500" />
            <span>Điểm kết thúc (E) - Kéo để xoay</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 Kéo các điểm điều khiển để điều chỉnh vị trí ellipse và vùng đặt đá</p>
        <p>🟢 5 chấm xanh lá hiển thị vị trí mẫu của các viên đá</p>
      </div>
    </div>
  )
}
