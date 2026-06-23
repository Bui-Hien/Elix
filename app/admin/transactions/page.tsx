'use client'

import { useEffect, useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatPrice, formatDate } from '@/lib/data'

interface Transaction {
    id: string;
    orderId: string;
    amount: number;
    description: string;
    transactionDateTime: string;
    accountNumber: string;
    orderCode: string;
    createdAt: string;
}

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response: any = await apiClient.get('/admin/transactions')
                // Check structure, backend returns { data: [], total: ... }
                if (response.data) {
                    setTransactions(response.data)
                } else {
                    setTransactions((response as any) || [])
                }
            } catch (error) {
                console.error('Failed to fetch transactions', error)
            } finally {
                setLoading(false)
            }
        }
        fetchTransactions()
    }, [])

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Giao dịch tài chính</h1>
                <p className="text-muted-foreground">
                    Lịch sử các giao dịch thanh toán qua ngân hàng
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lịch sử giao dịch</CardTitle>
                    <CardDescription>
                        Tất cả các giao dịch nhận được từ cổng thanh toán / ngân hàng
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã Giao Dịch</TableHead>
                                <TableHead>Mã Đơn</TableHead>
                                <TableHead>Số Tiền</TableHead>
                                <TableHead>Nội Dung</TableHead>
                                <TableHead>Thời Gian</TableHead>
                                <TableHead>Tài Khoản Gửi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Chưa có giao dịch nào được ghi nhận.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="font-mono text-xs">{tx.id.slice(0, 8)}...</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono">{tx.orderCode || 'N/A'}</Badge>
                                        </TableCell>
                                        <TableCell className="font-medium text-emerald-600">
                                            +{formatPrice(tx.amount)}
                                        </TableCell>
                                        <TableCell className="max-w-[250px] truncate text-sm text-muted-foreground" title={tx.description}>
                                            {tx.description}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {tx.transactionDateTime ? tx.transactionDateTime : formatDate(tx.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-sm font-mono">
                                            {tx.accountNumber || 'N/A'}
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
