'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebounce } from '@/hooks/use-debounce'
import { useProducts } from '@/hooks/use-products'
import { useClickOutside } from '@/hooks/use-click-outside'
import { cn } from '@/lib/utils'
import { Product } from '@/types'

interface HeaderSearchProps {
    isScrolled?: boolean
}

export const HeaderSearch = ({ isScrolled = false }: HeaderSearchProps) => {
    const router = useRouter()
    const [term, setTerm] = useState('')
    const [isVisible, setIsVisible] = useState(false)

    // Custom debounce delay 300ms
    const debouncedTerm = useDebounce(term, 300)

    // Only fetch when we have a term
    const { products, isLoading } = useProducts({
        q: debouncedTerm,
        pageSize: 5 // Limit preview results
    })

    const containerRef = useRef<HTMLDivElement>(null)

    useClickOutside(containerRef, () => {
        setIsVisible(false)
    })

    // Open dropdown when typing or focusing if there's text
    const handleFocus = () => {
        if (term) setIsVisible(true)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTerm(e.target.value)
        if (e.target.value) setIsVisible(true)
    }

    const handleClear = () => {
        setTerm('')
        setIsVisible(false)
    }

    const handleSearch = (e?: FormEvent) => {
        e?.preventDefault()
        if (!term.trim()) return

        setIsVisible(false)
        router.push(`/products?q=${encodeURIComponent(term)}`)
    }

    // Determine what to show in dropdown
    const showDropdown = isVisible && term.length > 0
    const hasResults = products && products.length > 0

    return (
        <div ref={containerRef} className="relative w-full max-w-[500px]">
            <form
                onSubmit={handleSearch}
                className="relative group w-full"
            >
                <div className={cn(
                    "flex items-center w-full rounded-full overflow-hidden transition-all duration-200",
                    isScrolled
                        ? "bg-gray-100 border border-transparent focus-within:bg-white focus-within:border-gray-300 hover:bg-gray-100/80"
                        : "bg-white/10 backdrop-blur-sm border border-white/20 focus-within:bg-white/90 focus-within:border-white/40 hover:bg-white/20",
                    "focus-within:ring-2 focus-within:ring-violet-100"
                )}>
                    <input
                        type="text"
                        value={term}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        placeholder="Tìm kiếm sản phẩm..."
                        className="flex-1 bg-transparent border-none outline-none px-5 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 w-full"
                        suppressHydrationWarning
                    />

                    {/* Actions on the right */}
                    <div className="flex items-center pr-1 gap-1">
                        {/* Clear button if text exists */}
                        {term && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 opacity-100 transition-opacity"
                                suppressHydrationWarning
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}

                        <span className="w-px h-6 bg-gray-300 mx-1"></span>

                        <button
                            type="submit"
                            className="p-2.5 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
                            suppressHydrationWarning
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </form>

            {/* Dropdown Results */}
            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 py-2 origin-top"
                    >

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-8 text-gray-400">
                                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                <span className="text-sm">Đang tìm kiếm...</span>
                            </div>
                        )}

                        {/* Results List */}
                        {!isLoading && hasResults && (
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Sản phẩm gợi ý
                                </div>
                                <ul className="space-y-1">
                                    {products.map((product) => (
                                        <li key={product.id}>
                                            <Link
                                                href={`/products/${product.slug || product.id}`}
                                                onClick={() => setIsVisible(false)}
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer group"
                                            >
                                                <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                                    {product.imageUrl ? (
                                                        <Image
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            sizes="40px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <Search className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-violet-600 transition-colors">
                                                        {product.name}
                                                    </h4>
                                                    {/* Assuming price is number */}
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                                    </p>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>

                                <div
                                    onClick={() => handleSearch()}
                                    className="border-t border-gray-100 mt-2 px-4 py-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-sm font-medium text-violet-600 hover:underline">
                                        Xem tất cả kết quả cho "{term}"
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* No Results */}
                        {!isLoading && !hasResults && debouncedTerm && (
                            <div className="py-8 text-center text-gray-500">
                                <p className="text-sm">Không tìm thấy sản phẩm nào khớp với "{term}"</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
