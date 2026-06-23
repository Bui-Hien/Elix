import apiClient from '../api-client';
import { Product, PaginatedResponse } from '@/types';

export interface ProductQueryParams {
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  tagId?: number;
  isActive?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
  lastId?: number;
}

export const productsApi = {
  // Lấy danh sách sản phẩm (có phân trang và filter)
  getAll: async (params?: ProductQueryParams): Promise<any> => {
    return apiClient.get('/products', { params });
  },

  // Lấy chi tiết sản phẩm
  getById: async (id: number): Promise<Product> => {
    return apiClient.get(`/products/${id}`);
  },
};
