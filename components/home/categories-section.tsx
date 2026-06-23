'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles } from 'lucide-react'
import { categoriesApi } from '@/lib/api/categories'
import type { Category } from '@/types'

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getAll()
        setCategories(data.filter(cat => cat.isActive).slice(0, 4))
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-6 w-32 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
            <div className="h-10 w-64 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
            <div className="h-6 w-96 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Bộ sưu tập
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Danh mục sản phẩm
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Khám phá các dòng sản phẩm đá phong thủy cao cấp, được tuyển chọn kỹ lưỡng và kiểm định chất lượng
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300"
            >
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-purple-600" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-white/80 text-sm line-clamp-2 mb-3">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-white group-hover:text-violet-300 transition-colors">
                  <span className="text-sm font-medium">Khám phá ngay</span>
                  <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
