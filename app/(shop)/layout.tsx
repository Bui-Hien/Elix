import React from "react"
import { Header } from '@/components/layout/header'
import { ConditionalFooter } from '@/components/layout/conditional-footer'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Force rebuild - timestamp: 2026-02-13
  return (
    <>
      <Header />
      <main className="pt-16 md:pt-20 min-h-screen">
        {children}
      </main>
      <ConditionalFooter />
    </>
  )
}
