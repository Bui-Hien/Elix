import apiClient from '../api-client';
import { GemstoneType } from '@/types';

export interface CreateGemstoneRequest {
  name: string;
  description?: string;
}

export interface UpdateGemstoneRequest extends CreateGemstoneRequest {
  isActive: boolean;
}

export const gemstoneApi = {
  // Get all gemstones
  getAll: async (params?: {
    search?: string;
    isActive?: boolean;
  }): Promise<GemstoneType[]> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));

    const url = `/admin/gemstones${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(url);
  },

  // Get gemstone by ID
  getById: async (id: number): Promise<GemstoneType> => {
    return apiClient.get(`/admin/gemstones/${id}`);
  },

  // Create gemstone
  create: async (data: CreateGemstoneRequest): Promise<GemstoneType> => {
    return apiClient.post('/admin/gemstones', data);
  },

  // Update gemstone
  update: async (id: number, data: UpdateGemstoneRequest): Promise<GemstoneType> => {
    return apiClient.put(`/admin/gemstones/${id}`, data);
  },

  // Delete gemstone
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/admin/gemstones/${id}`);
  },

  // Get element options
  getElements: async (): Promise<Array<{ value: string; label: string }>> => {
    return apiClient.get('/admin/gemstones/elements');
  },
};
