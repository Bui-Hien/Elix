import useSWR from 'swr';
import apiClient from '@/lib/api-client';
import { Tag } from '@/types';

const fetcher = (url: string) => apiClient.get(url).then((res) => res as any);

const EMPTY_TAGS: Tag[] = [];

export function useTags() {
    const { data, error, isLoading } = useSWR<Tag[]>('/tags', fetcher);

    return {
        tags: data || EMPTY_TAGS,
        isLoading,
        isError: error,
    };
}
