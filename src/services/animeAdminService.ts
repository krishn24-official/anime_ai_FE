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
}

export const animeAdminService = {
  async listAnimeAdmin(params: { include_deleted?: boolean, search?: string, limit?: number, skip?: number, needs_review?: boolean }) {
    const query = new URLSearchParams();
    if (params.include_deleted) query.append('include_deleted', 'true');
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.skip) query.append('skip', params.skip.toString());
    if (params.needs_review) query.append('needs_review', 'true');
    
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
  }
};
