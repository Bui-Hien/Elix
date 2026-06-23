'use client'

import React from "react"

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Heart, Star, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice } from '@/lib/data'
import { getImageUrl } from '@/lib/utils'
import type { Product } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useCart } from '@/hooks/use-cart'

interface ProductCardProps {
  product: Product
  className?: string
}

import { useWishlist } from '@/hooks/use-wishlist'
import { useAppSelector } from '@/lib/redux/hooks'
import { useRouter } from 'next/navigation'

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { wishlist, toggleWishlist } = useWishlist()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const { addToCart } = useCart()

  const isInWishlist = wishlist.some(item => String(item.productId) === String(product.id))

  /* import { useCart } from '@/hooks/use-cart' // Ensure this import is added at top */

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng')
      router.push('/login')
      return
    }

    try {
      await addToCart(product.id as number, 1) /* Assuming useCart provides addToCart */
      toast.success('Đã thêm vào giỏ hàng', {
        description: product.name,
      })
    } catch (error) {
      toast.error('Không thể thêm vào giỏ')
    }
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để sử dụng tính năng này')
      router.push('/login')
      return
    }

    try {
      const id = parseInt(product.id.toString())
      if (isNaN(id)) {
        toast.error('Invalid Product ID')
        return
      }

      // Speculatively toggle UI or wait for revalidation
      await toggleWishlist(id)

      toast.success(isInWishlist ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích')
    } catch (err) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const discount = product.discountPercent 
    ? product.discountPercent 
    : (product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0)

  return (
    <div className={cn('group h-full', className)}>
      <Link href={`/products/${product.slug || product.id}`} className="block h-full">
        {/* Glass card container */}
        <div className="relative h-full flex flex-col rounded-2xl bg-white/70 backdrop-blur-md border border-black/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:bg-white/90 transition-all duration-300">
          {/* Image - full bleed, sat vien */}
          <div className="relative aspect-square w-full rounded-t-2xl overflow-hidden">
            <Image
              src={getImageUrl((product.images && product.images.length > 0) ? product.images[0] : product.imageUrl)}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />

            {/* Sale Badge - gắn sát góc trên trái */}
            {discount > 0 && (
              <span 
                className="absolute top-0 left-0 z-10 inline-flex items-center px-4 py-2 text-white text-sm shadow-sm"
                style={{ 
                  backgroundColor: '#C37F70', 
                  borderTopLeftRadius: '1rem',
                  borderBottomRightRadius: '1rem',
                  borderTopRightRadius: 0,
                  borderBottomLeftRadius: 0,
                }}
              >
                Sale {discount}%
              </span>
            )}

            {/* Other Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5" style={{ marginTop: discount > 0 ? '2rem' : 0 }}>
              {product.isNew && (
                <Badge className="bg-violet-500 hover:bg-violet-500 text-white text-xs px-2 py-0.5 rounded-md border-0 shadow-sm">
                  Mới
                </Badge>
              )}
            </div>

            {/* Quick actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-md border-0"
                onClick={handleToggleWishlist}
              >
                <Heart className={cn("h-4 w-4 transition-colors", isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600")} />
              </Button>
            </div>

            {/* Add to cart button - overly */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/40 to-transparent lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 lg:translate-y-2 lg:group-hover:translate-y-0">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 rounded-lg h-9 text-sm font-medium shadow-lg"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Thêm vào giỏ
              </Button>
            </div>
          </div>

          {/* Content - fixed height de cards dong nhat */}
          <div className="flex flex-col flex-1 p-4">
            {/* Category */}
            {(product.category?.name || product.categoryName) && (
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">
                {product.category?.name || product.categoryName}
              </p>
            )}

            {/* Name - gioi han 2 dong */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-violet-600 transition-colors text-base leading-tight min-h-[2.5rem]">
              {product.name}
            </h3>
            {/* Elements */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1 min-h-[1.5rem]">
              {product.element && (
                <div className="flex flex-wrap gap-1">
                  {product.element.split(', ').map((e) => {
                    const ELEMENT_DISPLAY: Record<string, string> = {
                      'Moc': 'Mộc', 'moc': 'Mộc', 'MOC': 'MỘC',
                      'Thuy': 'Thủy', 'thuy': 'Thủy', 'THUY': 'THỦY',
                      'Hoa': 'Hỏa', 'hoa': 'Hỏa', 'HOA': 'HỎA',
                      'Tho': 'Thổ', 'tho': 'Thổ', 'THO': 'THỔ',
                      'Kim': 'Kim', 'kim': 'Kim', 'KIM': 'KIM',
                    }
                    const displayName = ELEMENT_DISPLAY[e.trim()] || e
                    return (
                    <span key={e} className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 font-bold uppercase">
                      {displayName}
                    </span>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mt-auto pt-2">
              <span className="text-base text-gray-900" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-400 line-through" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 100 }}>
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
