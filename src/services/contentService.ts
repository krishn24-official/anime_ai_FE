import { apiClient } from './apiClient';
import type { ContentItem, Comment } from '../types';

// Map frontend categories to backend types
export const CATEGORY_MAP = {
  'Anime': 'anime',
  'Manga': 'manga',
  'Movies': 'movie',
  'TV-Series': 'tv_series',
} as const;

export type FrontendCategory = keyof typeof CATEGORY_MAP;
export type BackendContentType = typeof CATEGORY_MAP[FrontendCategory];

// Map backend ratings to frontend stars
const RATING_TO_STARS: Record<string, number> = {
  'Skip': 1,
  'Timepass': 3,
  'Go for it': 4,
  'Perfection': 5,
};

// Map frontend stars to backend ratings
const STARS_TO_RATING = (stars: number): 'Skip' | 'Timepass' | 'Go for it' | 'Perfection' => {
  if (stars <= 2) return 'Skip';
  if (stars === 3) return 'Timepass';
  if (stars === 4) return 'Go for it';
  return 'Perfection';
};

export interface BackendAnime {
  _id: string;
  title: {
    english?: string;
    romaji?: string;
    japanese?: string;
  };
  genres?: string[];
  year?: number;
  rating?: {
    anilist?: number;
  };
  images?: {
    poster?: string;
  };
  synonyms?: string[];
}

export interface BackendManga {
  _id: string;
  name: string;
  cover_image?: string;
  description?: string;
  start_date?: string;
  genres?: string[];
}

export interface BackendMovie {
  id: string;
  title: string;
  images?: {
    poster?: string;
  };
  plot?: string;
  year?: string;
  rating?: {
    imdb?: string;
  };
  genres?: string;
}

export interface BackendTVSeries {
  id: string;
  title: string;
  images?: {
    poster?: string;
  };
  plot?: string;
  year?: string;
  rating?: {
    imdb?: string;
  };
  genres?: string;
}

export interface TodaysReleaseItem {
  content_type: 'movie' | 'tv_series' | 'anime';
  content_id: string;
  title: string;
  poster_image?: string;
  date: string;
  event_type: 'release_start' | 'release_end';
}

const parseGenres = (genres: any): string[] => {
  if (Array.isArray(genres)) return genres;
  if (typeof genres === 'string') {
    return genres.split(/[\s,]+/);
  }
  return [];
};

const getItems = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
};

