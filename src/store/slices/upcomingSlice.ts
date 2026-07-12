import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { contentService } from '../../services/contentService';
import type { UpcomingDatedItem, UpcomingSeasonalItem } from '../../services/contentService';

interface UpcomingState {
  dated: UpcomingDatedItem[];
  estimated: UpcomingSeasonalItem[];
  loading: boolean;
  error: string | null;
}

export const fetchUpcomingThunk = createAsyncThunk(
  'upcoming/fetchUpcoming',
  async (_, { rejectWithValue }) => {
    try {
      const data = await contentService.fetchUpcomingReleases(10, 10);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch upcoming releases');
    }
  }
);

const initialState: UpcomingState = {
  dated: [],
  estimated: [],
  loading: false,
  error: null
};

const upcomingSlice = createSlice({
  name: 'upcoming',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpcomingThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.dated = action.payload.dated;
        state.estimated = action.payload.estimated;
      })
      .addCase(fetchUpcomingThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default upcomingSlice.reducer;
