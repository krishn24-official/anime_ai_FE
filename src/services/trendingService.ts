import { apiClient } from './apiClient';
import type { PinTrendingInput, TrendingItem } from '../domain/trending';
import { toTrendingItem, type TrendingItemDto } from './trendingMapper';

export type { TrendingItem } from '../domain/trending';

export const trendingService = {
  fetchTrending: async (limit: number = 10): Promise<TrendingItem[]> => {
    const dtos = await apiClient.get<TrendingItemDto[]>('/content/trending', { params: { limit } });
    return dtos.map(toTrendingItem);
  },

  adminListTrending: async (): Promise<TrendingItem[]> => {
    const dtos = await apiClient.get<TrendingItemDto[]>('/admin/trending');
    return dtos.map(toTrendingItem);
  },

  adminPin: async (input: PinTrendingInput): Promise<void> => {
    const form = new FormData();
    form.append('content_type', input.contentType);
    form.append('content_id', input.contentId);
    if (input.note) form.append('note', input.note);
    if (input.expiresAt) form.append('expires_at', input.expiresAt);
    if (input.image) form.append('image', input.image);
    await apiClient.post('/admin/trending', form);
  },

  adminUnpin: async (contentType: string, contentId: string): Promise<void> => {
    await apiClient.delete(
      `/admin/trending/${encodeURIComponent(contentType)}/${encodeURIComponent(contentId)}`
    );
  },
};
