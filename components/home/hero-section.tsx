'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative w-full h-auto md:h-[80vh] lg:h-screen overflow-hidden bg-brand-lightest">
      {/* Full screen background image banner */}
      <div className="relative w-full h-full" suppressHydrationWarning>
        {/* Mobile: contain (full image visible) */}
        <div className="relative block md:hidden w-full">
          <Image
            src="/brand/slide_homepage.png"
            alt="Trang sức đá phong thủy banner"
            width={1920}
            height={1080}
            className="w-full h-auto object-contain"
            priority
            quality={100}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/45" />
          {/* Text overlay - mobile */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-[15%] z-10">
            <h1
              className="tracking-wider leading-none"
              style={{
                fontFamily: "'1FTV VIP Classy Vogue', 'Century Gothic', serif",
                fontSize: 'clamp(28px, 7vw, 48px)',
                color: '#ffffff',
                fontWeight: 400,
              }}
            >
              Seravian Jewelry
            </h1>
            <p
              className="tracking-widest mt-2"
              style={{
                fontFamily: "'Century Gothic', 'Avant Garde', sans-serif",
                fontSize: 'clamp(12px, 3vw, 20px)',
                color: '#ffffff',
                fontWeight: 400,
              }}
            >
              Thiết kế vòng tay của riêng bạn
            </p>
            <div className="flex gap-3 mt-5">
  <Link href="/products">
    <Button
      size="sm"
      className="rounded-full px-5 bg-white text-black hover:bg-gray-100"
    >
      Mua ngay
    </Button>
  </Link>

  <Link href="/customize">
    <Button
      size="sm"
      variant="outline"
      className="rounded-full px-5 border-white text-white bg-transparent hover:bg-white hover:text-black"
    >
      Thiết kế ngay
    </Button>
  </Link>
</div>
          </div>
        </div>
        {/* Desktop: cover (fills area) */}
        <div className="hidden md:block w-full h-full">
          <Image
            src="/brand/slide_homepage.png"
            alt="Trang sức đá phong thủy banner"
            fill
            className="object-cover object-center"
            priority
            quality={100}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/45" />
          {/* Text overlay - desktop */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <h1
              className="tracking-wider leading-none"
              style={{
                fontFamily: "'1FTV VIP Classy Vogue', 'Century Gothic', serif",
                fontSize: 'clamp(48px, 8vw, 128px)',
                color: '#ffffff',
                fontWeight: 400,
              }}
            >
              Seravian Jewelry
            </h1>
            <p
              className="tracking-widest mt-4"
              style={{
                fontFamily: "'Century Gothic', 'Avant Garde', sans-serif",
                fontSize: 'clamp(24px, 3.5vw, 30px)',
                color: '#ffffff',
                fontWeight: 250,
              }}
            >
              Thiết vòng tay của riêng bạn

            </p>
            <div className="flex items-center gap-4 mt-8">
  <Link href="/products">
    <Button
      className="px-8 py-6 rounded-full text-base font-medium bg-white text-black hover:bg-gray-100"
    >
      Mua ngay
    </Button>
  </Link>

  <Link href="/customize">
    <Button
      variant="outline"
      className="px-8 py-6 rounded-full text-base font-medium border-white text-white bg-transparent hover:bg-white hover:text-black"
    >
      Thiết kế ngay
    </Button>
  </Link>
</div>
          </div>
        </div>
      </div>
    </section>

  )
}
