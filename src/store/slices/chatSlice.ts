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
import type { RootState } from '../index';

// Helper to determine if the message is character-specific and should route to /chat
const shouldRouteToChat = (text: string, state: RootState): boolean => {
  const lowerMsg = text.toLowerCase();

  // 0. Exclude /agent specific keywords (news, birthdays, trending, search, etc.)
  const agentKeywords = ['news', 'birthday', 'birthdays', 'trending', 'search', 'anniversary', 'anniversaries', 'latest', 'upcoming'];
  const hasAgentKeyword = agentKeywords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerMsg);
  });
  if (hasAgentKeyword) return false;

  // 1. Relationship words
  const relationshipWords = ['father', 'mother', 'brother', 'sister', 'sensei', 'rival', 'team', 'family'];
  const hasRelationshipWord = relationshipWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerMsg);
  });
  if (hasRelationshipWord) return true;

  // 2. Character-specific question patterns:
  // - "who is X"
  // - "tell me about X"
  // - "relationship between X and Y"
  const questionPatterns = [
    /\bwho\s+is\s+[a-z]+/i,
    /\bwho's\s+[a-z]+/i,
    /\btell\s+me\s+about\s+[a-z]+/i,
    /\brelationship\s+between\s+[a-z]+\s+and\s+[a-z]+/i
  ];
  const matchesQuestionPattern = questionPatterns.some(pattern => pattern.test(text));
  if (matchesQuestionPattern) return true;

  // 3. Known character names (including store characters & default anime characters)
  const defaultCharacterNames = [
    'naruto', 'uzumaki', 'gojo', 'satoru', 'kakashi', 'hatake',
    'luffy', 'monkey', 'madara', 'uchiha', 'levi', 'ackerman',
    'zoro', 'sukuna', 'saitama', 'killua', 'zenitsu', 'lelouch'
  ];

  const storeCharacterWords: string[] = [];
  const characters = state.characters?.characters;
  if (Array.isArray(characters)) {
    characters.forEach(char => {
      if (char.name) {
        const parts = char.name.toLowerCase().split(/[\s'\-_]+/);
        parts.forEach((part: string) => {
          if (part.length >= 3) {
            storeCharacterWords.push(part);
          }
        });
      }
    });
  }

  const allCharacterWords = Array.from(new Set([...defaultCharacterNames, ...storeCharacterWords]));

  const hasCharacterName = allCharacterWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerMsg);
  });
  if (hasCharacterName) return true;

  return false;
};

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    payload: { text: string; imageBase64?: string; imageMediaType?: string; imageUrl?: string },
    { dispatch, getState }
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
      let botResponse = '';
      const state = getState() as RootState;
      if (imageBase64 || shouldRouteToChat(text, state)) {
        // Image attached or character-specific query → POST /chat
        const res = await chatService.sendChatMessage(text, imageBase64, imageMediaType);
        botResponse = res.answer;
      } else {
        // Otherwise → POST /agent
        const res = await chatService.sendAgentMessage(text);
        botResponse = res.answer;
      }

      const botMsg: ChatMessage = {
        id: `msg_b_${Date.now()}`,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      dispatch(addMessage(botMsg));
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
