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
  page: number;
  hasMore: boolean;
  lastFetchedAt: number | null;
  searchQuery: string;
  sourceFilter: string;
  startDate: string;
  endDate: string;
}

const STALE_TIME_MS = 5 * 60 * 1000;

export const fetchNewsThunk = createAsyncThunk(
  'news/fetchNews',
  async (args: { force?: boolean; page?: number } | undefined, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { news: NewsState };
      const pageToFetch = args?.page || 1;
      
      const { categoryFilter, searchQuery, sourceFilter, startDate, endDate } = state.news;
      
      const newItems = await newsService.fetchNews({
        category: categoryFilter,
        page: pageToFetch,
        limit: 20,
        search: searchQuery.trim() || undefined,
        source: sourceFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      
      const hasMore = newItems.length > 0;
      return { items: newItems, page: pageToFetch, hasMore };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch news');
    }
  },
  {
    condition: (args, { getState }) => {
      const state = getState() as { news: NewsState };
      const { items, lastFetchedAt, loading, hasMore } = state.news;
      const requestedPage = args?.page || 1;
      
      if (args?.force) return true;
      if (loading) return false;
      if (requestedPage > 1 && !hasMore) return false;
      if (requestedPage === 1 && items.length > 0 && lastFetchedAt && Date.now() - lastFetchedAt < STALE_TIME_MS) {
        return false;
      }
      return true;
    }
  }
);

const initialState: NewsState = {
  items: [],
  categoryFilter: 'All',
  selectedItemId: null,
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  lastFetchedAt: null,
  searchQuery: '',
  sourceFilter: 'All',
  startDate: '',
  endDate: '',
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
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSourceFilter: (state, action: PayloadAction<string>) => {
      state.sourceFilter = action.payload;
    },
    setDateRange: (state, action: PayloadAction<{ startDate: string, endDate: string }>) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 1) {
          state.items = action.payload.items;
        } else {
          const existingIds = new Set(state.items.map(item => item.id));
          const uniqueNewItems = action.payload.items.filter(item => !existingIds.has(item.id));
          state.items = [...state.items, ...uniqueNewItems];
        }
        state.lastFetchedAt = Date.now();
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchNewsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setCategoryFilter, selectNewsItem, addNewArticle, setSearchQuery, setSourceFilter, setDateRange } = newsSlice.actions;
export default newsSlice.reducer;
