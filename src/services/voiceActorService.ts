import { apiClient } from './apiClient';

export interface VoiceActorItem {
  _id: string;
  name: string;
  native_name?: string;
  gender?: string;
  birth_year?: number;
  birth_month?: number;
  birth_day?: number;
  image?: string;
  description?: string;
  is_deleted: boolean;
  filmography?: any[];
}

export const voiceActorService = {
  getVoiceActor: async (id: string): Promise<VoiceActorItem> => {
    return await apiClient.get<VoiceActorItem>(`/voice-actors/${id}`);
  }
};
