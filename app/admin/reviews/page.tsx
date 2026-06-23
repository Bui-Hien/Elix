'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trash2, Star } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatDate } from '@/lib/data'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Review {
    id: number
    rating: number
    comment: string
    createdAt: string
    userName: string
    productName: string
    productId: number
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReviews()
    }, [])

    const fetchReviews = async () => {
        try {
            const response: any = await apiClient.get('/admin/reviews')
            setReviews(response.data || [])
        } catch (error) {
            console.error('Failed to fetch reviews', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) return;
        try {
            await apiClient.delete(`/admin/reviews/${id}`)
            setReviews(reviews.filter(r => r.id !== id))
            toast.success("Đã xóa đánh giá")
        } catch (error) {
            toast.error("Xóa thất bại")
        }
    }

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Đánh giá sản phẩm</h1>
                <p className="text-muted-foreground">Quản lý các phản hồi từ khách hàng</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tất cả đánh giá</CardTitle>
                    <CardDescription>Hiển thị các đánh giá mới nhất</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ngày</TableHead>
                                <TableHead>Khách hàng</TableHead>
                                <TableHead>Sản phẩm</TableHead>
                                <TableHead>Đánh giá</TableHead>
                                <TableHead>Nội dung</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reviews.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8">Chưa có đánh giá nào.</TableCell></TableRow>
                            ) : (
                                reviews.map((review) => (
                                    <TableRow key={review.id}>
                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                            {formatDate(review.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-xs">{review.userName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium">{review.userName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={review.productName}>
                                            {review.productName}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex text-amber-500">
                                                {Array.from({ length: review.rating }).map((_, i) => (
                                                    <Star key={i} className="w-3 h-3 fill-current" />
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[300px] text-sm italic text-muted-foreground truncate" title={review.comment}>
                                            "{review.comment}"
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(review.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
