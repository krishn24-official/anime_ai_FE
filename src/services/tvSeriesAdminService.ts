import { apiClient } from './apiClient';

export interface AdminTvSeriesItem {
  _id: string;
  title: string;
  original_title: string;
  first_air_date: string | null;
  first_air_precision: {
    year: number;
    month?: number;
    day?: number;
    precision: string;
  } | null;
  last_air_date: string | null;
  last_air_precision: {
    year: number;
    month?: number;
    day?: number;
    precision: string;
  } | null;
  year: number;
  status: string;
  is_deleted: boolean;
  needs_release_review?: boolean;
}

export interface AdminTvSeriesResponse {
  items: AdminTvSeriesItem[];
  total: number;
  page: number;
  pages: number;
}

export const tvSeriesAdminService = {
  listTvSeriesAdmin: async (
    includeDeleted: boolean = false, 
    search: string = '', 
    limit: number = 50, 
    skip: number = 0,
    needsReview: boolean = false
  ): Promise<AdminTvSeriesResponse> => {
    const params = new URLSearchParams();
    if (includeDeleted) params.append('include_deleted', 'true');
    if (needsReview) params.append('needs_review', 'true');
    if (search) params.append('search', search);
    params.append('limit', limit.toString());
    params.append('skip', skip.toString());
    
    const response = await apiClient.get<AdminTvSeriesResponse>(`/admin/tv-series?${params.toString()}`);
    return response;
  },

  createTvSeries: async (formData: FormData): Promise<{status: string, content_id: string}> => {
    const response = await apiClient.post<{status: string, content_id: string}>('/admin/tv-series', formData);
    return response;
  },

  updateTvSeries: async (contentId: string, formData: FormData): Promise<{status: string}> => {
    const response = await apiClient.patch<{status: string}>(`/admin/tv-series/${contentId}`, formData);
    return response;
  },

  deleteTvSeries: async (contentId: string): Promise<{status: string}> => {
    const response = await apiClient.delete<{status: string}>(`/admin/tv-series/${contentId}`);
    return response;
  }
};
