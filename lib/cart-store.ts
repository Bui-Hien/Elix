'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getSubtotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, quantity = 1) => {
        // Sanitize quantity
        const safeQuantity = Number.isNaN(quantity) ? 1 : Math.max(1, quantity)

        set((state) => {
          const existingItem = state.items.find(item => item.product.id.toString() === product.id.toString())

          if (existingItem) {
            return {
              items: state.items.map(item => {
                if (item.product.id.toString() === product.id.toString()) {
                  const currentQty = Number.isNaN(item.quantity) ? 1 : (item.quantity || 1)
                  return { ...item, quantity: Math.min(currentQty + safeQuantity, product.stock ?? 999) }
                }
                return item
              })
            }
          }

          return {
            items: [...state.items, { product, quantity: Math.min(safeQuantity, product.stock ?? 999) }]
          }
        })
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter(item => item.product.id.toString() !== productId)
        }))
      },

      updateQuantity: (productId: string, quantity: number) => {
        const safeQuantity = Number.isNaN(quantity) ? 1 : Math.max(1, quantity)
        set((state) => ({
          items: state.items.map(item =>
            item.product.id.toString() === productId
              ? { ...item, quantity: Math.max(1, Math.min(safeQuantity, item.product.stock ?? 999)) }
              : item
          )
        }))
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        const { items } = get()
        return items.reduce((sum, item) => {
          // Handle both price and Price (sometimes backend case differs)
          // @ts-ignore
          const price = item.product.price ?? item.product.Price ?? 0
          const quantity = Number.isNaN(item.quantity) ? 1 : (item.quantity || 1)
          return sum + (price * quantity)
        }, 0)
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        // Miễn phí vận chuyển cho tất cả đơn hàng
        const shippingFee = 0
        return subtotal + shippingFee
      },

      getItemCount: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.quantity, 0)
      }
    }),
    {
      name: 'gemstone-cart',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Fix any corrupted quantities on load
          state.items = (state.items || []).map(item => ({
            ...item,
            quantity: (Number.isNaN(item.quantity) || typeof item.quantity !== 'number') ? 1 : Math.max(1, item.quantity)
          }))
        }
      }
    }
  )
)
