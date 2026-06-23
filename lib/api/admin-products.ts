import apiClient from '../api-client';
import { Product } from '@/types';

export interface CreateProductDto {
  name: string;
  price: number;
  description?: string;
  detailedDescription?: string;
  imageUrl?: string;
  imageUrls?: string[];
  policy?: string;
  categoryId?: number;
  tagIds?: number[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  element?: string;
  gemstoneTypeId?: number;
  purposeIds?: number[];
  stockQuantity?: number;
}

export interface UpdateProductDto {
  name: string;
  price: number;
  description?: string;
  detailedDescription?: string;
  imageUrl?: string;
  imageUrls?: string[];
  policy?: string;
  isActive: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  categoryId?: number;
  tagIds?: number[];
  element?: string;
  gemstoneTypeId?: number;
  purposeIds?: number[];
  stockQuantity?: number;
}

export interface ProductDetailResponse {
  id: number;
  name: string;
  price: number;
  description?: string;
  detailedDescription?: string;
  imageUrl?: string;
  imageUrls?: string[];
  element?: string;
  policy?: string;
  isActive: boolean;
  createdAt: string;
  category?: {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
  };
  tags?: Array<{
    id: number;
    name: string;
    isActive: boolean;
  }>;
  purposes?: Array<{
    id: number;
    name: string;
    isActive: boolean;
  }>;
}

export const adminProductsApi = {
  // Lấy tất cả sản phẩm (admin)
  getAll: async (q?: string): Promise<ProductDetailResponse[]> => {
    const params = q ? { q } : undefined;
    return apiClient.get('/admin/products', { params });
  },

  // Tạo sản phẩm mới
  create: async (data: CreateProductDto): Promise<ProductDetailResponse> => {
    return apiClient.post('/admin/products', data);
  },

  // Cập nhật sản phẩm
  update: async (id: number, data: UpdateProductDto): Promise<void> => {
    return apiClient.put(`/admin/products/${id}`, data);
  },

  // Thay đổi trạng thái sản phẩm
  changeStatus: async (id: number, isActive: boolean): Promise<void> => {
    return apiClient.patch(`/admin/products/${id}/status`, isActive, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  // Xóa sản phẩm (soft delete)
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/admin/products/${id}`);
  },
};