export const contentService = {
  /**
   * Fetches and normalizes anime list
   */
  async fetchAnime(page: number = 1, limit: number = 50, search?: string): Promise<ContentItem[]> {
    let url = `/anime?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const data = await apiClient.get<any>(url);
    return getItems(data).map((item) => ({
      id: item._id,
      title: item.title?.english || item.title?.romaji || item.title?.japanese || 'Untitled Anime',
      category: 'Anime',
      poster: item.images?.poster || item.poster || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400',
      description: item.description || item.synonyms?.join(', ') || 'No description available.',
      releaseYear: item.year || 2024,
      averageRating: item.rating?.anilist ? parseFloat((item.rating.anilist / 10).toFixed(1)) : 7.0,
      genres: parseGenres(item.genres),
    }));
  },

  /**
   * Fetches and normalizes manga list
   */
  async fetchManga(page: number = 1, limit: number = 50, search?: string): Promise<ContentItem[]> {
    let url = `/manga?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const data = await apiClient.get<any>(url);
    return getItems(data).map((item) => {
      const year = item.start_date ? parseInt(item.start_date.split('-')[0]) : 2024;
      return {
        id: item._id,
        title: item.name || 'Untitled Manga',
        category: 'Manga',
        poster: item.cover_image || item.poster || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400',
        description: item.description || 'No description available.',
        releaseYear: year,
        averageRating: 8.0,
        genres: parseGenres(item.genres),
      };
    });
  },

  /**
   * Fetches and normalizes movies list
   */
  async fetchMovies(page: number = 1, limit: number = 50, search?: string): Promise<ContentItem[]> {
    let url = `/movies?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const data = await apiClient.get<any>(url);
    return getItems(data).map((item) => {
      const id = item.id || item._id;
      const year = item.release_date ? parseInt(item.release_date.split('-')[0]) : (item.year ? parseInt(item.year) : 2024);
      const ratingVal = item.tmdb_rating ? parseFloat(item.tmdb_rating.toFixed(1)) : (item.rating?.tmdb ? parseFloat(item.rating.tmdb) : (item.rating?.imdb ? parseFloat(item.rating.imdb) : 7.5));

      return {
        id,
        title: item.title || 'Untitled Movie',
        category: 'Movies',
        poster: item.poster || item.images?.poster || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400',
        description: item.plot || item.overview || item.description || 'No description available.',
        releaseYear: year,
        averageRating: ratingVal,
        genres: parseGenres(item.genres),
      };
    });
  },

  /**
   * Fetches and normalizes tv series list
   */
  async fetchTVSeries(page: number = 1, limit: number = 50, search?: string): Promise<ContentItem[]> {
    let url = `/tv-series?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const data = await apiClient.get<any>(url);
    return getItems(data).map((item) => {
      const id = item.id || item._id;
      const year = item.first_air_date ? parseInt(item.first_air_date.split('-')[0]) : (item.year ? parseInt(item.year.split('–')[0]) : 2024);
      const ratingVal = item.tmdb_rating ? parseFloat(item.tmdb_rating.toFixed(1)) : (item.rating?.tmdb ? parseFloat(item.rating.tmdb) : (item.rating?.imdb ? parseFloat(item.rating.imdb) : 7.5));

      return {
        id,
        title: item.title || 'Untitled TV Series',
        category: 'TV-Series',
        poster: item.poster || item.images?.poster || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400',
        description: item.plot || item.overview || item.description || 'No description available.',
        releaseYear: year,
        averageRating: ratingVal,
        genres: parseGenres(item.genres),
      };
    });
  },

  /**
   * Fetches details (rating, comments, etc.) for a single content item
   */
  async getRatingStats(category: FrontendCategory, id: string) {
    const backendType = CATEGORY_MAP[category];
    try {
      const stats = await apiClient.get<{
        average_rating: string | null;
        user_rating: string | null;
        count: number;
      }>(`/content/${backendType}/${id}/rating`);

      // Convert user rating label back to stars
      const userStars = stats.user_rating ? RATING_TO_STARS[stats.user_rating] || 0 : 0;
      
      return {
        averageRating: stats.average_rating ? stats.average_rating : undefined,
        userRating: userStars,
      };
    } catch {
      return { averageRating: undefined, userRating: 0 };
    }
  },

  /**
   * Submits a rating
   */
  async rateContent(category: FrontendCategory, id: string, stars: number) {
    const backendType = CATEGORY_MAP[category];
    const ratingLabel = STARS_TO_RATING(stars);
    return apiClient.post(`/content/${backendType}/${id}/rate`, { rating: ratingLabel });
  },

  /**
   * Check if item is in watchlist
   */
  async checkWatchlist(category: FrontendCategory, id: string): Promise<boolean> {
    const backendType = CATEGORY_MAP[category];
    try {
      const res = await apiClient.get<{ in_watchlist: boolean }>(`/content/${backendType}/${id}/watchlist`);
      return res.in_watchlist;
    } catch {
      return false;
    }
  },

  /**
   * Add to watchlist
   */
  async addToWatchlist(category: FrontendCategory, id: string) {
    const backendType = CATEGORY_MAP[category];
    return apiClient.post(`/content/${backendType}/${id}/watchlist`);
  },

  /**
   * Remove from watchlist
   */
  async removeFromWatchlist(category: FrontendCategory, id: string) {
    const backendType = CATEGORY_MAP[category];
    return apiClient.delete(`/content/${backendType}/${id}/watchlist`);
  },

  /**
   * Fetch all user watchlist items
   */
  async fetchUserWatchlist(): Promise<{ content_id: string; content_type: string }[]> {
    return apiClient.get<{ content_id: string; content_type: string }[]>('/watchlist');
  },

  /**
   * Fetch comments
   */
  async fetchComments(category: FrontendCategory, id: string): Promise<Comment[]> {
    const backendType = CATEGORY_MAP[category];
    try {
      const data = await apiClient.get<any[]>(`/content/${backendType}/${id}/comments`);
      
      // Flatten or map tree comments to list for frontend
      const mapComment = (c: any): Comment => ({
        id: c.id,
        username: c.username || c.display_name || (c.user_id === 'guest' ? 'Guest User' : `User_${c.user_id.slice(-4)}`),
        text: c.text,
        timestamp: new Date(c.created_at).toISOString().replace('T', ' ').substring(0, 16),
      });

      // Simple implementation: return all comments flattened, or root level.
      // Let's do a recursion to flat map them for simplicity in UI display
      const list: Comment[] = [];
      const traverse = (com: any) => {
        list.push(mapComment(com));
        if (com.replies && Array.isArray(com.replies)) {
          com.replies.forEach(traverse);
        }
      };
      data.forEach(traverse);
      return list;
    } catch {
      return [];
    }
  },

  /**
   * Add comment
   */
  async addComment(category: FrontendCategory, id: string, text: string): Promise<Comment> {
    const backendType = CATEGORY_MAP[category];
    const newCom = await apiClient.post<any>(`/content/${backendType}/${id}/comments`, { text });
    return {
      id: newCom.id,
      username: 'Guest User',
      text: newCom.text,
      timestamp: new Date(newCom.created_at).toISOString().replace('T', ' ').substring(0, 16),
    };
  },

  /**
   * Fetch today's releases
   */
  async fetchTodaysReleases(): Promise<TodaysReleaseItem[]> {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    const todayStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    const results = await apiClient.get<TodaysReleaseItem[]>(`/content/releases-range?start_date=${todayStr}&end_date=${todayStr}`);
    
    if (!Array.isArray(results)) return [];
    
    return results.filter(item => item.event_type === 'release_start');
  },

  /**
   * Fetch full content details including cast and crew
   */
  async fetchContentDetails(category: FrontendCategory | BackendContentType, id: string): Promise<any> {
    // If it's already a backend type, use it directly, else map it
    const backendType = CATEGORY_MAP[category as FrontendCategory] || category;
    return apiClient.get<any>(`/content/${backendType}/${id}`);
  }
};
