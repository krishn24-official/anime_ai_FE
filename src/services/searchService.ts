import { apiClient } from './apiClient';

export interface SearchCharacterItem {
  _id: string;
  name: string;
  images?: {
    profile?: string;
  };
  role?: string;
}

export interface SearchAnimeItem {
  _id: string;
  title: {
    english?: string;
    romaji?: string;
    japanese?: string;
  };
  images?: {
    poster?: string;
  };
  year?: number;
}

export interface SearchMangaItem {
  _id: string;
  name: string;
  cover_image?: string;
  status?: string;
}

export interface SearchMovieItem {
  _id: string;
  title: string;
  year?: string;
  images?: {
    poster?: string;
  };
  genres?: string;
}

export interface SearchTVSeriesItem {
  _id: string;
  title: string;
  year?: string;
  images?: {
    poster?: string;
  };
  genres?: string;
  total_seasons?: number;
}

export interface GlobalSearchResults {
  characters: SearchCharacterItem[];
  anime: SearchAnimeItem[];
  manga: SearchMangaItem[];
  movies: SearchMovieItem[];
  tv_series: SearchTVSeriesItem[];
}

export const searchService = {
  async globalSearch(query: string): Promise<GlobalSearchResults> {
    return apiClient.get<GlobalSearchResults>('/search', {
      params: { q: query },
    });
  },
};
