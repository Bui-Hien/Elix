'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Package, Mail, ArrowRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderCode = searchParams.get('orderCode') || 'GS-XXXXXX'
  const method = searchParams.get('method') || 'payos'

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-lg mx-auto text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald/10 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-emerald" />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
          Đặt hàng thành công!
        </h1>
        <p className="mt-3 text-muted-foreground">
          Cảm ơn bạn đã mua sắm tại GemStone. Đơn hàng của bạn đã được tiếp nhận.
        </p>

        {/* Order Info Card */}
        <Card className="mt-8 text-left">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <span className="text-muted-foreground">Mã đơn hàng</span>
              <span className="font-semibold text-foreground">{orderCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trạng thái</span>
              <span className="font-semibold text-emerald">
                {method === 'payos' ? 'Đã thanh toán' : 'Chờ xác nhận'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Phương thức</span>
              <span className="font-medium text-foreground">
                {method === 'payos' ? 'PayOS' : 'COD'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="mt-8 space-y-4">
          <div className="flex items-start gap-4 text-left p-4 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Xác nhận qua email</p>
              <p className="text-sm text-muted-foreground">
                Chúng tôi đã gửi email xác nhận đơn hàng đến địa chỉ email của bạn
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 text-left p-4 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Theo dõi đơn hàng</p>
              <p className="text-sm text-muted-foreground">
                Bạn sẽ nhận được thông báo khi đơn hàng được vận chuyển
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button asChild className="flex-1">
            <Link href="/products">
              Tiếp tục mua sắm
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1 bg-transparent">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Link>
          </Button>
        </div>
        
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-lg mx-auto text-center animate-pulse">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted" />
          <div className="h-10 w-64 mx-auto bg-muted rounded" />
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
