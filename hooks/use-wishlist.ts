import useSWR from 'swr';
import apiClient from '@/lib/api-client';
import { WishlistItem } from '@/types';
import { useAppSelector } from '@/lib/redux/hooks';

const fetcher = (url: string) => apiClient.get(url).then((res) => res as any);

export function useWishlist() {
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const { data, error, isLoading, mutate } = useSWR<WishlistItem[]>(
        isAuthenticated ? '/wishlist' : null,
        fetcher
    );

    const toggleWishlist = async (productId: number) => {
        try {
            const result = await apiClient.post('/wishlist/toggle', { productId });
            mutate();
            return result; // true (added) or false (removed)
        } catch (error) {
            console.error('Failed to toggle wishlist:', error);
            throw error;
        }
    };

    const clearWishlist = async () => {
        try {
            await apiClient.delete('/wishlist');
            mutate(undefined, { revalidate: false }); // Optimistic clear
        } catch (error) {
            console.error('Failed to clear wishlist:', error);
            throw error;
        }
    };

    return {
        wishlist: data || [],
        isLoading,
        isError: error,
        toggleWishlist,
        clearWishlist,
    };
}
