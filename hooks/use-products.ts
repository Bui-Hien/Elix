import useSWR from 'swr';
import apiClient from '@/lib/api-client';
import { ProductListDto, Product } from '@/types';

const fetcher = (url: string) => apiClient.get(url).then((res) => {
    return res as any;
});

interface UseProductsParams {
    q?: string;
    minPrice?: number;
    maxPrice?: number;
    categoryId?: number;
    categoryIds?: number[];
    tagIds?: number[];
    element?: string;
    elements?: string[];
    gemstoneTypeId?: number;
    sort?: string;
    page?: number;
    pageSize?: number;
    lastId?: number;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    purposeIds?: number[];
}

export function useProducts(params?: UseProductsParams) {
    // Convert params to query string
    const query = new URLSearchParams();
    if (params) {
        if (params.q) query.append('q', params.q);
        if (params.minPrice) query.append('minPrice', params.minPrice.toString());
        if (params.maxPrice) query.append('maxPrice', params.maxPrice.toString());
        if (params.categoryId) query.append('categoryId', params.categoryId.toString());
        if (params.categoryIds && params.categoryIds.length > 0) {
            params.categoryIds.forEach(id => query.append('categoryIds', id.toString()));
        }
        if (params.tagIds && params.tagIds.length > 0) {
            params.tagIds.forEach(id => query.append('tagIds', id.toString()));
        }
        if (params.purposeIds && params.purposeIds.length > 0) {
            params.purposeIds.forEach(id => query.append('purposeIds', id.toString()));
        }
        if (params.element) query.append('element', params.element);
        if (params.elements && params.elements.length > 0) {
            params.elements.forEach(e => query.append('elements', e));
        }
        if (params.gemstoneTypeId) query.append('gemstoneTypeId', params.gemstoneTypeId.toString());

        if (params.sort) {
            let sortValue = params.sort;
            if (sortValue === 'price-asc') sortValue = 'price_asc';
            if (sortValue === 'price-desc') sortValue = 'price_desc';
            if (sortValue === 'newest') sortValue = 'newest'; // backend default
            // Note: rating and bestseller are not currently supported by backend text search
            query.append('sort', sortValue);
        }

        if (params.page) query.append('page', params.page.toString());
        if (params.pageSize) query.append('pageSize', params.pageSize.toString());
        if (params.lastId) query.append('lastId', params.lastId.toString());
        if (params.isFeatured !== undefined) query.append('isFeatured', params.isFeatured.toString());
        if (params.isBestSeller !== undefined) query.append('isBestSeller', params.isBestSeller.toString());
    }

    const { data, error, isLoading, mutate } = useSWR<any>(
        `/products?${query.toString()}`,
        fetcher
    );

    return {
        products: (data?.items || []) as Product[],
        pagination: {
            page: data?.page || 1,
            pageSize: data?.pageSize || 20,
            totalCount: data?.totalCount || 0,
            totalPages: data?.totalPages || 0,
        },
        isLoading,
        isError: error,
        mutate,
    };
}

export function useProduct(id: number | null) {
    const { data, error, isLoading } = useSWR<Product>(
        id ? `/products/${id}` : null,
        fetcher
    );

    return {
        product: data,
        isLoading,
        isError: error,
    };
}
