import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { trendingService, type TrendingItem } from '../../services/trendingService';

interface TrendingState {
  items: TrendingItem[];
  loading: boolean;
  error: string | null;
}

const initialState: TrendingState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchTrendingThunk = createAsyncThunk(
  'trending/fetchTrending',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const data = await trendingService.fetchTrending(limit);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || err.message || 'Failed to fetch trending');
    }
  }
);

const trendingSlice = createSlice({
  name: 'trending',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrendingThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrendingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTrendingThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default trendingSlice.reducer;
