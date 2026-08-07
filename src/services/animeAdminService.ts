import { apiClient } from './apiClient';

export interface AdminAnimeItem {
  _id: string;
  title: any;
  images: any;
  status: string;
  release_date?: any;
  season?: string;
  year?: number;
  is_deleted?: boolean;
  needs_release_review?: boolean;
  end_date?: any;
}

export interface ListAnimeOptions {
  include_deleted?: boolean;
  search?: string;
  limit?: number;
  skip?: number;
  needs_review?: boolean;
  flagged_duplicates_only?: boolean;
}

export const animeAdminService = {
  async listAnimeAdmin(params: ListAnimeOptions) {
    const query = new URLSearchParams();
    if (params.include_deleted) query.append('include_deleted', 'true');
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.skip) query.append('skip', params.skip.toString());
    if (params.needs_review) query.append('needs_review', 'true');
    if (params.flagged_duplicates_only) query.append('flagged_duplicates_only', 'true');
    
    return apiClient.get<{items: AdminAnimeItem[], total: number}>(`/admin/anime?${query.toString()}`);
  },
  
  async createAnime(formData: FormData) {
    return apiClient.post('/admin/anime', formData);
  },
  
  async updateAnime(contentId: string, formData: FormData) {
    return apiClient.patch(`/admin/anime/${contentId}`, formData);
  },
  
  async deleteAnime(contentId: string) {
    return apiClient.delete(`/admin/anime/${contentId}`);
  },
  
  async dismissDuplicate(contentId: string) {
    return apiClient.post(`/admin/anime/${contentId}/dismiss-duplicate`);
  }
};
