import { apiClient } from './apiClient';

export const actorAdminService = {
  createActor: async (formData: FormData): Promise<{status: string, content_id: string}> => {
    return await apiClient.post<{status: string, content_id: string}>('/admin/actors', formData);
  },
  updateActor: async (contentId: string, formData: FormData): Promise<{status: string}> => {
    return await apiClient.patch<{status: string}>(`/admin/actors/${contentId}`, formData);
  },
  deleteActor: async (contentId: string): Promise<{status: string}> => {
    return await apiClient.delete<{status: string}>(`/admin/actors/${contentId}`);
  }
};
