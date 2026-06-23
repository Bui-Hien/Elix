'use client'

import { useRef, useEffect, useState } from 'react'
import { getImageUrl } from '@/lib/utils'

interface SingleStoneEditorProps {
  imageUrl: string
  singleStoneX: number
  singleStoneY: number
  onChange: (config: { singleStoneX: number; singleStoneY: number }) => void
}

export default function SingleStoneEditor({
  imageUrl,
  singleStoneX,
  singleStoneY,
  onChange,
}: SingleStoneEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement | null>(null)

  // Load image
  useEffect(() => {
    if (!imageUrl) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
    }
    img.src = getImageUrl(imageUrl)
  }, [imageUrl])

  // Draw canvas
  useEffect(() => {
    if (!imageLoaded || !imageRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    canvas.width = 600
    canvas.height = 600

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate aspect ratio to fit image in canvas (contain mode)
    const imgAspect = img.width / img.height
    const canvasAspect = canvas.width / canvas.height
    
    let drawWidth, drawHeight, offsetX, offsetY
    
    if (imgAspect > canvasAspect) {
      // Image is wider - fit to width
      drawWidth = canvas.width
      drawHeight = canvas.width / imgAspect
      offsetX = 0
      offsetY = (canvas.height - drawHeight) / 2
    } else {
      // Image is taller - fit to height
      drawHeight = canvas.height
      drawWidth = canvas.height * imgAspect
      offsetX = (canvas.width - drawWidth) / 2
      offsetY = 0
    }

    // Draw image with proper aspect ratio
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

    // Draw stone position marker (relative to full canvas, not just image)
    const x = singleStoneX * canvas.width
    const y = singleStoneY * canvas.height

    // Draw crosshair
    ctx.strokeStyle = '#ff0000'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x - 20, y)
    ctx.lineTo(x + 20, y)
    ctx.moveTo(x, y - 20)
    ctx.lineTo(x, y + 20)
    ctx.stroke()

    // Draw circle
    ctx.beginPath()
    ctx.arc(x, y, 30, 0, Math.PI * 2)
    ctx.strokeStyle = '#ff0000'
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw label
    ctx.fillStyle = '#ff0000'
    ctx.font = 'bold 16px Arial'
    ctx.fillText('STONE', x + 35, y + 5)

  }, [imageLoaded, singleStoneX, singleStoneY])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    onChange({
      singleStoneX: Math.max(0, Math.min(1, x)),
      singleStoneY: Math.max(0, Math.min(1, y)),
    })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    handleCanvasClick(e)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    handleCanvasClick(e)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">
        <div className="text-center p-6">
          <p className="text-gray-500 mb-2">Vui lòng chọn ảnh vòng trước</p>
          <p className="text-xs text-gray-400">Lưu ý: Nên dùng ảnh vuông (1:1) để vị trí đá chính xác nhất</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-semibold mb-2">Hướng dẫn:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click vào vị trí muốn đặt đá trên ảnh vòng</li>
          <li>• Hoặc kéo thả để di chuyển vị trí</li>
          <li>• Dấu chữ thập đỏ là vị trí đá sẽ hiển thị</li>
        </ul>
      </div>

      <canvas
        ref={canvasRef}
        className="border-2 border-gray-300 rounded-lg cursor-crosshair w-full max-w-[600px]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-semibold">X Position:</span> {(singleStoneX * 100).toFixed(1)}%
        </div>
        <div>
          <span className="font-semibold">Y Position:</span> {(singleStoneY * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  )
}
