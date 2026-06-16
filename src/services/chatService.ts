import { apiClient } from './apiClient';

export interface ChatResponse {
  answer: string;
}

export interface AgentResponse {
  answer: string;
  tools_used?: string[];
  iterations?: number;
}

export const chatService = {
  /**
   * Calls agent endpoint (no image attached)
   */
  async sendAgentMessage(message: string): Promise<AgentResponse> {
    return apiClient.post<AgentResponse>('/agent', { message });
  },

  /**
   * Calls chat endpoint (image attached)
   */
  async sendChatMessage(
    message: string,
    imageBase64?: string,
    imageMediaType?: string
  ): Promise<ChatResponse> {
    return apiClient.post<ChatResponse>('/chat', {
      message,
      image_base64: imageBase64 || null,
      image_media_type: imageMediaType || null,
    });
  }
};
