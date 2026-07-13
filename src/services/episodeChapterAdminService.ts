import { apiClient } from './apiClient';

export interface BaseEpisodeChapterPayload {
  release_date?: string;
  summary?: string;
}

export interface CreateEpisodePayload extends BaseEpisodeChapterPayload {
  parent_type: 'anime' | 'tv_series';
  parent_content_id: string;
  episode_number: number;
  title?: string;
  director?: string;
  arc?: string;
  is_filler?: boolean;
  canon_type?: string;
}

export interface UpdateEpisodePayload extends BaseEpisodeChapterPayload {
  title?: string;
  director?: string;
  arc?: string;
  is_filler?: boolean;
  canon_type?: string;
}

export interface CreateChapterPayload extends BaseEpisodeChapterPayload {
  manga_id: string;
  chapter_number: number;
}

export type UpdateChapterPayload = BaseEpisodeChapterPayload;

export const episodeChapterAdminService = {
  // Episodes
  listEpisodes: async (parentType: string, parentId: string, includeDeleted = false) => {
    const res = await apiClient.get<any[]>('/admin/episodes', {
      params: { parent_type: parentType, parent_id: parentId, include_deleted: includeDeleted }
    });
    return res;
  },

  createEpisode: async (payload: CreateEpisodePayload) => {
    const res = await apiClient.post<any>('/admin/episodes', payload);
    return res;
  },

  updateEpisode: async (contentId: string, payload: UpdateEpisodePayload) => {
    const res = await apiClient.patch<any>(`/admin/episodes/${contentId}`, payload);
    return res;
  },

  deleteEpisode: async (contentId: string) => {
    const res = await apiClient.delete<any>(`/admin/episodes/${contentId}`);
    return res;
  },

  // Chapters
  listChapters: async (mangaId: string, includeDeleted = false) => {
    const res = await apiClient.get<any[]>('/admin/chapters', {
      params: { manga_id: mangaId, include_deleted: includeDeleted }
    });
    return res;
  },

  createChapter: async (payload: CreateChapterPayload) => {
    const res = await apiClient.post<any>('/admin/chapters', payload);
    return res;
  },

  updateChapter: async (contentId: string, payload: UpdateChapterPayload) => {
    const res = await apiClient.patch<any>(`/admin/chapters/${contentId}`, payload);
    return res;
  },

  deleteChapter: async (contentId: string) => {
    const res = await apiClient.delete<any>(`/admin/chapters/${contentId}`);
    return res;
  }
};
