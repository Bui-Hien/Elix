'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { setCredentials } from '@/lib/redux/slices/authSlice'
import apiClient from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const profileSchema = z.object({
    fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
    address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
    const { user, token } = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema)
    })

    useEffect(() => {
        if (user) {
            setValue('fullName', user.fullName)
            setValue('phone', user.phone)
            setValue('address', user.address)
        }
    }, [user, setValue])

    const onSubmit = async (data: ProfileFormValues) => {
        setLoading(true)
        try {
            await apiClient.put('/auth/profile', data)
            toast.success('Cập nhật hồ sơ thành công!')

            if (user && token) {
                // Create a new user object compatible with the User type
                // assuming User type has id, email, fullName, etc.
                // We merge existing user with new data
                const updatedUser = { ...user, ...data }
                dispatch(setCredentials({ user: updatedUser, token }))
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật hồ sơ')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-xl">
            <h1 className="text-2xl font-bold mb-6">Hồ sơ cá nhân</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input
                        id="fullName"
                        {...register('fullName')}
                        placeholder="Nhập họ và tên"
                    />
                    {errors.fullName && (
                        <p className="text-sm text-destructive">{errors.fullName.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                        id="phone"
                        {...register('phone')}
                        placeholder="Nhập số điện thoại"
                    />
                    {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                        id="address"
                        {...register('address')}
                        placeholder="Nhập địa chỉ giao hàng"
                    />
                    {errors.address && (
                        <p className="text-sm text-destructive">{errors.address.message}</p>
                    )}
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
            </form>
        </div>
    )
}
