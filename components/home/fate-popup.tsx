'use client'

import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react'
import Link from 'next/link'
import { X, ChevronDown } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { getFateByYear } from '@/lib/fate-utils'
import { cn } from '@/lib/utils'

// Pre-compute years array once at module level — never re-created
const CURRENT_YEAR = new Date().getFullYear()
const YEARS: number[] = []
for (let y = CURRENT_YEAR; y >= 1940; y--) {
  YEARS.push(y)
}

// Pre-render options once — avoids mapping 86 items on every render
const YEAR_OPTIONS = YEARS.map((y) => (
  <option key={y} value={y}>
    {y}
  </option>
))

// Detect mobile once at module load — avoids repeated checks
const isMobileBrowser = () => {
  if (typeof window === 'undefined') return false
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  )
}

function FatePopupInner() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number | ''>('')
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const isMobile = useRef(false)

  const fate = useMemo(() => {
    if (typeof selectedYear === 'number') {
      return getFateByYear(selectedYear)
    }
    return null
  }, [selectedYear])

  // Lock body scroll when popup is open to prevent background rendering
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  useEffect(() => {
    setMounted(true)
    isMobile.current = isMobileBrowser()

    const hidden = localStorage.getItem('hideFatePopup') === 'true'
    if (hidden) return

    // On mobile, delay longer and skip preloading to reduce memory pressure
    // On desktop, preload images during delay as before
    if (!isMobile.current) {
      const preload = ['/brand/mascot_popup.jpg', '/brand/back_button.png']
      preload.forEach((src) => {
        const img = new window.Image()
        img.src = src
      })
    }

    // Mobile: longer delay (3s) to let page finish rendering first
    // Desktop: normal delay (1.5s)
    const delay = isMobile.current ? 3000 : 1500
    const timer = setTimeout(() => setIsOpen(true), delay)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      localStorage.setItem('hideFatePopup', 'true')
    }
    setIsOpen(false)
  }, [dontShowAgain])

  const handleYearChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value ? Number(e.target.value) : '')
  }, [])

  const toggleDontShow = useCallback(() => {
    setDontShowAgain((prev) => !prev)
  }, [])

  const handleCheckboxChange = useCallback((checked: boolean | 'indeterminate') => {
    setDontShowAgain(!!checked)
  }, [])

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  if (!mounted || !isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-4"
      style={{ willChange: 'opacity' }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 popup-backdrop"
      />

      {/* Modal Content */}
      <div
        className="relative w-[85vw] max-w-[320px] md:max-w-[800px] max-h-[92vh] md:max-h-[90vh] bg-white rounded-none shadow-2xl overflow-y-auto flex flex-col md:flex-row border border-brand-tint-60/30 popup-modal"
        style={{ willChange: 'transform, opacity' }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 md:top-4 md:right-4 z-20 p-1.5 md:p-2 rounded-full bg-white/80 hover:bg-white transition-colors text-gray-500 hover:text-gray-900"
        >
          <X size={18} className="md:hidden" />
          <X size={20} className="hidden md:block" />
        </button>

        {/* Left Side: Mascot — compact on mobile */}
        <div className="relative w-full md:w-[45%] h-[240px] sm:h-[280px] md:h-auto min-h-[240px] bg-gradient-to-br from-[#BD2013] to-[#8B1006] overflow-hidden flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/mascot_popup.jpg"
            alt="Elix Mascot"
            className={cn(
              "absolute inset-0 w-full h-full object-cover object-[15%_center] transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            loading="lazy"
            decoding="async"
            width={400}
            height={500}
            onLoad={handleImageLoad}
          />
          {/* Decorative Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6">
            <Link
              href="/products"
              onClick={handleClose}
              className="relative overflow-hidden inline-flex items-center justify-center px-3 py-1 md:px-5 md:py-2 rounded-xl text-white font-bold text-[11px] md:text-sm tracking-wider shadow-xl shadow-[#C37F70]/50 transition-all duration-300 hover:opacity-90 cursor-pointer no-underline"
              style={{ backgroundColor: '#C37F70' }}
            >
              <div className="absolute inset-0" style={{ backgroundImage: 'url(/brand/back_button.png)', backgroundSize: '100%', backgroundPosition: 'center', opacity: 0.2 }} />
              <span className="relative z-10" style={{ color: '#ffffff' }}>MUA NGAY</span>
            </Link>
          </div>
        </div>

        {/* Right Side: Logic */}
        <div className="w-full md:w-[55%] p-4 sm:p-5 md:p-12 flex flex-col">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl md:text-3xl text-[#271916] mb-2 md:mb-4 leading-tight">
              CHỌN VÒNG ĐÁ HỢP TUỔI BẠN
            </h2>
            <p className="text-gray-500 mb-4 md:mb-8 leading-relaxed text-xs sm:text-sm md:text-base">
              Hãy để <span className="font-bold text-[#C37F70]">Seravian</span> chọn giúp bạn vòng đá hợp theo năm sinh của bạn nhé!
            </p>

            {/* Year Selector */}
            <div className="relative mb-4 md:mb-8">
              <div className="relative group">
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="w-full h-10 sm:h-11 md:h-14 pl-3 sm:pl-4 md:pl-6 pr-10 appearance-none rounded-xl md:rounded-2xl border-2 border-gray-100 bg-gray-50/50 text-gray-700 font-medium focus:border-[#C37F70] focus:ring-4 focus:ring-[#C37F70]/10 outline-none transition-all cursor-pointer hover:border-gray-200 text-sm md:text-base"
                >
                  <option value="">- Chọn năm sinh -</option>
                  {YEAR_OPTIONS}
                </select>
                <ChevronDown className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Result Display */}
            {fate && (
              <div className="mb-4 md:mb-8 p-3 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl bg-[#FDF6F4] border border-[#F3E5E2] text-center">
                <p className="text-xs sm:text-sm text-[#9C665A] mb-1 md:mb-2">Năm sinh của bạn thuộc mệnh</p>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#271916] mb-1 md:mb-2">
                  {fate.napAmName}
                </h3>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 md:space-y-4">
            <Link
              href={fate ? `/products?element=${fate.element}` : '/products'}
              onClick={handleClose}
              className="block w-full no-underline"
            >
              <div
                className={cn(
                  "relative overflow-hidden w-full h-10 sm:h-11 md:h-14 rounded-xl text-sm sm:text-base md:text-lg font-bold tracking-widest transition-all duration-300 shadow-xl shadow-[#C37F70]/50 flex items-center justify-center cursor-pointer hover:opacity-90",
                  !fate && "opacity-80"
                )}
                style={{ backgroundColor: '#C37F70' }}
              >
                <div className="absolute inset-0" style={{ backgroundImage: 'url(/brand/back_button.png)', backgroundSize: '100%', backgroundPosition: 'center', opacity: 0.2 }} />
                <span className="relative z-10" style={{ color: '#ffffff' }}>XEM NGAY</span>
              </div>
            </Link>

            {/* Checkbox */}
            <div className="flex items-center justify-end gap-2 group cursor-pointer select-none px-1 md:px-2" onClick={toggleDontShow}>
              <Checkbox
                id="hide-popup"
                checked={dontShowAgain}
                onCheckedChange={handleCheckboxChange}
                className="border-gray-300 data-[state=checked]:bg-[#BD2013] data-[state=checked]:border-[#BD2013] rounded-md h-3.5 w-3.5 md:h-4 md:w-4"
              />
              <label htmlFor="hide-popup" className="text-xs md:text-sm text-gray-400 font-medium group-hover:text-gray-600 transition-colors cursor-pointer">
                Ẩn thông báo
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// React.memo prevents re-renders from parent (HomePage has 3 SWR hooks that trigger re-renders)
export const FatePopup = memo(FatePopupInner)
