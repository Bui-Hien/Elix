'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Minus, Plus, Check, Truck, Shield, RefreshCcw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ProductCard } from '@/components/product/product-card'
import { useCart } from '@/hooks/use-cart'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/data'
import type { Product } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAppSelector } from '@/lib/redux/hooks'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

interface ProductDetailClientProps {
  product: Product
  relatedProducts: Product[]
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isMounted, setIsMounted] = useState(false)

  // Get all available images
  const allImages = product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls
    : (product.images && product.images.length > 0
      ? product.images
      : (product.imageUrl ? [product.imageUrl] : ["/placeholder.svg"]))

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-slide images every 5 seconds
  useEffect(() => {
    if (allImages.length <= 1) return

    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % allImages.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [allImages.length])

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev + 1) % allImages.length)
  }

  /* import { useCart } from '@/hooks/use-cart' */
  const { addToCart } = useCart()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const router = useRouter()

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để mua hàng')
      router.push('/login')
      return
    }

    try {
      await addToCart(product.id as number, quantity)
      toast.success('Đã thêm vào giỏ hàng', {
        description: `${quantity}x ${product.name}`,
        action: {
          label: 'Xem giỏ',
          onClick: () => window.location.href = '/cart'
        }
      })
    } catch {
      toast.error('Có lỗi khi thêm vào giỏ')
    }
  }

  return (
    <div className="pb-20 bg-[#faf9f7] min-h-screen pt-4">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Sản phẩm</BreadcrumbLink>
            </BreadcrumbItem>
            {product.category && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/products?category=${product.category.id}`}>
                    {product.category.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1 max-w-[200px]">
                {product.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-[35%_1fr] gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border-2 border-border">
              <Image
                src={allImages[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-contain transition-opacity duration-500"
                priority
                sizes="(max-width: 1024px) 100vw, 35vw"
              />

              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount > 0 && <Badge className="bg-destructive text-destructive-foreground">-{discount}%</Badge>}
                {product.isNew && <Badge className="bg-sapphire text-white">Mới</Badge>}
                {product.isBestSeller && <Badge className="bg-gold text-foreground">Bán chạy</Badge>}
              </div>

              {/* Navigation arrows - only show if multiple images */}
              {allImages.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  {/* Image counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium">
                    {selectedImage + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails - only show if multiple images */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all duration-300',
                      selectedImage === index
                        ? 'border-primary ring-2 ring-primary/20 scale-105'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:py-4">
            {product.category && (
              <Link href={`/products?category=${product.category.id}`} className="text-sm text-primary font-medium uppercase tracking-wider hover:underline">
                {product.category.name}
              </Link>
            )}

            <h1 className="mt-2 text-2xl md:text-3xl lg:text-4xl font-serif font-bold leading-tight" style={{ color: '#754C43' }}>
              {product.name}
            </h1>

            {/* Removed rating display */}

            <div className="flex items-baseline gap-3 mt-6">
              <span className="text-3xl md:text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && <span className="text-xl text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>}
              {discount > 0 && <Badge variant="destructive" className="text-sm">Tiết kiệm {formatPrice(product.originalPrice! - product.price)}</Badge>}
            </div>

            <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {product.tags.map((tag) => {
                  const tagSlug = tag.slug || tag.name.toLowerCase().replace(/ /g, '-')
                  return (
                    <Link key={tag.id} href={`/products?tags=${tagSlug}`} className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                      {tag.name}
                    </Link>
                  )
                })}
              </div>
            )}

            {product.purposes && product.purposes.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-cyan-500" /> Mục đích
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.purposes.map((p) => (
                    <Badge key={p.id} variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-100 rounded-full px-3 py-1 text-[10px] font-bold">
                      {p.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {product.element && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="text-gold-500">☯</span> Mệnh phù hợp
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.element.split(', ').map((e) => (
                    <Badge key={e} variant="outline" className="bg-gold/10 text-gold-700 border-gold/20 rounded-full px-3 py-1 text-[10px] font-bold">
                      {e}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(product.tags?.length || product.purposes?.length || product.element) && (
              <div className="border-t border-border/40 mt-6"></div>
            )}

            <div className="flex items-center gap-2 mt-6">
              {(product.stock || product.stockQuantity || 0) > 0 ? (
                <span className="text-sm font-medium text-muted-foreground">
                  Số lượng: <strong className="text-gray-800">{product.stock || product.stockQuantity}</strong> sản phẩm
                </span>
              ) : (
                <span className="text-sm text-destructive font-medium">Hết hàng</span>
              )}
            </div>

            <div className="mt-6 mb-2">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 text-sm text-[#C37F70] hover:text-[#9c665a] transition-colors border-b border-transparent hover:border-[#C37F70]">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full border border-current text-[10px] font-bold">!</span>
                    <span className="font-medium italic">Xem cách đo cổ tay</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md md:max-w-2xl bg-white border-0 shadow-2xl p-0 overflow-hidden rounded-2xl">
                  <div className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-[4/3] bg-gray-50">
                    <Image
                      src="/brand/cach-do-size-vong-tay_charmy.png"
                      alt="Hướng dẫn cách đo cổ tay"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 800px"
                      priority
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex items-center border rounded-lg h-9 w-fit">
                <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="h-full rounded-none rounded-l-lg hover:bg-gray-100 px-2">
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-10 text-center font-medium text-xs">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.min((product.stock || product.stockQuantity || 0), quantity + 1))} disabled={quantity >= (product.stock || product.stockQuantity || 0)} className="h-full rounded-none rounded-r-lg hover:bg-gray-100 px-2">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Button onClick={handleAddToCart} disabled={(product.stock || product.stockQuantity || 0) === 0} className="h-9 text-xs gap-2 bg-brand-base hover:bg-brand-medium text-white shadow-sm hover:shadow-md transition-all px-6 rounded-lg font-medium" size="sm">
                <ShoppingBag className="h-3.5 w-3.5" />
                Thêm vào giỏ hàng
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center"><Truck className="h-5 w-5 text-primary" /></div>
                <p className="text-xs text-muted-foreground">Miễn phí giao hàng</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center"><Shield className="h-5 w-5 text-primary" /></div>
                <p className="text-xs text-muted-foreground">Bảo hành trọn đời</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center"><RefreshCcw className="h-5 w-5 text-primary" /></div>
                <p className="text-xs text-muted-foreground">Đổi trả miễn phí</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mt-16">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6">Mô tả chi tiết</TabsTrigger>
            <TabsTrigger value="shipping" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6">Vận chuyển & Bảo hành</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-8">
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {product.detailedDescription || product.description ? (
                <div className="leading-relaxed whitespace-pre-wrap">
                  {product.detailedDescription || product.description}
                </div>
              ) : (
                <p className="text-muted-foreground/60 italic">Chưa có mô tả chi tiết cho sản phẩm này.</p>
              )}

            </div>
          </TabsContent>

          <TabsContent value="shipping" className="mt-8">
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {product.policy ? (
                <div className="leading-relaxed whitespace-pre-wrap">{product.policy}</div>
              ) : (
                <>
                  <h4 className="text-foreground font-semibold mb-3">Chính sách vận chuyển</h4>
                  <ul className="space-y-2">
                    <li>Miễn phí vận chuyển cho đơn hàng từ 2.000.000đ</li>
                    <li>Hỗ trợ giao hàng toàn quốc nhanh chóng</li>
                    <li>Thời gian giao hàng: 2-5 ngày làm việc</li>
                    <li>Đóng gói cẩn thận, bảo vệ sản phẩm tối đa</li>
                  </ul>

                  <h4 className="text-foreground font-semibold mt-6 mb-3">Chính sách bảo hành</h4>
                  <ul className="space-y-2">
                    <li>Bảo hành trọn đời về chất lượng đá tự nhiên</li>
                    <li>Đổi trả trong vòng 30 ngày nếu có lỗi từ nhà sản xuất</li>
                    <li>Hỗ trợ thay dây miễn phí trong 6 tháng đầu</li>
                    <li>Vệ sinh và bảo dưỡng miễn phí trọn đời</li>
                  </ul>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 pt-20 border-t">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-10 text-center">
              Khám phá thêm
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
