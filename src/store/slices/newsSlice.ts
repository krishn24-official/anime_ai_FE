import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { NewsItem } from '../../types';
import { newsService } from '../../services/newsService';

interface NewsState {
  items: NewsItem[];
  categoryFilter: 'All' | 'Anime' | 'Games' | 'Movies' | 'TV-Series';
  selectedItemId: string | null;
  loading: boolean;
  error: string | null;
}

export const fetchNewsThunk = createAsyncThunk(
  'news/fetchNews',
  async (category: 'All' | 'Anime' | 'Games' | 'Movies' | 'TV-Series' | undefined, { rejectWithValue }) => {
    try {
      return await newsService.fetchNews(category);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch news');
    }
  }
);

const initialState: NewsState = {
  items: [],
  categoryFilter: 'All',
  selectedItemId: null,
  loading: false,
  error: null
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setCategoryFilter: (state, action: PayloadAction<'All' | 'Anime' | 'Games' | 'Movies' | 'TV-Series'>) => {
      state.categoryFilter = action.payload;
    },
    selectNewsItem: (state, action: PayloadAction<string | null>) => {
      state.selectedItemId = action.payload;
    },
    addNewArticle: (state, action: PayloadAction<NewsItem>) => {
      if (!state.items.find(item => item.id === action.payload.id)) {
        state.items.unshift(action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNewsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setCategoryFilter, selectNewsItem, addNewArticle } = newsSlice.actions;
export default newsSlice.reducer;
