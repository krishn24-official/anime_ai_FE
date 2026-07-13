import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { contentService } from '../../services/contentService';
import type { TodaysReleaseItem } from '../../services/contentService';

interface TodaysReleasesState {
  items: TodaysReleaseItem[];
  loading: boolean;
  error: string | null;
}

export const fetchTodaysReleasesThunk = createAsyncThunk(
  'todaysReleases/fetchTodaysReleases',
  async (_, { rejectWithValue }) => {
    try {
      const data = await contentService.fetchTodaysReleases();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch todays releases');
    }
  }
);

const initialState: TodaysReleasesState = {
  items: [],
  loading: false,
  error: null
};

const todaysReleasesSlice = createSlice({
  name: 'todaysReleases',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodaysReleasesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodaysReleasesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTodaysReleasesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default todaysReleasesSlice.reducer;
