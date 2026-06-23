'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ShoppingBag, Search, Menu, User, Heart, ChevronDown, LogOut, ShieldCheck, Bell, Sparkles, MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { logoutUser } from '@/lib/redux/slices/authSlice'
import { useCart } from '@/hooks/use-cart'
import { HeaderSearch } from './header-search'
import { categoriesApi } from '@/lib/api/categories'
import type { Category } from '@/types'

export function Header() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isCertPopupOpen, setIsCertPopupOpen] = useState(false)
  const pathname = usePathname()

  // Redux & SWR
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const { cart } = useCart()

  const itemCount = cart?.totalQuantity || 0

  const handleLogout = async () => {
    await dispatch(logoutUser())
    toast.success('Đã đăng xuất thành công')
    router.push('/')
    // Force reload to clear any SWR cache if needed
    window.location.reload()
  }

  useEffect(() => {
    setIsMobileSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getAll()
        setCategories(data.filter(cat => cat.isActive))
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-brand-tint-60 shadow-sm'
            : 'bg-white border-b border-brand-tint-60'
        )}
      >
        <div className="container mx-auto px-4 relative">

          {/* Mobile search overlay */}
          {isMobileSearchOpen && (
            <div className="absolute inset-0 z-50 flex items-center bg-white px-4 h-full w-full animate-in slide-in-from-right-2 md:hidden overflow-visible rounded-b-lg">
              <div className="flex-1 w-full relative z-[60]">
                <HeaderSearch isScrolled={true} />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsMobileSearchOpen(false)} className="ml-2 px-3 shrink-0 text-brand-darkest font-medium z-50">
                Hủy
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-8">
              {/* Mobile menu */}
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                    <Menu className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] bg-white p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Menu điều hướng</SheetTitle>
                    <SheetDescription>Truy cập nhanh các danh mục và trang của Elix Store</SheetDescription>
                  </SheetHeader>
                  <div className="p-6 border-b border-brand-tint-60 flex flex-col gap-4">
                    <Link href="/" className="flex items-center">
                      <Image src="/brand/logo.png" alt="Elix Jewelry Logo" width={100} height={38} className="object-contain h-auto" />
                    </Link>
                    <button
                      onClick={() => setIsCertPopupOpen(true)}
                      className="self-start flex items-center gap-2 px-4 py-1.5 bg-[#FDF6F4] border border-[#F3E5E2] rounded-full text-[#9C665A] text-[10px] font-bold tracking-wider uppercase shadow-sm hover:shadow-md hover:bg-[#F9EFED] transition-all cursor-pointer"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-yellow-600" />
                      <span style={{ fontFamily: 'Roboto, sans-serif' }}>Cam kết đá tự nhiên 100%</span>
                    </button>
                  </div>
                  <nav className="p-4 space-y-1 overflow-y-auto pb-32 h-[calc(100vh-80px)]" style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}>
                    <Link
  href="/"
  className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100"
>
  <Image
    src="/brand/logo.png"
    alt="Logo"
    width={120}
    height={40}
    priority
  />
