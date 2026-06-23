'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, Quote, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useFeaturedReviews } from '@/hooks/use-reviews'

export function TestimonialsSection() {
  const { reviews, isLoading, isError } = useFeaturedReviews(3)

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
            Khách hàng nói gì
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Đánh giá từ khách hàng
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Hàng ngàn khách hàng đã tin tưởng và hài lòng với sản phẩm của chúng tôi
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="min-h-[300px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
          ) : isError ? (
            <div className="flex flex-col justify-center items-center h-[300px] text-red-600">
              <p>Không thể tải đánh giá vào lúc này.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-sm underline hover:no-underline"
              >
                Thử lại
              </button>
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.map((testimonial) => (
                <Card key={testimonial.id} className="bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
                  <CardContent className="p-6 flex flex-col items-start flex-1">
                    {/* Quote icon */}
                    <Quote className="h-10 w-10 text-violet-200 mb-4" />

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                        />
                      ))}
                    </div>

                    {/* Comment */}
                    <p className="text-gray-700 leading-relaxed text-sm line-clamp-4 mb-4 flex-1">
                      &ldquo;{testimonial.comment}&rdquo;
                    </p>

                    {/* Product */}
                    {testimonial.productName && (
                      <Link href={testimonial.productId ? `/products/${testimonial.productId}` : '#'} className="text-xs text-violet-600 font-medium hover:underline mb-4 block truncate max-w-full">
                        Sản phẩm: {testimonial.productName}
                      </Link>
                    )}

                    {/* Author */}
                    <div className="flex items-center gap-3 w-full pt-4 border-t border-gray-100 mt-auto">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {testimonial.userAvatar ? (
                          <Image
                            src={testimonial.userAvatar}
                            alt={testimonial.userName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm">
                            {testimonial.userName ? testimonial.userName.charAt(0).toUpperCase() : 'K'}
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm">{testimonial.userName || 'Khách hàng'}</p>
                        <p className="text-xs text-gray-500">Đã mua hàng</p>
                      </div>
                    </div>
                    
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">
              Chưa có đánh giá nào.
            </div>
          )}
        </div>

      </div>
    </section>
  )
}
