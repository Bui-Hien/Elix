'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/product-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Product } from '@/types'
import { cn } from '@/lib/utils'

interface ProductsByElementSectionProps {
  allProducts: Product[]
  loading?: boolean
}

const ELEMENTS = [
  { 
    value: 'Kim', 
    label: 'KIM', 
    subtitle: 'Kim loại',
    imagePath: '/sptheomenh/Kim.png', 
    color: 'text-gray-800', 
    iconTint: '#1f2937',
    bgColor: 'bg-[#E0E4E8]',
    activeBg: 'bg-[#C5CAD0]',
    hoverBg: 'hover:bg-[#C5CAD0]',
    borderColor: 'border-[#C5CAD0]',
  },
  { 
    value: 'Moc', 
    label: 'MỘC', 
    subtitle: 'Gỗ',
    imagePath: '/sptheomenh/Mộc.png', 
    color: 'text-green-800', 
    iconTint: '#166534',
    bgColor: 'bg-[#D6F1A9]',
    activeBg: 'bg-[#BDE88A]',
    hoverBg: 'hover:bg-[#BDE88A]',
    borderColor: 'border-[#BDE88A]',
  },
  { 
    value: 'Thuy', 
    label: 'THỦY', 
    subtitle: 'Nước',
    imagePath: '/sptheomenh/Thủy.png', 
    color: 'text-blue-800', 
    iconTint: '#1e40af',
    bgColor: 'bg-[#CBEAFF]',
    activeBg: 'bg-[#A8DBFF]',
    hoverBg: 'hover:bg-[#A8DBFF]',
    borderColor: 'border-[#A8DBFF]',
  },
  { 
    value: 'Hoa', 
    label: 'HỎA', 
    subtitle: 'Lửa',
    imagePath: '/sptheomenh/Hỏa.png', 
    color: 'text-[#D00046]', 
    iconTint: '#D00046',
    bgColor: 'bg-[#FFDBE7]',
    activeBg: 'bg-[#FF8FB6]',
    hoverBg: 'hover:bg-[#FF8FB6]',
    borderColor: 'border-[#FF8FB6]',
  },
  { 
    value: 'Tho', 
    label: 'THỔ', 
    subtitle: 'Đất',
    imagePath: '/sptheomenh/Thổ.png', 
    color: 'text-amber-800', 
    iconTint: '#92400e',
    bgColor: 'bg-[#FEE7B1]',
    activeBg: 'bg-[#FDD88A]',
    hoverBg: 'hover:bg-[#FDD88A]',
    borderColor: 'border-[#FDD88A]',
  },
]

const ITEMS_PER_PAGE = 5

export function ProductsByElementSection({ allProducts, loading }: ProductsByElementSectionProps) {
  const [selectedElement, setSelectedElement] = useState<string>('Kim')
  const [currentPage, setCurrentPage] = useState(0)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  // Filter products based on selected element
  useEffect(() => {
    const filtered = allProducts.filter(p => 
      p.element && p.element.split(', ').some(e => e.trim() === selectedElement)
    )
    setFilteredProducts(filtered)
    setCurrentPage(0) // Reset to first page when filter changes
  }, [selectedElement, allProducts])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const startIndex = currentPage * ITEMS_PER_PAGE
  const visibleProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
  }

  const selectedElementData = ELEMENTS.find(e => e.value === selectedElement)

  return (
    <section className="py-6 md:py-8 bg-transparent overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header - Centered */}
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-medium text-[#7A5046] relative inline-block">
            SẢN PHẨM THEO MỆNH
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-px bg-[#7A5046] rounded-full" />
          </h2>
        </div>

        {/* Element Selector - Pill Tabs */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
          {ELEMENTS.map((element) => {
            const IsActive = selectedElement === element.value
            return (
              <button
                key={element.value}
                onClick={() => setSelectedElement(element.value)}
                className={cn(
                  "group relative flex items-center justify-between min-w-[200px] px-1 py-0.5 rounded-full border-2 transition-all duration-300 shadow-sm",
                  element.bgColor, // Always show the element color
                  IsActive 
                    ? cn(element.activeBg, element.borderColor, "scale-105 shadow-md z-10") 
                    : cn("border-transparent opacity-70 hover:opacity-100 hover:border-gray-200", element.hoverBg)
                )}
              >
                <div
                  className="w-5 h-5 shrink-0"
                  style={{
                    backgroundColor: element.iconTint,
                    maskImage: `url(${element.imagePath})`,
                    WebkitMaskImage: `url(${element.imagePath})`,
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                  }}
                />
                
                <span className={cn(
                  "font-bold tracking-[0.15em] text-sm md:text-base mx-5",
                  element.color
                )}>
                  {element.label}
                </span>

                <div
                  className="w-5 h-5 shrink-0"
                  style={{
                    backgroundColor: element.iconTint,
                    maskImage: `url(${element.imagePath})`,
                    WebkitMaskImage: `url(${element.imagePath})`,
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                  }}
                />
              </button>
            )
          })}
        </div>

        {/* Products Carousel */}
        <div className="relative">
          {loading ? (
            // Loading Skeletons
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="aspect-[4/5] bg-white/50 rounded-2xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-white/50 rounded w-1/2" />
                    <div className="h-4 bg-white/50 rounded w-3/4" />
                    <div className="h-6 bg-white/50 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Navigation Arrows */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevious}
                    disabled={currentPage === 0}
                    className="h-10 w-10 rounded-full border-2 border-[#DBB2A9] disabled:opacity-30 hover:bg-white/50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        className={cn(
                          "h-2 rounded-full transition-all",
                          index === currentPage 
                            ? "w-8 bg-[#C37F70]" 
                            : "w-2 bg-[#DBB2A9] hover:bg-[#9C665A]"
                        )}
                        aria-label={`Trang ${index + 1}`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentPage === totalPages - 1}
                    className="h-10 w-10 rounded-full border-2 border-[#DBB2A9] disabled:opacity-30 hover:bg-white/50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
