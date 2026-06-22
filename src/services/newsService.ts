import { apiClient } from './apiClient';
import type { NewsItem } from '../types';

const mapCategory = (cat: string): 'Anime' | 'Games' | 'Movies' | 'TV-Series' => {
  if (cat === 'TV Series' || cat === 'TV-Series') return 'TV-Series';
  if (cat === 'Anime' || cat === 'Games' || cat === 'Movies') return cat;
  return 'Anime';
};

const getCategoryFallbackImage = (category: string, index: number): string => {
  const animeImages = [
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'
  ];
  const gamesImages = [
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
  ];
  const moviesImages = [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600&auto=format&fit=crop&q=80'
  ];
  const tvImages = [
    'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1460889418202-14df70d5549e?w=600&auto=format&fit=crop&q=80'
  ];

  const pool = 
    category === 'Games' ? gamesImages :
    category === 'Movies' ? moviesImages :
    category === 'TV-Series' ? tvImages :
    animeImages;

  return pool[index % pool.length];
};

export const newsService = {
  async fetchNews(category?: 'All' | 'Anime' | 'Games' | 'Movies' | 'TV-Series'): Promise<NewsItem[]> {
    const params: Record<string, string | number> = {
      page: 1,
      limit: 20
    };

    if (category && category !== 'All') {
      params.category = category === 'TV-Series' ? 'TV Series' : category;
    }

    const res = await apiClient.get<any>('/news', { params });
    const items = Array.isArray(res) ? res : res.items || [];

    return items.map((item: any, index: number): NewsItem => {
      const mappedCat = mapCategory(item.category || '');
      
      let dateStr = '';
      if (item.published_at) {
        try {
          const dateObj = new Date(item.published_at);
          dateStr = dateObj.toISOString().split('T')[0];
        } catch {
          dateStr = new Date().toISOString().split('T')[0];
        }
      }

      return {
        id: item._id || String(index),
        title: item.title || 'No Title Available',
        summary: item.summary || item.description || 'No summary available.',
        content: item.description || item.summary || 'No description available.',
        category: mappedCat,
        date: dateStr,
        image: item.image_url || item.image || getCategoryFallbackImage(mappedCat, index),
        author: item.youtube_channel || item.source ? (item.youtube_channel || item.source).toUpperCase() : 'ANONYMOUS',
        url: item.url || ''
      };
    });
  },

  async createNews(formData: FormData): Promise<any> {
    return apiClient.post<any>('/admin/news', formData);
  },

  async getAdminNewsItem(id: string): Promise<any> {
    return apiClient.get<any>(`/admin/news/${id}`);
  },

  async editNews(id: string, formData: FormData): Promise<any> {
    return apiClient.put<any>(`/admin/news/${id}`, formData);
  },

  async deleteNews(id: string): Promise<any> {
    return apiClient.delete<any>(`/admin/news/${id}`);
  }
};
