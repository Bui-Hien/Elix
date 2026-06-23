import apiClient from '../api-client';

export interface Purpose {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    gradient: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreatePurposeDto {
    name: string;
    description?: string;
    icon?: string;
    gradient?: string;
    isActive: boolean;
}

export interface UpdatePurposeDto {
    name: string;
    description?: string;
    icon?: string;
    gradient?: string;
    isActive: boolean;
}

export const adminPurposesApi = {
    // Lấy tất cả mục đích
    getAll: async (isActive?: boolean): Promise<Purpose[]> => {
        const params = isActive !== undefined ? { isActive } : undefined;
        return apiClient.get('/admin/purposes', { params });
    },

    // Lấy chi tiết mục đích
    getById: async (id: number): Promise<Purpose> => {
        return apiClient.get(`/admin/purposes/${id}`);
    },

    // Tạo mục đích mới
    create: async (data: CreatePurposeDto): Promise<Purpose> => {
        return apiClient.post('/admin/purposes', data);
    },

    // Cập nhật mục đích
    update: async (id: number, data: UpdatePurposeDto): Promise<void> => {
        return apiClient.put(`/admin/purposes/${id}`, data);
    },

    // Xóa mục đích
    delete: async (id: number): Promise<void> => {
        return apiClient.delete(`/admin/purposes/${id}`);
    },
};
