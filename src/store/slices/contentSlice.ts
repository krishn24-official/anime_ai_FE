import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ContentItem, Comment } from '../../types';
import { contentService } from '../../services/contentService';
import type { FrontendCategory } from '../../services/contentService';
import { apiClient } from '../../services/apiClient';

interface ContentState {
  items: ContentItem[];
  watchlist: string[]; // Content IDs
  ratings: Record<string, number>; // ID -> Rating (1-5 stars)
  comments: Record<string, Comment[]>; // ID -> Array of Comments
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  searchQuery: string;
  activeTab: 'All' | 'Anime' | 'Manga' | 'Movies' | 'TV-Series';
  showWatchlistOnly: boolean;
  page: number;
  hasMore: boolean;
}

const initialState: ContentState = {
  items: [],
  watchlist: [],
  ratings: {},
  comments: {},
  loading: false,
  error: null,
  lastFetchedAt: null,
  searchQuery: '',
  activeTab: 'All',
  showWatchlistOnly: false,
  page: 1,
  hasMore: true,
};

const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

export const fetchContentData = createAsyncThunk(
  'content/fetchContentData',
  async (args: { force?: boolean; page?: number } | undefined, { rejectWithValue, getState }) => {
    try {
      await apiClient.ensureGuestSession();
      
      const pageToFetch = args?.page || 1;
      const limit = 50;
      const state = getState() as { content: ContentState };
      const search = state.content.searchQuery.trim() || undefined;

      const [anime, manga, movies, tvSeries, watchlistItems] = await Promise.all([
        contentService.fetchAnime(pageToFetch, limit, search),
        contentService.fetchManga(pageToFetch, limit, search),
        contentService.fetchMovies(pageToFetch, limit, search),
        contentService.fetchTVSeries(pageToFetch, limit, search),
        contentService.fetchUserWatchlist(),
      ]);

      const newItems = [...anime, ...manga, ...movies, ...tvSeries];
      const watchlistIds = watchlistItems.map((w) => w.content_id);
      
      // If we didn't get any items, we have no more to fetch
      const hasMore = newItems.length > 0;

      return { items: newItems, watchlist: watchlistIds, page: pageToFetch, hasMore };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch content');
    }
  },
  {
    condition: (args, { getState }) => {
      const state = getState() as { content: ContentState };
      const { items, lastFetchedAt, loading, hasMore } = state.content;
      if (loading) return false; // already in flight
      
      const requestedPage = args?.page || 1;
      if (requestedPage > 1 && !hasMore) return false; // stop fetching if no more
      
      if (args?.force) return true; // explicit refresh always proceeds
      
      if (requestedPage === 1 && items.length > 0 && lastFetchedAt && Date.now() - lastFetchedAt < STALE_TIME_MS) {
        return false; // data exists and is still fresh
      }
      return true;
    },
  }
);

export const toggleWatchlistThunk = createAsyncThunk(
  'content/toggleWatchlistThunk',
  async ({ category, id }: { category: FrontendCategory; id: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { content: ContentState };
      const isInList = state.content.watchlist.includes(id);

      if (isInList) {
        await contentService.removeFromWatchlist(category, id);
      } else {
        await contentService.addToWatchlist(category, id);
      }

      return { id, isAdded: !isInList };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle watchlist');
    }
  }
);

export const rateContentThunk = createAsyncThunk(
  'content/rateContentThunk',
  async ({ category, id, stars }: { category: FrontendCategory; id: string; stars: number }, { rejectWithValue }) => {
    try {
      await contentService.rateContent(category, id, stars);
      return { id, rating: stars };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to rate content');
    }
  }
);

export const fetchCommentsThunk = createAsyncThunk(
  'content/fetchCommentsThunk',
  async ({ category, id }: { category: FrontendCategory; id: string }, { rejectWithValue }) => {
    try {
      const commentsList = await contentService.fetchComments(category, id);
      return { id, comments: commentsList };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch comments');
    }
  }
);

export const addCommentThunk = createAsyncThunk(
  'content/addCommentThunk',
  async ({ category, id, text }: { category: FrontendCategory; id: string; text: string }, { rejectWithValue }) => {
    try {
      const newComment = await contentService.addComment(category, id, text);
      return { id, comment: newComment };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to post comment');
    }
  }
);

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setShowWatchlistOnly: (state, action) => {
      state.showWatchlistOnly = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Initial Fetch ──────────────────────────────────────────────
      .addCase(fetchContentData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContentData.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action.payload.page === 1) {
          state.items = action.payload.items;
        } else {
          // Append new items, taking care not to duplicate IDs
          const existingIds = new Set(state.items.map(item => item.id));
          const uniqueNewItems = action.payload.items.filter(item => !existingIds.has(item.id));
          state.items = [...state.items, ...uniqueNewItems];
        }
        
        // Always sort alphabetically by title
        state.items.sort((a, b) => a.title.localeCompare(b.title));
        
        state.watchlist = action.payload.watchlist;
        state.lastFetchedAt = Date.now();
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchContentData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── Toggle Watchlist ───────────────────────────────────────────
      .addCase(toggleWatchlistThunk.fulfilled, (state, action) => {
        const { id, isAdded } = action.payload;
        if (isAdded) {
          if (!state.watchlist.includes(id)) {
            state.watchlist.push(id);
          }
        } else {
          state.watchlist = state.watchlist.filter((item) => item !== id);
        }
      })

      // ── Rate Content ───────────────────────────────────────────────
      .addCase(rateContentThunk.fulfilled, (state, action) => {
        const { id, rating } = action.payload;
        state.ratings[id] = rating;
      })

      // ── Fetch Comments ─────────────────────────────────────────────
      .addCase(fetchCommentsThunk.fulfilled, (state, action) => {
        const { id, comments } = action.payload;
        state.comments[id] = comments;
      })

      // ── Add Comment ────────────────────────────────────────────────
      .addCase(addCommentThunk.fulfilled, (state, action) => {
        const { id, comment } = action.payload;
        if (!state.comments[id]) {
          state.comments[id] = [];
        }
        state.comments[id].push(comment);
      });
  },
});

export const { setSearchQuery, setActiveTab, setShowWatchlistOnly } = contentSlice.actions;

export default contentSlice.reducer;
