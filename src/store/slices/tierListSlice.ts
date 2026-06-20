import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { TierList } from '../../types';
import { tierListService } from '../../services/tierListService';
import type { SearchResultItem } from '../../services/tierListService';

interface TierListState {
  myLists: TierList[];
  publicLists: TierList[];
  publicTotal: number;
  currentList: TierList | null;
  searchResults: SearchResultItem[];
  loading: boolean;
  searchLoading: boolean;
  error: string | null;
}

const initialState: TierListState = {
  myLists: [],
  publicLists: [],
  publicTotal: 0,
  currentList: null,
  searchResults: [],
  loading: false,
  searchLoading: false,
  error: null
};

// Async Thunks
export const fetchMyTierListsThunk = createAsyncThunk(
  'tierList/fetchMyTierLists',
  async (_, { rejectWithValue }) => {
    try {
      return await tierListService.getMyTierLists();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch your tier lists');
    }
  }
);

export const fetchPublicTierListsThunk = createAsyncThunk(
  'tierList/fetchPublicTierLists',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      return await tierListService.getPublicTierLists(page, limit);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch public tier lists');
    }
  }
);

export const fetchTierListByIdThunk = createAsyncThunk(
  'tierList/fetchTierListById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await tierListService.getTierListById(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch tier list details');
    }
  }
);

export const createTierListThunk = createAsyncThunk(
  'tierList/createTierList',
  async (data: { name: string; tiers: any[]; is_public: boolean }, { rejectWithValue }) => {
    try {
      return await tierListService.createTierList(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create tier list');
    }
  }
);

export const updateTierListThunk = createAsyncThunk(
  'tierList/updateTierList',
  async ({ id, data }: { id: string; data: { name?: string; tiers?: any[]; is_public?: boolean } }, { rejectWithValue }) => {
    try {
      return await tierListService.updateTierList(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update tier list');
    }
  }
);

export const deleteTierListThunk = createAsyncThunk(
  'tierList/deleteTierList',
  async (id: string, { rejectWithValue }) => {
    try {
      await tierListService.deleteTierList(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete tier list');
    }
  }
);

export const searchContentThunk = createAsyncThunk(
  'tierList/searchContent',
  async ({ query, contentType }: { query: string; contentType?: string }, { rejectWithValue }) => {
    try {
      return await tierListService.searchContent(query, contentType);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search content');
    }
  }
);

const tierListSlice = createSlice({
  name: 'tierList',
  initialState,
  reducers: {
    clearCurrentList(state) {
      state.currentList = null;
    },
    clearSearchResults(state) {
      state.searchResults = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Lists
      .addCase(fetchMyTierListsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTierListsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.myLists = action.payload;
      })
      .addCase(fetchMyTierListsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Public Lists
      .addCase(fetchPublicTierListsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicTierListsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.publicLists = action.payload.items;
        state.publicTotal = action.payload.total;
      })
      .addCase(fetchPublicTierListsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch One List
      .addCase(fetchTierListByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTierListByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentList = action.payload;
      })
      .addCase(fetchTierListByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create List
      .addCase(createTierListThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTierListThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.myLists.unshift(action.payload);
      })
      .addCase(createTierListThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update List
      .addCase(updateTierListThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTierListThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.myLists.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.myLists[index] = action.payload;
        }
        if (state.currentList?.id === action.payload.id) {
          state.currentList = action.payload;
        }
      })
      .addCase(updateTierListThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete List
      .addCase(deleteTierListThunk.fulfilled, (state, action) => {
        state.myLists = state.myLists.filter(l => l.id !== action.payload);
        if (state.currentList?.id === action.payload) {
          state.currentList = null;
        }
      })

      // Search Content
      .addCase(searchContentThunk.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchContentThunk.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchContentThunk.rejected, (state) => {
        state.searchLoading = false;
      });
  }
});

export const { clearCurrentList, clearSearchResults } = tierListSlice.actions;
export default tierListSlice.reducer;
