'use client'

import React, { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ReviewFormProps {
    productId: number
    initialData?: { rating: number; comment: string }
    onSubmit: (data: { rating: number; comment: string }) => Promise<boolean>
    onSuccess?: () => void
}

export function ReviewForm({ productId, initialData, onSubmit, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(initialData?.rating || 0)
    const [hover, setHover] = useState(0)
    const [comment, setComment] = useState(initialData?.comment || '')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Sync state if initialData changes (though modal biasanya unmount)
    useEffect(() => {
        if (initialData) {
            setRating(initialData.rating)
            setComment(initialData.comment)
        }
    }, [initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (rating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá.')
            return
        }

        if (!comment.trim()) {
            toast.error('Vui lòng nhập nội dung đánh giá.')
            return
        }

        setIsSubmitting(true)
        const success = await onSubmit({ rating, comment })
        setIsSubmitting(false)

        if (success) {
            if (!initialData) {
                setRating(0)
                setComment('')
            }
            onSuccess?.()
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                    Xếp hạng của bạn <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="p-1 transition-transform active:scale-95"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <Star
                                    className={cn(
                                        "h-8 w-8 transition-colors",
                                        (hover || rating) >= star
                                            ? "fill-gold text-gold"
                                            : "fill-transparent text-muted-foreground"
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <span className="ml-3 text-sm font-medium text-foreground">
                            {rating} / 5 sao
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <label htmlFor="comment" className="text-sm font-medium text-foreground">
                    Nội dung đánh giá <span className="text-destructive">*</span>
                </label>
                <Textarea
                    id="comment"
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[120px] bg-white border-border focus:ring-primary rounded-xl"
                    required
                />
            </div>

            <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Đang gửi...' : initialData ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
            </Button>
        </form>
    )
}
