'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatDate } from '@/lib/data'
import Link from 'next/link'
import { toast } from 'sonner'

interface BlogPost {
    id: number
    title: string
    category: string
    author: string
    isPublished: boolean
    createdAt: string
    viewCount?: number
}

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPosts = async () => {
        try {
            const response: any = await apiClient.get('/admin/blog')
            setPosts(response)
        } catch (error) {
            console.error('Failed to fetch blog posts', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
        try {
            await apiClient.delete(`/admin/blog/${id}`)
            setPosts(posts.filter(p => p.id !== id))
            toast.success("Đã xóa bài viết")
        } catch (error) {
            toast.error("Xóa thất bại")
        }
    }

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Bài viết Blog</h1>
                    <p className="text-muted-foreground">Quản lý tin tức, bài viết chia sẻ kiến thức</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Viết bài mới
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách bài viết</CardTitle>
                    <CardDescription>Tổng số {posts.length} bài viết</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tiêu đề</TableHead>
                                <TableHead>Danh mục</TableHead>
                                <TableHead>Tác giả</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8">Chưa có bài viết nào.</TableCell></TableRow>
                            ) : (
                                posts.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-medium max-w-[300px] truncate" title={post.title}>
                                            {post.title}
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{post.category}</Badge></TableCell>
                                        <TableCell>{post.author}</TableCell>
                                        <TableCell>
                                            {post.isPublished ? (
                                                <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle className="w-3 h-3 mr-1" /> Đã xuất bản</Badge>
                                            ) : (
                                                <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" /> Nháp</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{formatDate(post.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" title="Sửa">
                                                    <Edit className="h-4 w-4 text-blue-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" title="Xóa" onClick={() => handleDelete(post.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
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
