'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/product-card'
import type { Product } from '@/types'
import { cn } from '@/lib/utils'

interface ProductsSectionProps {
  title: string
  subtitle?: string
  description?: string
  products: Product[]
  viewAllLink?: string
  viewAllText?: string
  className?: string
  variant?: 'default' | 'featured'
  loading?: boolean
}

export function ProductsSection({
  title,
  subtitle,
  description,
  products,
  viewAllLink = '/products',
  viewAllText = 'Xem tất cả',
  className,
  variant = 'default',
  loading = false
}: ProductsSectionProps) {
  return (
    <section className={cn(
      'py-6 md:py-8 bg-transparent overflow-hidden',
      className
    )}>
      <div className="container mx-auto px-4">
        {/* Header - Centered */}
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-medium text-[#7A5046] uppercase tracking-wider relative inline-block">
            {title}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-px bg-[#7A5046] rounded-full" />
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            // Loading Skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="aspect-[4/5] bg-[#E7CCC6] rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-[#E7CCC6] rounded w-1/2" />
                  <div className="h-4 bg-[#E7CCC6] rounded w-3/4" />
                  <div className="h-6 bg-[#E7CCC6] rounded w-1/3" />
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-[#9C665A]">
              Không có sản phẩm nào
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
