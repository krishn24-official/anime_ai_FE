import { apiClient } from './apiClient';
import type { TierList } from '../types';

export interface SearchResultItem {
  content_type: 'character' | 'anime' | 'manga' | 'movie' | 'tv_series';
  content_id: string;
  name: string;
  image: string;
}

export const tierListService = {
  async getMyTierLists(): Promise<TierList[]> {
    return apiClient.get<TierList[]>('/tier-lists/my');
  },

  async getPublicTierLists(page = 1, limit = 20): Promise<{ items: TierList[]; total: number; page: number; limit: number }> {
    return apiClient.get<{ items: TierList[]; total: number; page: number; limit: number }>('/tier-lists/public', {
      params: { page, limit }
    });
  },

  async getTierListById(id: string): Promise<TierList> {
    return apiClient.get<TierList>(`/tier-lists/${id}`);
  },

  async createTierList(data: { name: string; tiers: any[]; is_public: boolean }): Promise<TierList> {
    return apiClient.post<TierList>('/tier-lists', data);
  },

  async updateTierList(id: string, data: { name?: string; tiers?: any[]; is_public?: boolean }): Promise<TierList> {
    return apiClient.put<TierList>(`/tier-lists/${id}`, data);
  },

  async deleteTierList(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/tier-lists/${id}`);
  },

  async searchContent(query: string, contentType?: string): Promise<SearchResultItem[]> {
    const params: Record<string, string | number> = { q: query };
    if (contentType) {
      params.content_type = contentType;
    }
    return apiClient.get<SearchResultItem[]>('/tier-lists/search', { params });
  }
};
