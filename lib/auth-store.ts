"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types"
import { mockUsers } from "@/lib/data"

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAdmin: () => boolean
}

interface RegisterData {
  email: string
  password: string
  name: string
  phone?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Check against mock users (in real app, this would be an API call)
        const user = mockUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        )

        if (!user) {
          set({ isLoading: false })
          return { success: false, error: "Email khong ton tai trong he thong" }
        }

        // In mock auth, we accept any password for demo purposes
        // In production, you would verify the password hash
        if (password.length < 6) {
          set({ isLoading: false })
          return { success: false, error: "Mat khau phai co it nhat 6 ky tu" }
        }

        set({ user, isLoading: false })
        return { success: true }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true })

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Check if email already exists
        const existingUser = mockUsers.find(
          (u) => u.email.toLowerCase() === data.email.toLowerCase()
        )

        if (existingUser) {
          set({ isLoading: false })
          return { success: false, error: "Email da duoc su dung" }
        }

        // Create new user (in mock, we just create locally)
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: data.email,
          name: data.name,
          phone: data.phone || null,
          avatar: null,
          role: "USER",
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // Add to mock users (note: this won't persist across page refreshes in mock mode)
        mockUsers.push(newUser)

        set({ user: newUser, isLoading: false })
        return { success: true }
      },

      logout: () => {
        set({ user: null })
      },

      isAdmin: () => {
        const { user } = get()
        return user?.role === "ADMIN"
      },
    }),
    {
      name: "gemstone-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
)
