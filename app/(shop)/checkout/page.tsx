'use client'

import React, { useState, useEffect, useRef } from "react"
import { QRCodeCanvas } from 'qrcode.react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, Truck, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useCart } from '@/hooks/use-cart'
import { Loader2 } from 'lucide-react'
import { formatPrice, calculateShippingFee } from '@/lib/data'
import { getImageUrl, cn } from '@/lib/utils'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'
import type { OrderPaymentResponse } from '@/types'

export default function CheckoutPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('payos')

  // Server-side Cart Hook
  const { cart, isLoading: isCartLoading, refreshCart } = useCart()
  const allItems = cart?.items || []

  // Filter items based on selected items from cart page
  const [items, setItems] = useState<any[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [isFilteringItems, setIsFilteringItems] = useState(true) // Track filtering state

  useEffect(() => {
    if (!isCartLoading && allItems.length > 0) {
      setIsFilteringItems(true) // Start filtering

      // Get selected items from localStorage
      const selectedItemsStr = localStorage.getItem('selectedCheckoutItems')

      console.log('=== CHECKOUT DEBUG ===')
      console.log('All cart items:', allItems)
      console.log('Selected items from localStorage:', selectedItemsStr)

      if (selectedItemsStr) {
        try {
          const selectedIds = JSON.parse(selectedItemsStr) as Array<{ type: string; id: number }>

          console.log('Parsed selected IDs:', selectedIds)

          // Filter cart items to only include selected ones
          const filteredItems = allItems.filter(item => {
            const isCustom = item.isCustomProduct
            const product = isCustom ? item.customProduct : item.product
            if (!product) {
              console.log('Item has no product, skipping')
              return false
            }

            // Ensure both IDs are numbers for comparison
            const productId = Number(product.id)
            const itemType = isCustom ? 'custom' : 'regular'

            const match = selectedIds.some(selected => {
              const typeMatch = selected.type === itemType
              const idMatch = Number(selected.id) === productId
              console.log(`Comparing: ${itemType}-${productId} with ${selected.type}-${selected.id} => type:${typeMatch}, id:${idMatch}`)
              return typeMatch && idMatch
            })

            console.log(`Item ${productId} (${itemType}): ${match ? '✓ MATCH' : '✗ NO MATCH'}`)

            return match
          })

          console.log('Filtered items count:', filteredItems.length)
          console.log('Filtered items:', filteredItems)

          if (filteredItems.length === 0) {
            console.warn('No items matched! Falling back to all items')
            setItems(allItems)
            setSubtotal(cart?.totalAmount || 0)
            setIsFilteringItems(false)
            return
          }

          setItems(filteredItems)

          // Calculate subtotal for selected items only
          const total = filteredItems.reduce((sum, item) => {
            const isCustom = item.isCustomProduct
            const product = isCustom ? item.customProduct : item.product
            if (!product) return sum
            const price = isCustom ? product.totalPrice : product.price
            return sum + (price * item.quantity)
          }, 0)

          console.log('Calculated subtotal:', total)

          setSubtotal(total)
        } catch (error) {
          console.error('Error parsing selected items:', error)
          // Fallback to all items if parsing fails
          setItems(allItems)
          setSubtotal(cart?.totalAmount || 0)
        }
      } else {
        console.log('No selected items in localStorage, using all items')
        // No selection, use all items
        setItems(allItems)
        setSubtotal(cart?.totalAmount || 0)
      }
      console.log('=== END DEBUG ===')

      setIsFilteringItems(false) // Filtering complete
    }
  }, [allItems, isCartLoading, cart?.totalAmount])

  // Redirect if cart empty (handled in useEffect to avoid render error)
  // Only redirect after filtering is complete
  useEffect(() => {
  }, [items.length, isCartLoading, isFilteringItems, router])

  const hasCustomProduct = items.some(item => item.isCustomProduct)

  // Force PayOS if custom product is present
  useEffect(() => {
    if (hasCustomProduct && paymentMethod !== 'payos') {
      setPaymentMethod('payos')
      toast.info('Sản phẩm customize bắt buộc thanh toán trước. Phương thức thanh toán đã được chuyển sang PayOS.')
    }
  }, [hasCustomProduct, paymentMethod])

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    district: '',
    ward: '',
    address: '',
    note: ''
  })

  // Polling for payment status - Moved up to respect Rules of Hooks
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (showPaymentModal && currentOrder?.id) {
      const checkStatus = async () => {
        try {
          const res = (await apiClient.get(`/orders/${currentOrder.id}`)) as any
          // The updated backend returns OrderDetailDto which has paymentStatus as string
          if (res.paymentStatus === 'Paid') {
            toast.success('Thanh toán thành công!')
            setShowPaymentModal(false)
            if (pollTimerRef.current) clearInterval(pollTimerRef.current)

            // Clear selected items from localStorage
            localStorage.removeItem('selectedCheckoutItems')
            // Refresh cart from server (items already removed by backend)
            refreshCart()
            router.push(`/checkout/success?orderCode=${currentOrder.id}&method=payos`)
          }
        } catch (error) {
          console.error("Error checking payment status", error)
        }
      }

      // Check immediately and then every 3 seconds
      checkStatus()
      pollTimerRef.current = setInterval(checkStatus, 3000)

      return () => {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current)
      }
    }
  }, [showPaymentModal, currentOrder, refreshCart, router])

  if (!mounted || isCartLoading || isFilteringItems) {
    return (
      <div className="container mx-auto px-4 py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Prevent rendering if empty (useEffect will redirect)
  if (items.length === 0) {
    return null
  }

  // const subtotal = getSubtotal() // Removed, using cart.totalAmount
  const shippingFee = calculateShippingFee(subtotal)
  const total = subtotal + shippingFee

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('=== CHECKOUT SUBMIT DEBUG ===')
    console.log('Form data:', formData)
    console.log('Payment method:', paymentMethod)
    console.log('Items to checkout:', items)

    if (!formData.fullName || !formData.phone || !formData.email || !formData.city || !formData.address) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng')
      return
    }

    if (items.length === 0) {
      toast.error('Không có sản phẩm nào để thanh toán')
      return
    }

    setLoading(true)

    try {
      console.log('Creating order with items:', items)

      const orderPayload = {
        customerName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`,
        note: formData.note,
        paymentMethod: paymentMethod,
        items: items.map(item => {
          const isCustom = item.isCustomProduct
          const product = isCustom ? item.customProduct : item.product

          const orderItem: any = {
            quantity: item.quantity
          }

          if (isCustom) {
            orderItem.customProductId = Number(product.id)
          } else {
            orderItem.productId = Number(product.id)
          }

          return orderItem
        })
      }

      console.log('Order payload:', JSON.stringify(orderPayload, null, 2))
      console.log('Sending POST request to /orders...')

      const response = (await apiClient.post('/orders', orderPayload)) as any

      console.log('Order response:', response)

      const { order, paymentData: payData } = response

      console.log('Order created:', order)
      console.log('Payment data:', payData)

      if (paymentMethod === 'payos') {
        if (payData?.qrCode) {
          setCurrentOrder(order)
          setPaymentData(payData)
          setShowPaymentModal(true)
          toast.info('Vui lòng quét mã QR để thanh toán')
        } else if (payData?.checkoutUrl) {
          // Fallback if no QR Code but has URL (rare with V2 if we want inline)
          setCurrentOrder(order)
          setPaymentData(payData)
          setShowPaymentModal(true)
        } else {
          console.error('No payment data received:', payData)
          toast.error('Không thể tạo thông tin thanh toán. Vui lòng thử lại.')
          setLoading(false)
          return
        }
      } else {
        toast.success('Đặt hàng thành công!')
        // Clear selected items from localStorage
        localStorage.removeItem('selectedCheckoutItems')
        refreshCart() // Refresh cart from server (items already removed by backend)
        router.push(`/checkout/success?orderCode=${order.id}&method=cod`)
      }

      console.log('=== END CHECKOUT SUBMIT ===')
    } catch (error: any) {
      console.error('=== ORDER CREATION ERROR ===')
      console.error('Error object:', error)
      console.error('Error response:', error.response)
      console.error('Error response data:', error.response?.data)
      console.error('Error message:', error.message)
      console.error('=== END ERROR ===')

      const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }


  /*
  useEffect(() => {
    if (showPaymentModal && currentOrder?.id) {
      const checkStatus = async () => {
        try {
          const res = (await apiClient.get(`/orders/${currentOrder.id}`)) as any
          // The updated backend returns OrderDetailDto which has paymentStatus as string
          if (res.paymentStatus === 'Paid') {
            toast.success('Thanh toán thành công!')
            setShowPaymentModal(false)
            if (pollTimerRef.current) clearInterval(pollTimerRef.current)

            // Clear cart ONLY after successful payment
            clearCart()
            router.push(`/checkout/success?orderCode=${currentOrder.id}&method=payos`)
          }
        } catch (error) {
          console.error("Error checking payment status", error)
        }
      }

      // Check immediately and then every 3 seconds
      checkStatus()
      pollTimerRef.current = setInterval(checkStatus, 3000)

      return () => {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current)
      }
    }
  }, [showPaymentModal, currentOrder])
    */

  return (
    <div className="pb-20">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/cart">Giỏ hàng</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Thanh toán</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            Thanh toán
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Shipping Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Thông tin giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Nguyễn Văn A"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="0901234567"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Tỉnh/Thành phố *</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="TP. Hồ Chí Minh"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">Quận/Huyện</Label>
                      <Input
                        id="district"
                        name="district"
                        placeholder="Quận 1"
                        value={formData.district}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ward">Phường/Xã</Label>
                      <Input
                        id="ward"
                        name="ward"
                        placeholder="Bến Nghé"
                        value={formData.ward}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ cụ thể *</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="123 Nguyễn Huệ, Quận 1"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Ghi chú</Label>
                    <Textarea
                      id="note"
                      name="note"
                      placeholder="Ghi chú cho người giao hàng (ví dụ: giao giờ hành chính, gọi trước khi giao...)"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Phương thức thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    <label
                      htmlFor="payos"
                      className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                    >
                      <RadioGroupItem value="payos" id="payos" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          Thanh toán qua PayOS
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Thanh toán bằng thẻ ATM, Visa, MasterCard, QR Code
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-10 h-6 bg-muted rounded flex items-center justify-center text-xs font-medium">
                          PayOS
                        </div>
                      </div>
                    </label>

                    <label
                      htmlFor="cod"
                      className={cn(
                        "flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5",
                        hasCustomProduct && "opacity-50 cursor-not-allowed bg-gray-50"
                      )}
                    >
                      <RadioGroupItem value="cod" id="cod" disabled={hasCustomProduct} />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          Thanh toán khi nhận hàng (COD)
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {hasCustomProduct 
                            ? "Không áp dụng cho đơn hàng có sản phẩm customize" 
                            : "Thanh toán trực tiếp cho người giao hàng"}
                        </p>
                      </div>
                      <Truck className="h-6 w-6 text-muted-foreground" />
                    </label>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-32">
                <CardHeader>
                  <CardTitle>Đơn hàng của bạn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => {
                      const isCustom = item.isCustomProduct
                      const product = isCustom ? item.customProduct : item.product
                      if (!product) return null

                      return (
                        <div key={`${isCustom ? 'custom' : 'regular'}-${product.id}`} className="flex gap-3">
                          <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            {isCustom ? (
                              product.previewImageUrl ? (
                                <Image
                                  src={getImageUrl(product.previewImageUrl)}
                                  alt={product.name}
                                  fill
                                  className="object-contain"
                                  sizes="64px"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-purple-400">
                                  ✨
                                </div>
                              )
                            ) : (
                              <Image
                                src={getImageUrl(product.imageUrl)}
                                alt={product.name}
                                fill
                                className="object-contain"
                                sizes="64px"
                              />
                            )}
                            {item.quantity > 1 && (
                              <span className="absolute top-0 right-0 min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center shadow-sm">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {isCustom && (
                              <span className="inline-block text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded mb-1">
                                ✨ Custom
                              </span>
                            )}
                            <p className="text-sm font-medium text-foreground line-clamp-2">
                              {product.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(isCustom ? product.totalPrice : product.price)} x {item.quantity}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phí vận chuyển</span>
                      <span className="font-medium">
                        {shippingFee === 0 ? (
                          <span className="text-emerald">Miễn phí</span>
                        ) : (
                          formatPrice(shippingFee)
                        )}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium">Tổng cộng</span>
                    <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin truncate h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Đang xử lý...
                      </span>
                    ) : (
                      <>
                        {paymentMethod === 'payos' ? 'Thanh toán ngay' : 'Đặt hàng'}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Bằng việc đặt hàng, bạn đồng ý với{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                      Điều khoản dịch vụ
                    </Link>{' '}
                    và{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Chính sách bảo mật
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}>Thanh toán qua PayOS</DialogTitle>
            <DialogDescription style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400 }}>
              Mở ứng dụng ngân hàng và quét mã QR bên dưới để thanh toán
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4 space-y-4">
            {paymentData && (
              <>
                <div className="border-4 border-white shadow-lg rounded-xl overflow-hidden">
                  <QRCodeCanvas
                    value={paymentData.qrCode || paymentData.checkoutUrl || ""}
                    size={220}
                    level={"H"}
                    includeMargin={true}
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400 }}>Số tiền cần thanh toán</p>
                  <p className="text-2xl text-primary" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}>
                    {formatPrice(paymentData.amount)}
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-md w-full text-center">
                  <p className="text-sm mb-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}>Nội dung chuyển khoản</p>
                  <p className="text-lg tracking-wide select-all text-primary" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}>
                    DH-{currentOrder?.id ? currentOrder.id.substring(0, 8).toUpperCase() : '...'}
                  </p>
                </div>
              </>
            )}
            <p className="text-xs text-center text-muted-foreground mt-4" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400 }}>
              Hệ thống sẽ tự động xác nhận sau khi bạn thanh toán thành công.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
