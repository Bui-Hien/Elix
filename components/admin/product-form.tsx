'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2, Upload, X, Save } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { toast } from 'sonner'
import Image from 'next/image'

interface Category {
    id: number
    name: string
}

interface Tag {
    id: number
    name: string
}

interface ProductFormProps {
    initialData?: any
    onSuccess: () => void
    onCancel: () => void
}

export function ProductForm({ initialData, onSuccess, onCancel }: ProductFormProps) {
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [tags, setTags] = useState<Tag[]>([])

    // Form State
    const [name, setName] = useState(initialData?.name || '')
    const [price, setPrice] = useState(initialData?.price || 0)
    const [description, setDescription] = useState(initialData?.description || '')
    const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '')
    const [categoryId, setCategoryId] = useState<string>(initialData?.category?.id?.toString() || '')
    const [stockQuantity, setStockQuantity] = useState(initialData?.stockQuantity || 0)
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
    const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false)
    const [isBestSeller, setIsBestSeller] = useState(initialData?.isBestSeller ?? false)

    // Upload State
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [cats, tgs] = await Promise.all([
                    apiClient.get('/admin/categories'),
                    apiClient.get('/admin/tags')
                ])
                setCategories(cats as any)
                setTags(tgs as any)
            } catch (e) {
                console.error("Failed to load metadata")
            }
        }
        fetchMeta()
    }, [])

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        setUploading(true)
        try {
            const res: any = await apiClient.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setImageUrl(res.imageUrl)
            toast.success("Đã tải ảnh lên")
        } catch (error) {
            toast.error("Tải ảnh thất bại")
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !price || !categoryId) {
            toast.error("Vui lòng nhập đủ thông tin!")
            return
        }

        setLoading(true)
        try {
            const payload = {
                name,
                price: Number(price),
                description,
                imageUrl,
                categoryId: Number(categoryId),
                stockQuantity: Number(stockQuantity),
                isActive,
                isFeatured,
                isBestSeller,
                // tagIds: [] // TODO: Add tag selection UI
            }

            if (initialData) {
                await apiClient.put(`/admin/products/${initialData.id}`, payload)
                toast.success("Cập nhật sản phẩm thành công")
            } else {
                await apiClient.post('/admin/products', payload)
                toast.success("Thêm sản phẩm thành công")
            }
            onSuccess()
        } catch (error) {
            toast.error("Có lỗi xảy ra")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Tên sản phẩm <span className="text-red-500">*</span></Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="Nhập tên sản phẩm" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="price">Giá (VNĐ) <span className="text-red-500">*</span></Label>
                    <Input id="price" type="number" min="0" value={price} onChange={e => setPrice(Number(e.target.value))} required />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="category">Danh mục <span className="text-red-500">*</span></Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(c => (
                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="stock">Số lượng tồn kho <span className="text-red-500">*</span></Label>
                    <Input 
                        id="stock" 
                        type="number" 
                        min="0" 
                        value={stockQuantity} 
                        onChange={e => setStockQuantity(Number(e.target.value))} 
                        required 
                        placeholder="Nhập số lượng"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Hình ảnh</Label>
                <div className="flex items-center gap-4">
                    {imageUrl && (
                        <div className="relative w-24 h-24 border rounded-md overflow-hidden">
                            <Image src={imageUrl} alt="Product" fill className="object-cover" />
                            <button
                                type="button"
                                onClick={() => setImageUrl('')}
                                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-md hover:bg-red-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                    <div className="flex-1">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            className="curso-pointer"
                            disabled={uploading}
                        />
                        {uploading && <p className="text-xs text-muted-foreground mt-1">Đang tải ảnh...</p>}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="desc">Mô tả</Label>
                <Textarea
                    id="desc"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                />
            </div>

            <div className="flex flex-wrap items-center gap-6 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                    <Switch
                        id="active"
                        checked={isActive}
                        onCheckedChange={setIsActive}
                    />
                    <Label htmlFor="active">Đang kinh doanh</Label>
                </div>

                <div className="flex items-center gap-2">
                    <Switch
                        id="featured"
                        checked={isFeatured}
                        onCheckedChange={setIsFeatured}
                    />
                    <Label htmlFor="featured">Nổi bật (Home Page)</Label>
                </div>

                <div className="flex items-center gap-2">
                    <Switch
                        id="bestseller"
                        checked={isBestSeller}
                        onCheckedChange={setIsBestSeller}
                    />
                    <Label htmlFor="bestseller">Bán chạy</Label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Hủy bỏ
                </Button>
                <Button type="submit" disabled={loading || uploading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {initialData ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                </Button>
            </div>
        </form>
    )
}
