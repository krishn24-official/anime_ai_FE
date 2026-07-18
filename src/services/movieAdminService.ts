import { apiClient } from './apiClient';

export interface MovieFormData {
  title: string;
  original_title: string;
  released: boolean;
  sub_status: string;
  day: number | null;
  month: number | null;
  year: number | null;
  precision: 'day' | 'month' | 'year';
  runtime_minutes: number | null;
  genres: string[];
  director: string[];
  writers: string[];
  producers: string[];
  production_house: string[];
  actors: string[];
  plot: string;
  language: string[];
  country: string[];
  tagline: string;
  trailers: {url: string, label: string}[];
  poster: File | null;
  backdrop: File | null;
}

export const movieAdminService = {
  createMovie: async (data: MovieFormData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.original_title) formData.append('original_title', data.original_title);
    formData.append('released', String(data.released));
    formData.append('sub_status', data.sub_status);
    if (data.day) formData.append('day', String(data.day));
    if (data.month) formData.append('month', String(data.month));
    if (data.year) formData.append('year', String(data.year));
    formData.append('precision', data.precision);
    if (data.runtime_minutes) formData.append('runtime_minutes', String(data.runtime_minutes));
    
    formData.append('genres', JSON.stringify(data.genres));
    formData.append('director', JSON.stringify(data.director));
    formData.append('writers', JSON.stringify(data.writers));
    formData.append('producers', JSON.stringify(data.producers));
    formData.append('production_house', JSON.stringify(data.production_house));
    formData.append('actors', JSON.stringify(data.actors));
    if (data.plot) formData.append('plot', data.plot);
    formData.append('language', JSON.stringify(data.language));
    formData.append('country', JSON.stringify(data.country));
    if (data.tagline) formData.append('tagline', data.tagline);
    if (data.trailers) formData.append('trailers', JSON.stringify(data.trailers));
    
    if (data.poster) formData.append('poster', data.poster);
    if (data.backdrop) formData.append('backdrop', data.backdrop);

    return await apiClient.post<{ status: string; content_id: string }>('/admin/movies', formData);
  },

  updateMovie: async (contentId: string, data: Partial<MovieFormData>) => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.original_title !== undefined) formData.append('original_title', data.original_title || '');
    if (data.released !== undefined) formData.append('released', String(data.released));
    if (data.sub_status) formData.append('sub_status', data.sub_status);
    if (data.day !== undefined) formData.append('day', data.day ? String(data.day) : '');
    if (data.month !== undefined) formData.append('month', data.month ? String(data.month) : '');
    if (data.year !== undefined) formData.append('year', data.year ? String(data.year) : '');
    if (data.precision) formData.append('precision', data.precision);
    if (data.runtime_minutes !== undefined) formData.append('runtime_minutes', data.runtime_minutes ? String(data.runtime_minutes) : '');
    
    if (data.genres) formData.append('genres', JSON.stringify(data.genres));
    if (data.director) formData.append('director', JSON.stringify(data.director));
    if (data.writers) formData.append('writers', JSON.stringify(data.writers));
    if (data.producers) formData.append('producers', JSON.stringify(data.producers));
    if (data.production_house) formData.append('production_house', JSON.stringify(data.production_house));
    if (data.actors) formData.append('actors', JSON.stringify(data.actors));
    if (data.plot !== undefined) formData.append('plot', data.plot || '');
    if (data.language) formData.append('language', JSON.stringify(data.language));
    if (data.country) formData.append('country', JSON.stringify(data.country));
    if (data.tagline !== undefined) formData.append('tagline', data.tagline || '');
    if (data.trailers !== undefined) formData.append('trailers', JSON.stringify(data.trailers));
    
    if (data.poster) formData.append('poster', data.poster);
    if (data.backdrop) formData.append('backdrop', data.backdrop);

    return await apiClient.patch<{ status: string }>(`/admin/movies/${contentId}`, formData);
  },

  deleteMovie: async (contentId: string) => {
    return await apiClient.delete<{ status: string }>(`/admin/movies/${contentId}`);
  },

  listMovies: async (params: { include_deleted?: boolean, search?: string, limit?: number, skip?: number, needs_review?: boolean }) => {
    const query = new URLSearchParams();
    if (params.include_deleted) query.append('include_deleted', 'true');
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.skip) query.append('skip', params.skip.toString());
    if (params.needs_review) query.append('needs_review', 'true');
    
    return await apiClient.get<{ items: any[]; total: number }>(`/admin/movies?${query.toString()}`);
  }
};
