'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Star,
  CreditCard,
  List,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AdminLayoutClientProps {
  children: React.ReactNode
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      title: 'Sản phẩm',
      href: '/admin/products',
      icon: Package,
    },
    {
      title: 'Đơn hàng',
      href: '/admin/orders',
      icon: ShoppingCart,
    },
    {
      title: 'Khách hàng',
      href: '/admin/customers',
      icon: Users,
    },
    {
      title: 'Bài viết (Blog)',
      href: '/admin/blog',
      icon: FileText,
    },
    {
      title: 'Đánh giá',
      href: '/admin/reviews',
      icon: Star,
    },
    {
      title: 'Tài chính',
      href: '/admin/transactions',
      icon: CreditCard,
    },
    {
      title: 'Danh mục & Tags',
      href: '/admin/categories',
      icon: List,
    }
  ]

  const handleLogout = async () => {
    try {
      // Clear auth state here (cookie is HttpOnly, so rely on backend to clear, or just redirect)
      // For now, simple redirect
      router.push('/')
      toast.success('Đã đăng xuất')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0",
          !sidebarOpen && "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span>Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden ml-auto text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-violet-600 text-white shadow-md shadow-violet-900/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex ml-auto items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">Administrator</p>
                <p className="text-xs text-muted-foreground">System Admin</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-medium text-xs">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
