import type React from "react"
import { App } from "antd"
import AntdRegistryProvider from "@/lib/AntdRegistry"
import { AdminLayoutClient } from "@/components/admin/admin-layout-modern"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AntdRegistryProvider>
      <App>
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </App>
    </AntdRegistryProvider>
  )
}
