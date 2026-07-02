import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ChatMessage } from '../../types';

interface ChatState {
  messages: ChatMessage[];
  status: 'idle' | 'typing';
}

const initialState: ChatState = {
  messages: [
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: 'Hello, I am your Anime AI Assistant! 🌟 Ask me about anime news, character birthdays, recommended watches, or questions about the games we have on this platform!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ],
  status: 'idle'
};

import { chatService } from '../../services/chatService';

// Routing rule: send EVERYTHING to /chat.
// The backend /chat endpoint handles characters, relationships, and has
// fast-path intercepts for news, birthdays, and recommendations that
// bypass Gemini entirely.
const shouldRouteToChat = (): boolean => {
  return true;
};

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    payload: { text: string; imageBase64?: string; imageMediaType?: string; imageUrl?: string },
    { dispatch }
  ) => {
    const { text, imageBase64, imageMediaType, imageUrl } = payload;

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text,
      image: imageUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    dispatch(addMessage(userMsg));
    dispatch(setStatus('typing'));

    try {
      if (imageBase64 || shouldRouteToChat()) {
        // Image attached or character/relationship query → POST /chat
        const res = await chatService.sendChatMessage(text, imageBase64, imageMediaType);
        const botMsg: ChatMessage = {
          id: `msg_b_${Date.now()}`,
          sender: 'bot',
          text: res.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          // Attach disambiguation payload if the backend returned multiple matches
          disambiguationOptions: res.disambiguation,
          originalQuery: res.original_message,
          nameQuery: res.name_query,
        };
        dispatch(addMessage(botMsg));
      } else {
        // Otherwise → POST /agent
        const res = await chatService.sendAgentMessage(text);
        const botMsg: ChatMessage = {
          id: `msg_b_${Date.now()}`,
          sender: 'bot',
          text: res.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        dispatch(addMessage(botMsg));
      }
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'bot',
        text: `Error: ${error.message || 'Could not reach the AI server.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      dispatch(addMessage(errorMsg));
    } finally {
      dispatch(setStatus('idle'));
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setStatus: (state, action: PayloadAction<'idle' | 'typing'>) => {
      state.status = action.payload;
    },
    clearHistory: (state) => {
      state.messages = [initialState.messages[0]];
    }
  }
});

export const { addMessage, setStatus, clearHistory } = chatSlice.actions;
export default chatSlice.reducer;
