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
  },

  /**
   * Fetch events and birthdays for a date range
   */
  async fetchScheduleRange(startDate: string, endDate: string) {
    try {
      const [eventsRes, birthdaysRes, releasesRes, announcedRes] = await Promise.all([
        apiClient.get<any[]>('/events/range', { params: { start_date: startDate, end_date: endDate } }),
        apiClient.get<any[]>('/characters/birthdays/range', { params: { start_date: startDate, end_date: endDate } }),
        apiClient.get<any[]>('/content/releases-range', { params: { start_date: startDate, end_date: endDate } }),
        apiClient.get<any[]>('/content/announced-range', { params: { start_date: startDate, end_date: endDate } })
      ]);

      const formatAnimeId = (id: string) => {
        return id
          .replace(/^anime_/, '')
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      const startDt = new Date(startDate + 'T00:00:00');
      const endDt = new Date(endDate + 'T00:00:00');
      const items: any[] = [];

      const datesToProcess = [];
      const current = new Date(startDt);
      while (current <= endDt) {
        const y = current.getFullYear();
        const m = current.getMonth() + 1;
        const d = current.getDate();
        datesToProcess.push({
          dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
          m,
          d
        });
        current.setDate(current.getDate() + 1);
      }

      const events = Array.isArray(eventsRes) ? eventsRes : [];
      const birthdays = Array.isArray(birthdaysRes) ? birthdaysRes : [];

      datesToProcess.forEach(({ dateStr, m, d }) => {
        const matchingEvents = events.filter(e => e.month === m && e.day === d);
        matchingEvents.forEach(e => {
          items.push({
            id: `ev_${e._id}_${dateStr}`,
            date: dateStr,
            type: 'event',
            name: e.name || 'Event',
            anime: e.anime_ids ? e.anime_ids.map(formatAnimeId).join(', ') : 'Various',
            image: e.images?.poster || e.images?.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&q=80',
            description: e.description || 'Upcoming event!'
          });
        });

        const matchingBirthdays = birthdays.filter(b => b.birth_month === m && b.birth_day === d);
        matchingBirthdays.forEach(b => {
          items.push({
            id: `bday_${b._id}_${dateStr}`,
            date: dateStr,
            type: 'birthday',
            name: b.name?.full || b.name || 'Unknown',
            anime: b.anime_ids ? b.anime_ids.map(formatAnimeId).join(', ') : '',
            image: b.images?.profile || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&q=80',
            description: `Birthday celebration for ${b.name?.full || b.name}!`
          });
        });
      });

      const releases = Array.isArray(releasesRes) ? releasesRes : [];
      const announced = Array.isArray(announcedRes) ? announcedRes : [];

      releases.forEach((r, idx) => {
        let desc = `${r.title} releases today!`;
        if (r.event_type === 'release_end') {
          desc = `${r.title}'s run ends today`;
        }
        items.push({
          id: `rel_${r.content_id}_${r.date}_${idx}`,
          date: r.date,
          type: r.event_type,
          name: r.title,
          anime: r.content_type === 'tv_series' ? 'TV Series' : r.content_type === 'movie' ? 'Movie' : 'Anime',
          image: r.poster_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&q=80',
          description: desc
        });
      });

      announced.forEach((a, idx) => {
        items.push({
          id: `ann_${a.content_id}_${a.pinned_date}_${idx}`,
          date: a.pinned_date,
          type: a.event_type,
          name: a.title,
          anime: a.content_type === 'tv_series' ? 'TV Series' : a.content_type === 'movie' ? 'Movie' : 'Anime',
          image: a.poster_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&q=80',
          description: `${a.title} is expected around ${a.label}`
        });
      });

      return items;
    } catch (error) {
      console.error('Failed to fetch schedule range:', error);
      return [];
    }
  }
};
