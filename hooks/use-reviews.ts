'use client'

import { useState } from 'react'
import useSWR from 'swr'
import apiClient from '@/lib/api-client'
import type { Review, FeaturedReview, ReviewStats, CreateReviewDto, UpdateReviewDto, PaginatedResponse } from '@/types'
import { toast } from 'sonner'

async function fetcher(url: string): Promise<any> {
    return await apiClient.get(url)
}
// ... (skip lines)

export function useFeaturedReviews(count: number = 6) {
    const { data, error, isLoading } = useSWR<FeaturedReview[]>(
        `/reviews/featured?count=${count}`,
        fetcher
    )

    if (error) {
        console.error('Error fetching featured reviews:', error)
    }

    return {
        reviews: data || [],
        isLoading,
        isError: error
    }
}

export function useReviews(productId: number | string) {
    const [page, setPage] = useState(1)
    const pageSize = 5

    const { data: reviewsData, error: reviewsError, mutate: mutateReviews } = useSWR<PaginatedResponse<Review>>(
        productId ? `/reviews/product/${productId}?page=${page}&pageSize=${pageSize}` : null,
        fetcher
    )

    const { data: statsData, error: statsError, mutate: mutateStats } = useSWR<ReviewStats>(
        productId ? `/reviews/product/${productId}/stats` : null,
        fetcher
    )

    const reviews = reviewsData?.items || []
    const stats: ReviewStats = statsData || {
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { star5: 0, star4: 0, star3: 0, star2: 0, star1: 0 }
    }

    const isLoading = (!reviewsData && !reviewsError) || (!statsData && !statsError)

    const submitReview = async (dto: CreateReviewDto) => {
        try {
            await apiClient.post('/reviews', dto)
            toast.success('Đánh giá của bạn đã được gửi thành công!')
            mutateReviews()
            mutateStats()
            return true
        } catch (error: any) {
            const message = error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra khi gửi đánh giá.'
            toast.error(message)
            return false
        }
    }

    const updateReview = async (reviewId: number, dto: UpdateReviewDto) => {
        try {
            await apiClient.put(`/reviews/${reviewId}`, dto)
            toast.success('Đánh giá của bạn đã được cập nhật thành công!')
            mutateReviews()
            mutateStats()
            return true
        } catch (error: any) {
            const message = error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra khi cập nhật đánh giá.'
            toast.error(message)
            return false
        }
    }

    const deleteReview = async (reviewId: number) => {
        try {
            await apiClient.delete(`/reviews/${reviewId}`)
            toast.success('Đánh giá đã được xóa thành công!')
            mutateReviews()
            mutateStats()
            return true
        } catch (error: any) {
            const message = error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra khi xóa đánh giá.'
            toast.error(message)
            return false
        }
    }

    return {
        reviews,
        stats,
        isLoading,
        isError: reviewsError || statsError,
        pagination: {
            currentPage: reviewsData?.page || 1,
            totalPages: reviewsData?.totalPages || 1,
            totalCount: reviewsData?.totalCount || 0,
            setPage
        },
        submitReview,
        updateReview,
        deleteReview,
        refresh: () => {
            mutateReviews()
            mutateStats()
        }
    }
}


