import { apiClient } from './apiClient';

export interface AdminCharacterItem {
  _id: string;
  name: string;
  native_name: string | null;
  role: string;
  gender: string | null;
  status: string;
  species: string;
  images: {
    profile: string | null;
    banner: string | null;
  };
  is_deleted: boolean;
  birth_day?: number;
  birth_month?: number;
  physical?: {
    height?: string;
    hair_color?: string;
    has_hair?: boolean;
  };
  description?: string;
  anime_ids?: string[];
  manga_ids?: string[];
  affiliations?: string[];
  abilities?: string[];
  forms?: string[];
  tags?: string[];
}

export interface CharacterListResponse {
  items: AdminCharacterItem[];
  total: number;
}

export const characterAdminService = {
  listCharactersAdmin: async (params: {
    search?: string;
    include_deleted?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<CharacterListResponse> => {
    const response = await apiClient.get('/admin/characters', { params: params as any }) as any;
    return response;
  },

  createCharacter: async (formData: FormData): Promise<{ content_id: string }> => {
    const response = await apiClient.post('/admin/characters', formData) as any;
    return response;
  },

  updateCharacter: async (contentId: string, formData: FormData): Promise<void> => {
    await apiClient.patch(`/admin/characters/${contentId}`, formData);
  },

  deleteCharacter: async (contentId: string): Promise<void> => {
    await apiClient.delete(`/admin/characters/${contentId}`);
  }
};
