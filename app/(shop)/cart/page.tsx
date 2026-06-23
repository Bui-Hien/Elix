'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck, ArrowLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useCart } from '@/hooks/use-cart' // Use API hook
import { formatPrice, calculateShippingFee, SHIPPING_CONFIG } from '@/lib/data'
import { getImageUrl } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: number; isCustom: boolean } | null>(null)
  // Using server-side cart hook
  const { cart, isLoading, removeItem, removeCustomItem, updateQuantity, clearCart } = useCart()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize all items as selected when cart loads
  useEffect(() => {
    if (cart?.items) {
      const allItemIds = cart.items
        .filter(item => {
          const isCustom = item.isCustomProduct
          const product = isCustom ? item.customProduct : item.product
          return product && product.id // Only include items with valid product and id
        })
        .map(item => {
          const isCustom = item.isCustomProduct
          const product = isCustom ? item.customProduct : item.product
          return `${isCustom ? 'custom' : 'regular'}-${product!.id}`
        })
      setSelectedItems(new Set(allItemIds))
    }
  }, [cart?.items])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allItemIds = cart?.items
        .filter(item => {
          const isCustom = item.isCustomProduct
          const product = isCustom ? item.customProduct : item.product
          return product && product.id
        })
        .map(item => {
          const isCustom = item.isCustomProduct
          const product = isCustom ? item.customProduct : item.product
          return `${isCustom ? 'custom' : 'regular'}-${product!.id}`
        }) || []
      setSelectedItems(new Set(allItemIds))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(itemId)
    } else {
      newSelected.delete(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleRemoveSelected = () => {
    if (selectedItems.size === 0) {
      toast.error('Vui lòng chọn sản phẩm để xóa')
      return
    }

    setDeleteDialogOpen(true)
  }

  const confirmRemoveSelected = () => {
    selectedItems.forEach(itemId => {
      const [type, id] = itemId.split('-')
      const productId = parseInt(id)
      if (type === 'custom') {
        removeCustomItem(productId)
      } else {
        removeItem(productId)
      }
    })
    setSelectedItems(new Set())
    setDeleteDialogOpen(false)
    toast.success('Đã xóa các sản phẩm đã chọn')
  }

  const handleRemoveItem = (productId: number, isCustom: boolean) => {
    setItemToDelete({ id: productId, isCustom })
  }

  const confirmRemoveItem = () => {
    if (itemToDelete) {
      if (itemToDelete.isCustom) {
        removeCustomItem(itemToDelete.id)
      } else {
        removeItem(itemToDelete.id)
      }
      toast.success('Đã xóa sản phẩm')
      setItemToDelete(null)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-96 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const items = cart?.items || []

  // Calculate totals for selected items only
  const selectedSubtotal = items.reduce((sum, item) => {
    const isCustom = item.isCustomProduct
    const product = isCustom ? item.customProduct : item.product
    if (!product) return sum

    const itemId = `${isCustom ? 'custom' : 'regular'}-${product.id}`
    if (selectedItems.has(itemId)) {
      const price = isCustom ? product.totalPrice : product.price
      return sum + (price * item.quantity)
    }
    return sum
  }, 0)

  const subtotal = selectedSubtotal
  const shippingFee = calculateShippingFee(subtotal)
  const total = subtotal + shippingFee

  const allSelected = items.length > 0 && selectedItems.size === items.length
  const someSelected = selectedItems.size > 0 && selectedItems.size < items.length

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-500 mb-6">
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <Button asChild className="bg-gray-900 hover:bg-gray-800 rounded-xl h-11 px-6">
              <Link href="/products">
                Tiếp tục mua sắm
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng</h1>
            <p className="text-gray-500">
              {cart?.totalQuantity || 0} sản phẩm
              {selectedItems.size > 0 && selectedItems.size < items.length && (
                <span className="text-violet-600 ml-2">
                  ({selectedItems.size} đã chọn)
                </span>
              )}
            </p>
          </div>
          <Button variant="ghost" asChild className="text-gray-500">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tiếp tục mua sắm
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer select-none"
                >
                  Chọn tất cả ({items.length})
                </label>
              </div>

              {selectedItems.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleRemoveSelected}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Xóa đã chọn ({selectedItems.size})
                </Button>
              )}
            </div>

            {cart?.items.map((item) => {
              const isCustom = item.isCustomProduct;
              const product = isCustom ? item.customProduct : item.product;

              if (!product) return null;

              const itemId = `${isCustom ? 'custom' : 'regular'}-${product.id}`;
              const isSelected = selectedItems.has(itemId);

              return (
                <div
                  key={itemId}
                  className={`bg-white rounded-2xl border p-4 md:p-6 transition-all ${isSelected
                    ? 'border-violet-300 ring-2 ring-violet-100'
                    : 'border-gray-100'
                    }`}
                >
                  {isCustom && (
                    <div className="mb-2">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center w-fit px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          ✨ Custom Design
                        </span>
                        <p className="text-[11px] font-medium text-amber-600 italic">
                          * Sản phẩm customize vui lòng thanh toán luôn
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex items-start pt-1">
                      <Checkbox
                        id={itemId}
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectItem(itemId, checked as boolean)}
                        className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                      />
                    </div>

                    {/* Image */}
                    {isCustom ? (
                      <div
                        className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-xl overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-violet-300 transition-all"
                        onClick={() => product.previewImageUrl && setZoomedImage(getImageUrl(product.previewImageUrl))}
                      >
                        {product.previewImageUrl ? (
                          <Image
                            src={getImageUrl(product.previewImageUrl)}
                            alt={product.name}
                            fill
                            className="object-contain"
                            sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                            priority
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-100 to-pink-100 text-purple-400 text-2xl">
                            ✨
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-xl overflow-hidden bg-gray-100 shrink-0 cursor-pointer hover:ring-2 hover:ring-violet-300 transition-all"
                        onClick={() => setZoomedImage(getImageUrl(product.imageUrl))}
                      >
                        <Image
                          src={getImageUrl(product.imageUrl)}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 144px, 176px"
                        />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {isCustom ? (
                            <div>
                              <h3 className="font-medium text-gray-900 line-clamp-2">
                                {product.name}
                              </h3>
                              {product.description && (
                                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                                  {product.description}
                                </p>
                              )}
                              {product.stones && product.stones.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {product.stones.slice(0, 3).map((stone: any, idx: number) => (
                                    <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                                      {stone.stoneName} x{stone.quantity}
                                    </span>
                                  ))}
                                  {product.stones.length > 3 && (
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                                      +{product.stones.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <Link
                                href={`/products/${product.id}`}
                                className="font-medium text-gray-900 hover:text-violet-600 transition-colors line-clamp-2"
                              >
                                {product.name}
                              </Link>
                              {product.categoryName && (
                                <p className="text-sm text-gray-500 mt-0.5">
                                  {product.categoryName}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-500 shrink-0"
                          onClick={() => handleRemoveItem(product.id as number, isCustom)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        {/* Quantity */}
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none rounded-l-lg"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(product.id as number, item.quantity - 1)
                              }
                            }}
                            disabled={isCustom || item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none rounded-r-lg"
                            onClick={() => {
                              updateQuantity(product.id as number, item.quantity + 1)
                            }}
                            disabled={isCustom}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatPrice((isCustom ? product.totalPrice : product.price) * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-gray-500">
                              {formatPrice(isCustom ? product.totalPrice : product.price)} x {item.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>

              {/* Selected items info */}
              {selectedItems.size > 0 && (
                <div className="mb-4 p-3 bg-violet-50 rounded-xl">
                  <p className="text-sm text-violet-700">
                    <span className="font-medium">{selectedItems.size}</span> sản phẩm đã chọn
                  </p>
                </div>
              )}

              {/* Pricing */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    Phí vận chuyển
                  </span>
                  <span className="font-medium">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600">Miễn phí</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Total */}
              <div className="flex justify-between items-baseline mb-4">
                <span className="font-medium text-gray-900">Tổng cộng</span>
                <span className="text-2xl font-bold text-gray-900">{formatPrice(total)}</span>
              </div>

              {/* Free shipping notice */}
              {subtotal > 0 && subtotal < SHIPPING_CONFIG.freeThreshold && (
                <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3 mb-4">
                  Mua thêm <span className="font-medium text-violet-600">{formatPrice(SHIPPING_CONFIG.freeThreshold - subtotal)}</span> để được miễn phí vận chuyển
                </div>
              )}

              {/* Checkout */}
              <Button
                disabled={selectedItems.size === 0}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  if (selectedItems.size > 0) {
                    // Save selected product IDs to localStorage
                    const selectedProductIds = Array.from(selectedItems).map(itemId => {
                      const [type, id] = itemId.split('-')
                      return { type, id: parseInt(id) }
                    })

                    console.log('=== CART CHECKOUT DEBUG ===')
                    console.log('Selected items:', Array.from(selectedItems))
                    console.log('Selected product IDs to save:', selectedProductIds)
                    console.log('=== END DEBUG ===')

                    localStorage.setItem('selectedCheckoutItems', JSON.stringify(selectedProductIds))
                    window.location.href = '/checkout'
                  }
                }}
              >
                {selectedItems.size > 0 ? (
                  <>
                    Thanh toán ({selectedItems.size})
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <span>
                    Chọn sản phẩm để thanh toán
                  </span>
                )}
              </Button>

              {selectedItems.size === 0 && (
                <p className="text-xs text-center text-gray-400 mt-2">
                  Vui lòng chọn ít nhất 1 sản phẩm
                </p>
              )}

              {/* Trust */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
                <span>Thanh toán an toàn</span>
                <span>•</span>
                <span>Bảo mật SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setZoomedImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setZoomedImage(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
            <Image
              src={zoomedImage}
              alt="Zoomed product"
              fill
              className="object-contain"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />
          </div>
          <p className="absolute bottom-4 text-white/60 text-sm">
            Click để đóng
          </p>
        </div>
      )}

      {/* Delete Multiple Items Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {selectedItems.size} sản phẩm đã chọn? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveSelected}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Single Item Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveItem}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
