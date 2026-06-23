'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Package, Truck, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatPrice } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Order {
    id: string
    totalAmount: number
    status: string
    paymentStatus: string
    createdAt: string
    // Add other fields if needed from OrderListDto
}

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await apiClient.get<Order[]>('/orders')

                setOrders(data as any) // Type assertion if interceptor returns data directly
            } catch (error) {
                console.error('Failed to fetch orders', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted rounded animate-pulse" />
                ))}
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Chưa có đơn hàng nào</h3>
                <p className="text-muted-foreground mb-6">Bạn chưa mua sản phẩm nào của chúng tôi.</p>
                <Button asChild>
                    <Link href="/products">Mua sắm ngay</Link>
                </Button>
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
            case 'Processing': return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
            case 'Shipping': return 'bg-purple-100 text-purple-800 hover:bg-purple-100'
            case 'Completed': return 'bg-green-100 text-green-800 hover:bg-green-100'
            case 'Cancelled': return 'bg-red-100 text-red-800 hover:bg-red-100'
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Pending': return 'Chờ xử lý'
            case 'Processing': return 'Đang xử lý'
            case 'Shipping': return 'Đang giao'
            case 'Completed': return 'Hoàn thành'
            case 'Cancelled': return 'Đã hủy'
            default: return status
        }
    }

    const getPaymentStatusColor = (status: string) => {
        return status === 'Paid'
            ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
            : 'text-amber-600 bg-amber-50 border-amber-200'
    }

    const getPaymentStatusLabel = (status: string) => {
        return status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 transition-all hover:bg-muted/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg">DH-{order.id.substring(0, 8).toUpperCase()}</span>
                                    <Badge variant="outline" className={getStatusColor(order.status)}>
                                        {getStatusLabel(order.status)}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale: vi })}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="font-bold text-lg">{formatPrice(order.totalAmount)}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getPaymentStatusColor(order.paymentStatus)}`}>
                                        {getPaymentStatusLabel(order.paymentStatus)}
                                    </span>
                                </div>
                                {(order.status === 'Pending' || order.status === 'Cancelled') && order.paymentStatus !== 'Paid' && (
                                    <Button
                                        size="sm"
                                        onClick={async () => {
                                            try {
                                                toast.loading('Đang tạo link thanh toán...')
                                                const res = await apiClient.createPaymentLink(order.id)
                                                window.location.href = res.checkoutUrl
                                            } catch (error) {
                                                toast.dismiss()
                                                toast.error('Không thể tạo link thanh toán. Vui lòng thử lại sau.')
                                                console.error(error)
                                            }
                                        }}
                                    >
                                        Thanh toán lại
                                    </Button>
                                )}
                                {/* Can add 'View Details' button later */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
