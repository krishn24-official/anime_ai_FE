import { apiClient } from './apiClient';

export interface TrendingItem {
  content_type: string;
  content_id: string;
  title: string;
  poster_image: string | null;
  reason: string;
  pinned: boolean;
  set_at: string;
  note?: string;
}

export const trendingService = {
  fetchTrending: async (limit: number = 10): Promise<TrendingItem[]> => {
    return await apiClient.get<TrendingItem[]>('/content/trending', { params: { limit } });
  },

  adminSetTrending: async (payload: FormData) => {
    return await apiClient.post('/admin/trending', payload);
  },

  adminRemoveTrending: async (contentType: string, contentId: string) => {
    return await apiClient.delete(`/admin/trending/${contentType}/${contentId}`);
  },

  adminListTrending: async (): Promise<TrendingItem[]> => {
    return await apiClient.get<TrendingItem[]>('/admin/trending');
  }
};
