import { apiClient } from './apiClient';
import type { FrontendCharacter } from './characterService';

export interface TodayEvents {
  birthdays: FrontendCharacter[];
  animeAnniversaries: any[];
  mangaAnniversaries: any[];
}

export const eventService = {
  /**
   * Fetch today's celebrations (birthdays & anniversaries)
   */
  async fetchTodayEvents(): Promise<TodayEvents> {
    try {
      const data = await apiClient.get<any>('/home/today');
      
      const formatAnimeId = (id: string) => {
        return id
          .replace(/^anime_/, '')
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      const mappedBirthdays: FrontendCharacter[] = (data.birthdays || []).map((item: any) => {
        const today = new Date();
        const dobStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        return {
          id: item._id,
          name: item.name?.full || item.name || 'Unknown Character',
          nativeName: item.name?.native || '',
          image: item.images?.profile || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500',
          description: item.description || `Happy birthday to ${item.name?.full || item.name}!`,
          anime: item.anime_ids ? item.anime_ids.map(formatAnimeId).join(', ') : '',
          dob: dobStr,
          type: 'character',
        };
      });

      return {
        birthdays: mappedBirthdays,
        animeAnniversaries: data.anime_anniversaries || [],
        mangaAnniversaries: data.manga_anniversaries || [],
      };
    } catch (error) {
      console.error('Failed to fetch today events:', error);
      return { birthdays: [], animeAnniversaries: [], mangaAnniversaries: [] };
    }
  }
};
