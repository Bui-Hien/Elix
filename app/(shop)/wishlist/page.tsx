'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWishlist } from '@/hooks/use-wishlist'
import { toast } from 'sonner'
import { ProductCard } from '@/components/product/product-card'
import { productsApi } from '@/lib/api/products'
import type { Product } from '@/types'

export default function WishlistPage() {
    const { wishlist, isLoading, clearWishlist } = useWishlist()
    const [products, setProducts] = useState<Product[]>([])
    const [isLoadingProducts, setIsLoadingProducts] = useState(false)

    // Fetch full product data for each wishlist item
    useEffect(() => {
        if (wishlist.length === 0) {
            setProducts([])
            return
        }

        const fetchProducts = async () => {
            setIsLoadingProducts(true)
            try {
                const productPromises = wishlist.map(item =>
                    productsApi.getById(item.productId).catch(() => null)
                )
                const results = await Promise.all(productPromises)
                setProducts(results.filter((p): p is Product => p !== null))
            } catch (error) {
                console.error('Failed to fetch product details:', error)
            } finally {
                setIsLoadingProducts(false)
            }
        }

        fetchProducts()
    }, [wishlist])

    const handleClear = async () => {
        try {
            await clearWishlist()
            toast.success('Đã xóa toàn bộ danh sách yêu thích')
        } catch (error) {
            toast.error('Có lỗi xảy ra')
        }
    }

    if (isLoading || isLoadingProducts) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Roboto, sans-serif', color: '#4E332D' }}>Danh sách yêu thích</h1>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-3">
                            <div className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
                            <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                            <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (wishlist.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <Heart size={40} />
                    </div>
                </div>
                <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Roboto, sans-serif', color: '#4E332D' }}>Danh sách yêu thích trống</h1>
                <p className="text-gray-500 mb-8">Bạn chưa có sản phẩm nào trong danh sách yêu thích.</p>
                <Link href="/products">
                    <Button className="bg-gray-900 text-white hover:bg-gray-800">
                        Khám phá sản phẩm
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold" style={{ fontFamily: 'Roboto, sans-serif', color: '#4E332D' }}>Danh sách yêu thích ({wishlist.length})</h1>
                <Button variant="outline" onClick={handleClear} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    Xóa tất cả
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}
