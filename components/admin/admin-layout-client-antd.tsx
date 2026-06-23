"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Layout, Menu, Avatar, Dropdown, Input, Badge, Breadcrumb } from "antd"
import type { MenuProps } from "antd"
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  SearchOutlined,
  ShopOutlined,
  BarChartOutlined,
  GoldOutlined,
} from "@ant-design/icons"
import { useAuthStore } from "@/lib/auth-store"
import { toast } from "sonner"

const { Header, Sider, Content } = Layout
const { Search } = Input

const mainNavigation = [
  { key: "/admin", label: "Tổng quan", icon: <DashboardOutlined /> },
  { key: "/admin/products", label: "Sản phẩm", icon: <ShoppingOutlined /> },
  { key: "/admin/orders", label: "Đơn hàng", icon: <ShoppingCartOutlined /> },
  { key: "/admin/customers", label: "Khách hàng", icon: <UserOutlined /> },
  { key: "/admin/settings", label: "Cài đặt", icon: <SettingOutlined /> },
]

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success("Đã đăng xuất thành công")
    router.push("/")
  }

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: (
        <div className="py-2">
          <div className="font-medium">{user?.name || "Admin"}</div>
          <div className="text-xs text-gray-500">{user?.email || "admin@gemstone.vn"}</div>
        </div>
      ),
    },
    { type: "divider" },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => router.push("/admin/settings"),
    },
    { type: "divider" },
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

  const breadcrumbItems = [
    { title: "Admin" },
    { title: mainNavigation.find((item) => item.key === selectedKey)?.label || "Dashboard" },
  ]

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={256}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <GoldOutlined style={{ fontSize: 24, color: "#1890ff" }} />
            {!collapsed && <span style={{ color: "white", fontSize: 16, fontWeight: 600 }}>GemStone</span>}
          </Link>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ marginTop: 16 }}
          items={mainNavigation.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: <Link href={item.key}>{item.label}</Link>,
          }))}
        />

        <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, padding: "0 16px" }}>
          <Menu
            theme="dark"
            mode="inline"
            items={[
              {
                key: "store",
                icon: <ShopOutlined />,
                label: <Link href="/">Quay lại cửa hàng</Link>,
              },
            ]}
          />
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 256, transition: "all 0.2s" }}>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <Breadcrumb items={breadcrumbItems} />

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Search
              placeholder="Tìm kiếm sản phẩm, đơn hàng..."
              style={{ width: 300 }}
              allowClear
            />

            <Badge count={5} size="small">
              <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Avatar
                style={{ cursor: "pointer", backgroundColor: "#1890ff" }}
                icon={<UserOutlined />}
                src={user?.avatar}
              >
                {user?.name?.charAt(0) || "A"}
              </Avatar>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: "24px", minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
