import useSWR from 'swr';
import apiClient from '@/lib/api-client';
import { Cart } from '@/types';
import { useAppSelector } from '@/lib/redux/hooks';

const fetcher = (url: string) => apiClient.get(url).then((res) => res as any);

export function useCart() {
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const { data, error, isLoading, mutate } = useSWR<Cart>(
        isAuthenticated ? '/cart' : null,
        fetcher
    );

    const addToCart = async (productId: number, quantity: number) => {
        try {
            await apiClient.post('/cart/items', { productId, quantity });
            mutate(); // Refresh cart
        } catch (error) {
            console.error('Failed to add to cart:', error);
            throw error;
        }
    };

    const updateQuantity = async (productId: number, quantity: number) => {
        try {
            await apiClient.put(`/cart/items/${productId}`, { quantity });
            mutate();
        } catch (error) {
            console.error('Failed to update quantity:', error);
            throw error;
        }
    };

    const removeItem = async (productId: number) => {
        try {
            await apiClient.delete(`/cart/items/${productId}`);
            mutate();
        } catch (error) {
            console.error('Failed to remove item:', error);
            throw error;
        }
    };

    const removeCustomItem = async (customProductId: number) => {
        try {
            await apiClient.delete(`/cart/custom-items/${customProductId}`);
            mutate();
        } catch (error) {
            console.error('Failed to remove custom item:', error);
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            await apiClient.delete('/cart');
            mutate(); // Should return empty cart
        } catch (error) {
            console.error('Failed to clear cart:', error);
            throw error;
        }
    };

    const addCustomItemToCart = async (customProductId: number, quantity: number = 1) => {
        try {
            await apiClient.post('/cart/custom-items', { customProductId, quantity });
            mutate();
        } catch (error) {
            console.error('Failed to add custom item to cart:', error);
            throw error;
        }
    };

    return {
        cart: data,
        isLoading,
        isError: error,
        addToCart,
        updateQuantity,
        removeItem,
        removeCustomItem,
        addCustomItemToCart,
        clearCart,
        refreshCart: mutate,
    };
}
