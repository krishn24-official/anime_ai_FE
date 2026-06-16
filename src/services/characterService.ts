import { apiClient } from './apiClient';

export interface FrontendCharacter {
  id: string;
  name: string;
  nativeName?: string;
  image: string;
  description: string;
  anime: string;
  gender?: string;
  dob?: string; // MM-DD format
  type: 'character' | 'voice_actor';
}

const mapBackendCharacter = (item: any): FrontendCharacter => {
  const formatAnimeId = (id: string) => {
    return id
      .replace(/^anime_/, '')
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const animeList = Array.isArray(item.anime_ids)
    ? item.anime_ids.map(formatAnimeId).join(', ')
    : '';

  let dobStr = '';
  if (item.birth_month && item.birth_day) {
    dobStr = `${String(item.birth_month).padStart(2, '0')}-${String(item.birth_day).padStart(2, '0')}`;
  } else if (item.date_of_birth?.month && item.date_of_birth?.day) {
    dobStr = `${String(item.date_of_birth.month).padStart(2, '0')}-${String(item.date_of_birth.day).padStart(2, '0')}`;
  }

  return {
    id: item._id,
    name: item.name?.full || item.name || 'Unknown Character',
    nativeName: item.name?.native || item.native_name || '',
    image: item.images?.profile || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500',
    description: item.description || 'No description available.',
    anime: animeList,
    gender: item.gender || '',
    dob: dobStr || undefined,
    type: 'character',
  };
};

export const characterService = {
  /**
   * Fetch all characters
   */
  async fetchCharacters(): Promise<FrontendCharacter[]> {
    const data = await apiClient.get<any>('/characters');
    const items = Array.isArray(data) ? data : data.items || [];
    return items.map(mapBackendCharacter);
  },

  /**
   * Search characters by query
   */
  async searchCharacters(query: string): Promise<FrontendCharacter[]> {
    const data = await apiClient.get<any[]>(`/characters/search/${encodeURIComponent(query)}`);
    return (data || []).map(mapBackendCharacter);
  },

  /**
   * Fetch a single character by id
   */
  async fetchCharacter(id: string): Promise<FrontendCharacter> {
    const data = await apiClient.get<any>(`/characters/${id}`);
    return mapBackendCharacter(data);
  }
};
