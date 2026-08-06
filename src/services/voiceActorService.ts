import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
    const response = await axios.get(`${API_URL}/api/v1/voice-actors/${id}`);
    return response.data;
  }
};
