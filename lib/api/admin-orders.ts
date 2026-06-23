import apiClient from '../api-client';

export interface OrderListDto {
  id: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  paidAt?: string;
}

export interface OrderItemDto {
  id: number;
  productId?: number;
  customProductId?: number;
  productNameSnapshot: string;
  productImageSnapshot?: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
  customProduct?: {
    id: number;
    name: string;
    description?: string;
    notes?: string;
    stones: Array<{
      stoneId: number;
      stoneName: string;
      quantity: number;
      priceAtTime: number;
    }>;
  };
}

export interface OrderDetailDto {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  note?: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  payosOrderCode?: string;
  createdAt: string;
  paidAt?: string;
  items: OrderItemDto[];
}

export interface UpdateOrderStatusRequest {
  status: string;
}

export const adminOrdersApi = {
  // Lấy danh sách đơn hàng
  getAll: async (status?: string): Promise<OrderListDto[]> => {
    const params = status ? { status } : undefined;
    return apiClient.get('/admin/orders', { params });
  },

  // Lấy chi tiết đơn hàng
  getById: async (id: string): Promise<OrderDetailDto> => {
    return apiClient.get(`/admin/orders/${id}`);
  },

  // Cập nhật trạng thái đơn hàng
  updateStatus: async (id: string, status: string): Promise<void> => {
    return apiClient.patch(`/admin/orders/${id}/status`, { status });
  },
};