</Link>
                    <div className="flex flex-col">
                      <button
                        onClick={() => setIsMobileProductsOpen(!isMobileProductsOpen)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
                        style={{ fontSize: '16px', fontWeight: 400, color: '#271916' }}
                      >
                        Sản phẩm
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isMobileProductsOpen ? "rotate-180" : "")} />
                      </button>

                      <div className={cn(
                        "flex flex-col space-y-1 overflow-hidden transition-all duration-300 ease-in-out",
                        isMobileProductsOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
                      )}>
                        <Link href="/products" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 pl-6" style={{ fontSize: '14px', fontWeight: 400, color: '#271916' }}>
                          Tất cả sản phẩm
                        </Link>
                        <Link href="/muc-dich" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 pl-6" style={{ fontSize: '14px', fontWeight: 400, color: '#271916' }}>
                          Chọn theo mục đích
                        </Link>
                        <div className="mx-3 my-1 border-t border-gray-200" />
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/products?category=${cat.id}`}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 pl-6"
                            style={{ fontSize: '14px', fontWeight: 400, color: '#271916' }}
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <Link href="/tu-van" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ fontSize: '16px', fontWeight: 400, color: '#271916' }}>
                      Tư vấn
                    </Link>
                    <Link href="/customize" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ fontSize: '16px', fontWeight: 400, color: '#271916' }}>
                      Thiết kế vòng
                    </Link>
                    <Link href="/about" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100" style={{ fontSize: '16px', fontWeight: 400, color: '#271916' }}>
                      Về chúng tôi
                    </Link>
                  </nav>
                  <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50 z-20">
                    {mounted && isAuthenticated && user ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-violet-100 text-violet-600">
                              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif', fontWeight: 400, fontSize: '16px', color: '#271916' }}>{user.fullName}</p>
                            <p style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif', fontWeight: 300, fontSize: '12px', color: '#6A7282' }}>{user.email}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full bg-transparent" onClick={handleLogout} style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif', fontWeight: 400, fontSize: '14px', color: '#271916' }}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Đăng xuất
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Link href="/login" className="block w-full">
                          <Button
                            className="w-full bg-gray-900 hover:bg-gray-800"
                          >
                            Đăng nhập
                          </Button>
                        </Link>
                        <Link href="/register" className="block w-full">
                          <Button
                            variant="outline"
                            className="w-full bg-transparent"
                          >
                            Đăng ký
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <Link href="/" className="flex items-center">
                <Image src="/brand/logo.png" alt="Elix Jewelry Logo" width={120} height={45} className="object-contain h-auto w-[80px] sm:w-[100px] lg:w-[120px]" />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1 whitespace-nowrap" style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}>
                <Link
  href="/"
  className="relative h-20 flex items-center px-3 group"
>
  <Image
    src="/brand/logo.png"
    alt="Elix Jewelry Logo"
    width={150}
    height={100}
    className="object-contain w-[130px] h-auto"
  />

  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black opacity-0 group-hover:opacity-100" />
</Link>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="relative h-16 flex items-center gap-1 px-3 group outline-none"
                    style={{ fontSize: '16px', fontWeight: 400, color: '#271916' }}
                  >
                    Sản phẩm <ChevronDown className="h-4 w-4 group-data-[state=open]:rotate-180" style={{ color: '#271916' }} />
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black opacity-0 group-hover:opacity-100 group-data-[state=open]:opacity-100" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-white border border-brand-tint-60 shadow-lg" style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}>
                    <DropdownMenuItem asChild className="focus:bg-gray-100">
                      <Link href="/products" className="block w-full cursor-pointer px-2 py-2 rounded-md" style={{ fontSize: '14px', fontWeight: 400, color: '#271916' }}>
                        Tất cả sản phẩm
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-gray-100">
                      <Link href="/muc-dich" className="block w-full cursor-pointer px-2 py-2 rounded-md" style={{ fontSize: '14px', fontWeight: 400, color: '#271916' }}>
                        Chọn theo mục đích
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-gray-100">
                      <Link href="/tu-van" className="block w-full cursor-pointer px-2 py-2 rounded-md" style={{ fontSize: '14px', fontWeight: 400, color: '#271916' }}>
                        Tư vấn
                      </Link>
                    </DropdownMenuItem>
                    {categories.length > 0 && <DropdownMenuSeparator />}
                    {categories.map((cat) => (
                      <DropdownMenuItem key={cat.id} asChild className="focus:bg-gray-100">
                        <Link href={`/products?category=${cat.id}`} className="block w-full cursor-pointer px-2 py-2 rounded-md" style={{ fontSize: '14px', fontWeight: 400, color: '#271916' }}>
                          {cat.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link
                  href="/customize"
                  className="relative h-16 flex items-center px-3 group"
                  style={{ fontSize: '16px', fontWeight: 400, color: '#271916' }}
                >
                  Thiết kế vòng
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black opacity-0 group-hover:opacity-100" />
                </Link>
                <Link
                  href="/tu-van"
                  className="relative h-16 flex items-center px-3 group"
                  style={{ fontSize: '16px', fontWeight: 400, color: '#271916' }}
                >
                  <span className="flex items-center gap-1">
                    Tư vấn
                  </span>
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black opacity-0 group-hover:opacity-100" />
                </Link>
                <Link
                  href="/about"
                  className="relative h-16 flex items-center px-3 group"
                  style={{ fontSize: '16px', fontWeight: 400, color: '#271916' }}
                >
                  Về chúng tôi
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black opacity-0 group-hover:opacity-100" />
                </Link>
              </nav>
            </div>

            {/* Middle: Commitment Message */}
            <div className="hidden xl:flex flex-1 items-center justify-center px-4">
              <button
                onClick={() => setIsCertPopupOpen(true)}
                className="flex items-center gap-2 px-4 py-1.5 bg-[#FDF6F4] border border-[#F3E5E2] rounded-full text-[#9C665A] text-[10px] font-bold tracking-wider uppercase whitespace-nowrap shadow-sm hover:shadow-md hover:bg-[#F9EFED] transition-all cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-yellow-600" />
                <span style={{ fontFamily: 'Roboto, sans-serif' }}>Cam kết đá tự nhiên 100%</span>
              </button>
            </div>

            {/* Right: Search + Actions */}

            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
              {/* Search */}

              <div className="hidden md:flex items-center mx-4">
                <div className="w-[220px] lg:w-[280px]">
                  <HeaderSearch isScrolled={isScrolled} />
                </div>
              </div>

              {/* Mobile search */}
              <Button
                variant="ghost"
                size="icon"
                className="relative md:hidden h-8 w-8 sm:h-9 sm:w-9 !text-brand-darkest hover:text-[#C37F70] hover:bg-transparent transition-colors group"
                onClick={() => setIsMobileSearchOpen(true)}
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5 relative z-10 transition-transform group-hover:scale-110" />
                <span className="absolute inset-0 bg-gray-100 rounded-lg scale-0 group-hover:scale-100 transition-transform" />
              </Button>

              {/* Mobile Chat Button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative md:hidden h-8 w-8 sm:h-9 sm:w-9 !text-brand-darkest hover:text-[#C37F70] hover:bg-transparent transition-colors group"
                onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 relative z-10 transition-transform group-hover:scale-110" />
                <span className="absolute inset-0 bg-gray-100 rounded-lg scale-0 group-hover:scale-100 transition-transform" />
              </Button>

              {/* Wishlist */}
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="relative hidden sm:flex h-9 w-9 !text-brand-darkest hover:text-[#C37F70] hover:bg-transparent transition-colors group">
                  <Heart className="h-5 w-5 relative z-10 transition-transform group-hover:scale-110" />
                  <span className="absolute inset-0 bg-gray-100 rounded-lg scale-0 group-hover:scale-100 transition-transform" />
                </Button>
              </Link>

              {/* Mobile Design Button - Visual Highlight */}
              <Link href="/customize" className="hidden sm:block lg:hidden">
                <Button variant="ghost" size="sm" className="relative h-8 sm:h-9 px-1.5 sm:px-2 !text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all group overflow-hidden border border-purple-100/50 rounded-xl">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 relative z-10 animate-pulse" />
                  <span className="text-[10px] sm:text-[11px] font-bold relative z-10">Thiết kế</span>
                  <span className="absolute inset-0 bg-purple-50/50 scale-0 group-hover:scale-100 transition-transform" />
                </Button>
              </Link>

              {/* Account */}
              {mounted && isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 px-2 hover:bg-transparent group flex items-center gap-2">
                      <Avatar className="h-8 w-8 relative z-10 ring-0 border-0 transition-transform group-hover:scale-110">
                        <AvatarImage src={undefined} />
                        <AvatarFallback className="bg-brand-tint-60 text-black text-sm border-0">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline-block text-sm font-medium text-brand-darkest relative z-10 max-w-[150px] truncate">
                        Xin chào, {user.fullName?.split(' ').pop() || user.fullName || 'Bạn'}
                      </span>
                      <span className="absolute inset-0 bg-[#F3E5E2] rounded-lg scale-0 group-hover:scale-100 transition-transform" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border border-brand-tint-60 shadow-lg" style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}>
                    <div className="px-3 py-2">
                      <p style={{ fontWeight: 400, fontSize: '16px', color: '#271916' }}>{user.fullName}</p>
                      <p style={{ fontWeight: 300, fontSize: '12px', color: '#6A7282' }}>{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="focus:bg-transparent">
                      <Link href="/account/profile" className="relative cursor-pointer px-2 py-2 rounded-md group overflow-hidden" style={{ fontSize: '14px', fontWeight: 400, color: '#271916' }}>
                        <span className="relative z-10 flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Tài khoản của tôi
                        </span>
                        <span className="absolute inset-0 bg-[#F3E5E2] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-200" />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-transparent">
                      <Link href="/account/orders" className="relative cursor-pointer px-2 py-2 rounded-md group overflow-hidden" style={{ fontSize: '14px', fontWeight: 400, color: '#271916' }}>
                        <span className="relative z-10 flex items-center">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Đơn hàng của tôi
                        </span>
                        <span className="absolute inset-0 bg-[#F3E5E2] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-200" />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="relative cursor-pointer focus:bg-transparent px-2 py-2 rounded-md group overflow-hidden" style={{ fontSize: '14px', fontWeight: 400, color: '#271916' }}>
                      <span className="relative z-10 flex items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        Đăng xuất
                      </span>
                      <span className="absolute inset-0 bg-red-50 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-200" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-8 w-8 sm:h-9 sm:w-9 !text-brand-darkest hover:text-[#C37F70] hover:bg-transparent transition-colors group"
                  >
                    <User className="h-4 w-4 sm:h-5 sm:w-5 relative z-10 transition-transform group-hover:scale-110" />
                    <span className="absolute inset-0 bg-[#F3E5E2] rounded-lg scale-0 group-hover:scale-100 transition-transform" />
                  </Button>
                </Link>
              )}

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9 !text-brand-darkest hover:text-[#C37F70] hover:bg-transparent transition-colors group">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 relative z-10 transition-transform group-hover:scale-110" />
                  {mounted && itemCount > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 sm:h-5 sm:min-w-5 rounded-full p-0 flex items-center justify-center text-[9px] sm:text-[10px] bg-[#C37F70] text-white z-20 group-hover:scale-110 transition-transform">
                      {itemCount}
                    </Badge>
                  )}
                  <span className="absolute inset-0 bg-[#F3E5E2] rounded-lg scale-0 group-hover:scale-100 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Certificate Popup */}
      {isCertPopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4" onClick={() => setIsCertPopupOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          {/* Modal */}
          <div
            className="relative rounded-2xl sm:rounded-3xl max-w-md md:max-w-2xl w-full max-h-[85vh] overflow-y-auto overflow-x-hidden animate-in zoom-in-95 fade-in duration-300"
            style={{
              background: 'linear-gradient(to top right, #E7CCC6 0%, #FFFFFF 50%, #E7CCC6 100%)',
              border: '3px solid #DBB2A9',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 40px rgba(219, 178, 169, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsCertPopupOpen(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-all"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
            </button>

            <div className="p-4 sm:p-6 md:p-10">
              {/* Header with icon */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                <Image
                  src="/popup/icon_primary.png"
                  alt="Chứng nhận chất lượng"
                  width={95}
                  height={95}
                  className="object-contain flex-shrink-0 w-16 h-16 sm:w-[95px] sm:h-[95px]"
                />
                <h2 className="uppercase leading-snug text-left">
                  <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, fontSize: 'clamp(18px, 4.5vw, 32px)', color: '#9C665A' }}>Chứng Nhận Chất Lượng</span>
                  <br />
                  <span style={{ fontFamily: "'Perpetua Titling MT', serif", fontWeight: 700, fontSize: 'clamp(18px, 4.5vw, 32px)', color: '#00813C' }}>&</span>
                  <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, fontSize: 'clamp(18px, 4.5vw, 32px)', color: '#00813C' }}> Độ Thuần Khiết</span>
                </h2>
              </div>

              {/* Description */}
              <p className="mb-4 sm:mb-6 leading-snug sm:leading-tight text-sm sm:text-base md:text-lg" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, color: '#85564C' }}>
                Tất cả sản phẩm tại Seravian đều trải qua quy trình kiểm định nghiêm ngặt tại các trung tâm uy tín. Dưới đây là hình ảnh giấy kiểm định mẫu cho một sản phẩm thực tế để quý khách tham khảo về định dạng.
              </p>

              {/* Certificate image */}
              <div className="rounded-xl sm:rounded-2xl p-1 md:p-2 shadow-xl mb-4 sm:mb-6 overflow-hidden" style={{ border: '2px solid #C37F70', backgroundColor: '#FFFFFF' }}>
                <Image
                  src="/popup/primary.png"
                  alt="Giấy chứng nhận kiểm định"
                  width={600}
                  height={450}
                  className="w-full h-auto rounded-lg object-contain transform scale-104"
                />
              </div>

              {/* Caption */}
              <p className="text-center mb-4 sm:mb-6 text-xs sm:text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 200, color: '#000000', opacity: 0.5, fontStyle: 'italic' }}>
                Ảnh chụp Giấy Chứng nhận mẫu  sản phẩm Đá Mặt trăng tự nhiên.
              </p>

              {/* Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setIsCertPopupOpen(false)}
                  className="rounded-full text-white px-6 sm:px-10 py-2.5 sm:py-3 shadow-xl transition-all hover:opacity-90 uppercase tracking-widest"
                  style={{ background: 'linear-gradient(to right, #9C665A 0%, #CF998D 50%, #9C665A 100%)' }}
                >
                  <span className="text-sm sm:text-lg" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}>TÔI ĐÃ HIỂU</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
