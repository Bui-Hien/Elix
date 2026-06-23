import apiClient from '../api-client';
import { Category } from '@/types';

export const categoriesApi = {
  // Lấy tất cả danh mục
  getAll: async (): Promise<Category[]> => {
    return apiClient.get('/categories');
  },

  // Lấy chi tiết danh mục
  getById: async (id: number): Promise<Category> => {
    return apiClient.get(`/categories/${id}`);
  },
};
