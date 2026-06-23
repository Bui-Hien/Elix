"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Layout, Menu, Avatar, Dropdown, Breadcrumb, Button, Space, Divider, Spin } from "antd"
import type { MenuProps } from "antd"
import { ROLES, ROUTES } from "@/lib/constants"
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  ShopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GoldOutlined,
  TeamOutlined,
  AppstoreOutlined,
  FireOutlined,
} from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { logoutUser, setCredentials } from "@/lib/redux/slices/authSlice"
import { toast } from "sonner"

const { Header, Sider, Content } = Layout

const mainNavigation = [
  { key: "/admin", label: "Tổng quan", icon: <DashboardOutlined /> },
  { key: "/admin/products", label: "Sản phẩm", icon: <ShoppingOutlined /> },
  { key: "/admin/orders", label: "Đơn hàng", icon: <ShoppingCartOutlined /> },
  { key: "/admin/customers", label: "Khách hàng", icon: <TeamOutlined /> },
  { key: "/admin/categories", label: "Danh mục", icon: <AppstoreOutlined /> },
  { key: "/admin/purposes", label: "Mục đích", icon: <AppstoreOutlined /> },
  { key: "/admin/stones", label: "Đá & Charm", icon: <GoldOutlined /> },
  { key: "/admin/stone-categories", label: "Loại Đá & Charm", icon: <AppstoreOutlined /> },
  { key: "/admin/bracelet-bases", label: "Dây Vòng", icon: <GoldOutlined /> },
  { key: "/admin/elements", label: "Đặc Tính Ngũ Hành", icon: <FireOutlined /> },
  { key: "/admin/knowledge", label: "Knowledge Base", icon: <ShopOutlined /> },
  { key: "/admin/settings", label: "Cài đặt", icon: <SettingOutlined /> },
]

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, loading } = useAppSelector((state) => state.auth)
  const [collapsed, setCollapsed] = useState(false)
  const [isInitialCheck, setIsInitialCheck] = useState(true)

  // Load user from localStorage on mount (for page refresh UI only)
  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      const savedUser = localStorage.getItem('adminUser')
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          console.log('💾 Found potential admin in localStorage:', parsedUser.email)
          // We don't dispatch setCredentials here because it sets isAuthenticated: true
          // which causes a redirect loop if the backend is actually down.
          // Instead, we just wait for the real fetchUser in AuthLoader to verify.
        } catch (error) {
          console.error('❌ Failed to parse saved user:', error)
          localStorage.removeItem('adminUser')
        }
      }
    }
  }, [user])

  // Check if user is admin
  useEffect(() => {
    // Wait until loading is finished and initial check is done
    if (loading || isInitialCheck) {
      if (isInitialCheck) setIsInitialCheck(false);
      return;
    }

    console.log('🔐 Admin Layout - Final Auth Verification:', { user, role: user?.role })

    // After loading is done, verify auth
    if (!user) {
      console.warn('⚠️ No user found, redirecting to login')
      toast.error("Vui lòng đăng nhập để truy cập trang quản trị")
      router.push("/login")
      return
    }

    const roles = user.role || (user as any).Role || "";
    if (!roles.includes("Admin")) {
      console.warn('⚠️ User is not admin:', roles)
      toast.error("Bạn không có quyền truy cập trang quản trị")
      router.push("/")
      return
    }

    console.log('✅ Admin auth verified:', user.email)
  }, [user, loading, router, isInitialCheck])

  const handleLogout = async () => {
    try {
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminUser')
        console.log('🗑️ Cleared admin user from localStorage')
      }

      await dispatch(logoutUser()).unwrap()
      toast.success("Đã đăng xuất thành công")
      router.push("/login")
    } catch (error) {
      toast.error("Đăng xuất thất bại")
    }
  }

  // Show loading if still checking
  if (loading || isInitialCheck) {
    return (
      <Spin fullscreen size="large" tip="Đang kiểm tra quyền truy cập..." />
    )
  }

  const roles = user?.role || (user as any)?.Role || "";
  // Don't render if not admin (the redirect is handled in the useEffect above)
  if (!user || !roles.includes("Admin")) {
    return (
      <Spin fullscreen size="large" tip="Đang chuyển hướng..." />
    )
  }

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: (
        <div style={{ padding: "8px 0" }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{user?.fullName || "Admin"}</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            {user?.email || "admin@gemstone.vn"}
          </div>
        </div>
      ),
    },
    { type: "divider" as const },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt tài khoản",
      onClick: () => router.push("/admin/settings"),
    },
    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ]

  const selectedKey = mainNavigation.find(
    (item) => pathname === item.key || (item.key !== "/admin" && pathname.startsWith(item.key))
  )?.key || "/admin"

  const getBreadcrumbItems = () => {
    const items: { title: React.ReactNode }[] = [{ title: <Link href="/admin">Admin</Link> }]

    const currentNav = mainNavigation.find(
      (item) => pathname === item.key || (item.key !== "/admin" && pathname.startsWith(item.key))
    )

    if (currentNav && currentNav.key !== "/admin") {
      items.push({ title: currentNav.label as React.ReactNode })
    }

    if (pathname.includes("/new")) {
      items.push({ title: "Thêm mới" as React.ReactNode })
    } else if (pathname.includes("/edit")) {
      items.push({ title: "Chỉnh sửa" as React.ReactNode })
    }

    return items
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          background: "#ffffff",
          borderRight: "1px solid #f1f5f9",
          boxShadow: "2px 0 8px rgba(0,0,0,0.02)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? 0 : "0 24px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              }}
            >
              <GoldOutlined style={{ fontSize: 20, color: "white" }} />
            </div>
            {!collapsed && (
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.5px",
                }}
              >
                GemStone
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{
            border: "none",
            marginTop: 16,
            padding: "0 12px",
          }}
          items={mainNavigation.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: <Link href={item.key}>{item.label}</Link>,
            style: {
              borderRadius: 8,
              marginBottom: 4,
              height: 44,
              display: "flex",
              alignItems: "center",
            },
          }))}
        />

        {/* Bottom Menu */}
        <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, padding: "0 12px" }}>
          <Divider style={{ margin: "16px 0" }} />
          <Menu
            mode="inline"
            style={{ border: "none" }}
            items={[
              {
                key: "store",
                icon: <ShopOutlined />,
                label: <Link href="/">Quay lại cửa hàng</Link>,
                style: {
                  borderRadius: 8,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                },
              },
            ]}
          />
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: "all 0.2s" }}>
        <Header
          style={{
            padding: "0 32px",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f1f5f9",
            position: "sticky",
            top: 0,
            zIndex: 10,
            height: 72,
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          }}
        >
          <Space size={16}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: 18,
                width: 44,
                height: 44,
              }}
            />
            <Breadcrumb items={getBreadcrumbItems()} />
          </Space>

          <Space size={16}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar
                  size={40}
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "2px solid #f1f5f9",
                  }}
                  icon={<UserOutlined />}
                >
                  {user?.fullName?.charAt(0) || "A"}
                </Avatar>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>
                    {user?.fullName || "Admin"}
                  </span>
                  <span style={{ fontSize: 12, color: "#64748b", lineHeight: 1.2 }}>
                    Admin
                  </span>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: "24px 32px",
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
