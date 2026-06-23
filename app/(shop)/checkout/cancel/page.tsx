'use client'

import Link from 'next/link'
import { XCircle, ArrowLeft, RotateCcw, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CheckoutCancelPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-lg mx-auto text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
          Thanh toan that bai
        </h1>
        <p className="mt-3 text-muted-foreground">
          Rat tiec, thanh toan cua ban khong thanh cong. 
          Vui long thu lai hoac chon phuong thuc thanh toan khac.
        </p>

        {/* Reasons */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-left">
          <p className="font-medium text-foreground mb-2">Nguyen nhan co the:</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>- So du tai khoan khong du</li>
            <li>- Thong tin the khong chinh xac</li>
            <li>- Giao dich bi tu choi boi ngan hang</li>
            <li>- Phien thanh toan het han</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button asChild className="flex-1">
            <Link href="/checkout">
              <RotateCcw className="mr-2 h-4 w-4" />
              Thu lai
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1 bg-transparent">
            <Link href="/cart">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lai gio hang
            </Link>
          </Button>
        </div>

        {/* Support */}
        <div className="mt-8 p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">
            Neu ban can ho tro, hay lien he voi chung toi
          </p>
          <Button variant="link" asChild className="mt-2">
            <a href="tel:1900xxxx">
              <Phone className="mr-2 h-4 w-4" />
              1900 xxxx
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
