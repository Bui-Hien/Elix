import apiClient from '../api-client';
import { Tag } from '@/types';

export const tagsApi = {
  // Lấy tất cả tags
  getAll: async (): Promise<Tag[]> => {
    return apiClient.get('/tags');
  },

  // Lấy chi tiết tag
  getById: async (id: number): Promise<Tag> => {
    return apiClient.get(`/tags/${id}`);
  },
};
