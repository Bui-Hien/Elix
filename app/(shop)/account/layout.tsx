'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User, Package, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { logout } from '@/lib/redux/slices/authSlice'

interface AccountLayoutProps {
    children: React.ReactNode
}

export default function AccountLayout({ children }: AccountLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (mounted && !isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, mounted, router])

    if (!mounted) return null
    if (!isAuthenticated || !user) return null

    const handleLogout = () => {
        dispatch(logout())
        router.push('/')
    }

    const sidebarItems = [
        {
            title: 'Hồ sơ của tôi',
            href: '/account/profile',
            icon: User
        },
        {
            title: 'Đơn hàng',
            href: '/account/orders',
            icon: Package
        }
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 space-y-2">
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg mb-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                            {user.fullName?.[0] || 'U'}
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.title}
                                </Link>
                            )
                        })}

                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 px-4 py-3 h-auto font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                        </Button>
                    </nav>
                </aside>

                {/* Content */}
                <div className="flex-1 bg-card rounded-lg border p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}
