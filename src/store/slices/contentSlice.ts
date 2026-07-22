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
};

const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

export const fetchContentData = createAsyncThunk(
  'content/fetchContentData',
  async (_args: { force?: boolean } | undefined, { rejectWithValue }) => {
    try {
      await apiClient.ensureGuestSession();

      const [anime, manga, movies, tvSeries, watchlistItems] = await Promise.all([
        contentService.fetchAnime(),
        contentService.fetchManga(),
        contentService.fetchMovies(),
        contentService.fetchTVSeries(),
        contentService.fetchUserWatchlist(),
      ]);

      const items = [...anime, ...manga, ...movies, ...tvSeries];
      const watchlistIds = watchlistItems.map((w) => w.content_id);

      return { items, watchlist: watchlistIds };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch content');
    }
  },
  {
    condition: (args, { getState }) => {
      const state = getState() as { content: ContentState };
      const { items, lastFetchedAt, loading } = state.content;
      if (loading) return false; // already in flight
      if (args?.force) return true; // explicit refresh always proceeds
      if (items.length > 0 && lastFetchedAt && Date.now() - lastFetchedAt < STALE_TIME_MS) {
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
        state.items = action.payload.items;
        state.watchlist = action.payload.watchlist;
        state.lastFetchedAt = Date.now();
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
