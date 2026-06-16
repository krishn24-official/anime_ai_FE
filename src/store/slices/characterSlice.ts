import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { characterService } from '../../services/characterService';
import type { FrontendCharacter } from '../../services/characterService';
import { eventService } from '../../services/eventService';

interface CharacterState {
  characters: FrontendCharacter[];
  birthdays: FrontendCharacter[];
  loading: boolean;
  error: string | null;
}

const initialState: CharacterState = {
  characters: [],
  birthdays: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchCharactersData = createAsyncThunk(
  'characters/fetchCharactersData',
  async (_, { rejectWithValue }) => {
    try {
      const [characters, events] = await Promise.all([
        characterService.fetchCharacters(),
        eventService.fetchTodayEvents(),
      ]);
      return { characters, birthdays: events.birthdays };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch characters');
    }
  }
);

export const searchCharactersThunk = createAsyncThunk(
  'characters/searchCharactersThunk',
  async (query: string, { rejectWithValue }) => {
    try {
      if (!query.trim()) {
        return characterService.fetchCharacters();
      }
      return characterService.searchCharacters(query);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search characters');
    }
  }
);

const characterSlice = createSlice({
  name: 'characters',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Characters & Birthdays
      .addCase(fetchCharactersData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCharactersData.fulfilled, (state, action) => {
        state.loading = false;
        state.characters = action.payload.characters;
        state.birthdays = action.payload.birthdays;
      })
      .addCase(fetchCharactersData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Search Characters
      .addCase(searchCharactersThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchCharactersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.characters = action.payload;
      })
      .addCase(searchCharactersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default characterSlice.reducer;
export type { FrontendCharacter };
