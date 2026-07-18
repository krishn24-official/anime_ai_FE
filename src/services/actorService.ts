import { apiClient } from './apiClient';

export interface ActorItem {
  _id: string;
  name: string;
  birthdate: string | null;
  biography: string | null;
  images?: {
    profile?: string;
  };
  filmography?: any[];
}

export const actorService = {
  searchActors: async (query: string): Promise<ActorItem[]> => {
    return await apiClient.get<ActorItem[]>(`/actors/search/${encodeURIComponent(query)}`);
  },
  getActor: async (actorId: string): Promise<ActorItem> => {
    return await apiClient.get<ActorItem>(`/actors/${actorId}`);
  },
  listActors: async (page: number = 1, limit: number = 50) => {
    return await apiClient.get<{items: ActorItem[], total: number}>(`/actors?page=${page}&limit=${limit}`);
  }
};
