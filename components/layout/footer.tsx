import Image from 'next/image'
import Link from 'next/link'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden pt-16 pb-8" style={{ backgroundColor: '#F0E0DC', fontFamily: 'var(--font-roboto), Roboto, sans-serif' }} suppressHydrationWarning>
      <div className="absolute inset-0 bg-[#F0E0DC] -z-10" aria-hidden="true" />
      <div className="container mx-auto px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Logo & Info Column */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="inline-block">
              <Image
                src="/brand/logo_footer.png"
                alt="Elix Jewelry Logo"
                width={300}
                height={100}
                className="object-contain -ml-5 -mt-8"
              />
            </Link>
            <p className="text-[#271916] leading-relaxed max-w-xs" style={{ fontSize: '14px'}}>
              Hãy thiết kế dấu ấn năng lượng của riêng bạn.
              Để mỗi tinh thể tự nhiên trở thành lời chú thích cho tâm hồn bạn.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="uppercase tracking-wider text-[#271916] mb-6" style={{ fontSize: '18px', fontWeight: 600 }}>Liên kết nhanh</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/products" className="hover:opacity-70 transition-colors group" style={{ fontSize: '14px', color: '#271916' }}>
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/customize" className="hover:opacity-70 transition-colors group" style={{ fontSize: '14px', color: '#271916' }}>
                  Thiết kế vòng riêng
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:opacity-70 transition-colors group" style={{ fontSize: '14px', color: '#271916' }}>
                  Về chúng tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* About Elix Column */}
          <div>
            <h4 className="uppercase tracking-wider text-[#271916] mb-6" style={{ fontSize: '18px', fontWeight: 600 }}>Về Seravian</h4>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="hover:opacity-70 transition-colors group" style={{ fontSize: '14px', color: '#271916' }}>
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-70 transition-colors group" style={{ fontSize: '14px', color: '#271916' }}>
                  Chính Sách & Hỗ Trợ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-70 transition-colors group" style={{ fontSize: '14px', color: '#271916' }}>
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-70 transition-colors group" style={{ fontSize: '14px', color: '#271916' }}>
                  Điều khoản dịch vụ
                </Link>
              </li>
            </ul>
          </div>

          {/* Social/Connection Column */}
          <div className="flex flex-col gap-6">
            <h4 className="uppercase tracking-wider text-[#271916] mb-2" style={{ fontSize: '18px', fontWeight: 600 }}>KẾT NỐI VỚI CHÚNG TÔI</h4>

            <div className="flex items-center gap-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61587669324175" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-[#271916]/10 border border-[#271916]/20 flex items-center justify-center shadow-sm hover:bg-[#271916]/20 hover:scale-110 hover:border-[#271916]/40 transition-all duration-300 group"
              >
                <Facebook className="h-5 w-5 text-[#271916] transition-colors" />
              </a>
              <a 
                href="https://www.instagram.com/elixjewelry" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-[#271916]/10 border border-[#271916]/20 flex items-center justify-center shadow-sm hover:bg-[#271916]/20 hover:scale-110 hover:border-[#271916]/40 transition-all duration-300 group"
              >
                <Instagram className="h-5 w-5 text-[#271916] transition-colors" />
              </a>
              <a 
                href="https://www.tiktok.com/@elix.jewelry" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-[#271916]/10 border border-[#271916]/20 flex items-center justify-center shadow-sm hover:bg-[#271916]/20 hover:scale-110 hover:border-[#271916]/40 transition-all duration-300 group"
              >
                <svg className="h-5 w-5 text-[#271916] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a 
                href="mailto:elixharmony@gmail.com" 
                className="w-10 h-10 rounded-full bg-[#271916]/10 border border-[#271916]/20 flex items-center justify-center shadow-sm hover:bg-[#271916]/20 hover:scale-110 hover:border-[#271916]/40 transition-all duration-300 group"
              >
                <Mail className="h-5 w-5 text-[#271916] transition-colors" />
              </a>
            </div>

            <ul className="space-y-4">
              <li className="flex items-center gap-3 group">
                <Phone className="h-4 w-4 text-[#271916]" />
                <span className="text-[#271916]" style={{ fontSize: '14px'}}>0974750357</span>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail className="h-4 w-4 text-[#271916]" />
                <span className="text-[#271916]" style={{ fontSize: '14px'}}>support@seravian.com</span>
              </li>
              <li className="flex items-start gap-3 group">
                <MapPin className="h-4 w-4 text-[#271916] shrink-0 mt-0.5" />
                <span className="text-[#271916] leading-relaxed" style={{ fontSize: '14px'}}>
                  Ngõ 82, Đường Đông Ba, Thôn Đông Ba, Phường Thương Cát, Hà Nội,
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-[#271916]/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[#271916]" style={{ fontSize: '14px'}}>
            &copy; © 2026 SeraVian. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-[#C37F70] rounded-lg text-white text-xs font-bold min-w-[80px] text-center">Visa</div>
            <div className="px-5 py-2 bg-[#C37F70] rounded-lg text-white text-xs font-bold min-w-[120px] text-center whitespace-nowrap">Mastercard</div>
            <div className="px-4 py-2 bg-[#C37F70] rounded-lg text-white text-xs font-bold min-w-[80px] text-center">PayOS</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
