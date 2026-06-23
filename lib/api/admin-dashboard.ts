import apiClient from '../api-client'

export interface DashboardStats {
  totalProducts: number
  totalActiveProducts: number
  totalUsers: number
  totalOrders: number
  periodRevenue: number
  periodOrdersCount: number
  pendingOrders: number
  completedOrders: number
  revenueByDay: RevenueByDay[]
  topProducts: TopProduct[]
  recentOrders: RecentOrder[]
}

export interface RevenueByDay {
  date: string
  revenue: number
  orderCount: number
}

export interface TopProduct {
  productId: number
  productName: string
  totalSold: number
  totalRevenue: number
}

export interface RecentOrder {
  id: string
  customerName: string
  totalAmount: number
  status: string
  paymentStatus: string
  createdAt: string
}

export const dashboardApi = {
  getStats: async (
    days?: number,
    startDate?: string,
    endDate?: string
  ): Promise<DashboardStats> => {
    let url = '/admin/dashboard/stats'
    const params = new URLSearchParams()

    if (startDate && endDate) {
      params.append('startDate', startDate)
      params.append('endDate', endDate)
    } else if (days !== undefined) {
      params.append('days', days.toString())
    }

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    return await apiClient.get(url)
  },
}
