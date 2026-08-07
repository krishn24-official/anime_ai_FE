import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { characterService } from '../../services/characterService';
import type { FrontendCharacter } from '../../services/characterService';
import { eventService } from '../../services/eventService';

const PAGE_SIZE = 50;

interface CharacterState {
  characters: FrontendCharacter[];
  birthdays: FrontendCharacter[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  currentSkip: number;
  error: string | null;
}

const initialState: CharacterState = {
  characters: [],
  birthdays: [],
  loading: false,
  loadingMore: false,
  hasMore: true,
  currentSkip: 0,
  error: null,
};

// Load first page + birthdays on mount
export const fetchCharactersData = createAsyncThunk(
  'characters/fetchCharactersData',
  async (_, { rejectWithValue }) => {
    try {
      const [result, events] = await Promise.all([
        characterService.fetchCharacters(0, PAGE_SIZE),
        eventService.fetchTodayEvents(),
      ]);
      return {
        characters: result.characters,
        hasMore: result.hasMore,
        birthdays: events.birthdays,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch characters');
    }
  }
);

// Load the next page and append to existing list
export const fetchMoreCharactersThunk = createAsyncThunk(
  'characters/fetchMoreCharacters',
  async (skip: number, { rejectWithValue }) => {
    try {
      const result = await characterService.fetchCharacters(skip, PAGE_SIZE);
      return { characters: result.characters, hasMore: result.hasMore, skip };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load more characters');
    }
  }
);

export const searchCharactersThunk = createAsyncThunk(
  'characters/searchCharactersThunk',
  async (query: string, { rejectWithValue }) => {
    try {
      if (!query.trim()) {
        const result = await characterService.fetchCharacters(0, PAGE_SIZE);
        return result.characters;
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
      // Fetch first page + birthdays
      .addCase(fetchCharactersData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCharactersData.fulfilled, (state, action) => {
        state.loading = false;
        state.characters = action.payload.characters;
        state.birthdays = action.payload.birthdays;
        state.hasMore = action.payload.hasMore;
        state.currentSkip = action.payload.characters.length;
      })
      .addCase(fetchCharactersData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load next page
      .addCase(fetchMoreCharactersThunk.pending, (state) => {
        state.loadingMore = true;
      })
      .addCase(fetchMoreCharactersThunk.fulfilled, (state, action) => {
        state.loadingMore = false;
        state.characters = [...state.characters, ...action.payload.characters];
        state.hasMore = action.payload.hasMore;
        state.currentSkip = action.payload.skip + action.payload.characters.length;
      })
      .addCase(fetchMoreCharactersThunk.rejected, (state) => {
        state.loadingMore = false;
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

