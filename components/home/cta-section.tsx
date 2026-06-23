import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-[#754C43] via-[#9C665A] to-[#C37F70]">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-white rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Sẵn sàng khám phá năng lượng từ thiên nhiên?
          </h2>
          <p className="mt-6 text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            Liên hệ ngay để được tư vấn miễn phí về loại đá phù hợp với mệnh và nhu cầu của bạn. 
            Đội ngũ chuyên gia sẵn sàng hỗ trợ.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#754C43] hover:bg-[#F3E5E2] px-8 h-12 text-base font-semibold shadow-xl hover:shadow-2xl transition-all"
            >
              <Link href="/products">
                Mua sắm ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 px-8 h-12 text-base font-semibold bg-transparent backdrop-blur-sm"
            >
              <Link href="/contact">
                <Phone className="mr-2 h-5 w-5" />
                Liên hệ tư vấn
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
