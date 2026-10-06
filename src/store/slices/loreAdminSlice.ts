import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  loreAdminService,
  type LoreUploadResult,
  type LoreStatus,
  type LoreDeleteResult,
} from '../../services/loreAdminService';

interface LoreAdminState {
  uploading: boolean;
  uploadError: string | null;
  lastUploadResult: LoreUploadResult | null;
  statusBySeriesId: Record<string, LoreStatus>;
  statusLoading: boolean;
  statusError: string | null;
  deleting: boolean;
  deleteError: string | null;
}

const initialState: LoreAdminState = {
  uploading: false,
  uploadError: null,
  lastUploadResult: null,
  statusBySeriesId: {},
  statusLoading: false,
  statusError: null,
  deleting: false,
  deleteError: null,
};

export const uploadLoreThunk = createAsyncThunk<
  LoreUploadResult,
  { file: File; seriesId: string; characterIds?: string[] },
  { rejectValue: string }
>('loreAdmin/uploadLore', async ({ file, seriesId, characterIds }, { rejectWithValue }) => {
  try {
    return await loreAdminService.uploadLorePdf(file, seriesId, characterIds);
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to upload lore PDF');
  }
});

export const fetchLoreStatusThunk = createAsyncThunk<
  LoreStatus,
  string,
  { rejectValue: string }
>('loreAdmin/fetchLoreStatus', async (seriesId: string, { rejectWithValue }) => {
  try {
    return await loreAdminService.getLoreStatus(seriesId);
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch lore status');
  }
});

export const deleteLoreThunk = createAsyncThunk<
  LoreDeleteResult,
  string,
  { rejectValue: string }
>('loreAdmin/deleteLore', async (seriesId: string, { rejectWithValue }) => {
  try {
    return await loreAdminService.deleteLore(seriesId);
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to delete lore');
  }
});

const loreAdminSlice = createSlice({
  name: 'loreAdmin',
  initialState,
  reducers: {
    clearUploadError(state) {
      state.uploadError = null;
    },
    clearLastUploadResult(state) {
      state.lastUploadResult = null;
    },
    clearDeleteError(state) {
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    // Upload
    builder
      .addCase(uploadLoreThunk.pending, (state) => {
        state.uploading = true;
        state.uploadError = null;
      })
      .addCase(uploadLoreThunk.fulfilled, (state, action: PayloadAction<LoreUploadResult>) => {
        state.uploading = false;
        state.lastUploadResult = action.payload;
        state.uploadError = null;
        // Optimistically update status
        state.statusBySeriesId[action.payload.series_id] = {
          series_id: action.payload.series_id,
          chunks_count: action.payload.chunks_created,
          source_files: [action.payload.source_file],
        };
      })
      .addCase(uploadLoreThunk.rejected, (state, action) => {
        state.uploading = false;
        state.uploadError = action.payload || 'Upload failed';
      });

    // Status
    builder
      .addCase(fetchLoreStatusThunk.pending, (state) => {
        state.statusLoading = true;
        state.statusError = null;
      })
      .addCase(fetchLoreStatusThunk.fulfilled, (state, action: PayloadAction<LoreStatus>) => {
        state.statusLoading = false;
        state.statusBySeriesId[action.payload.series_id] = action.payload;
        state.statusError = null;
      })
      .addCase(fetchLoreStatusThunk.rejected, (state, action) => {
        state.statusLoading = false;
        state.statusError = action.payload || 'Failed to fetch status';
      });

    // Delete
    builder
      .addCase(deleteLoreThunk.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(deleteLoreThunk.fulfilled, (state, action: PayloadAction<LoreDeleteResult>) => {
        state.deleting = false;
        state.deleteError = null;
        state.statusBySeriesId[action.payload.series_id] = {
          series_id: action.payload.series_id,
          chunks_count: 0,
          source_files: [],
        };
      })
      .addCase(deleteLoreThunk.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload || 'Failed to delete lore';
      });
  },
});

export const { clearUploadError, clearLastUploadResult, clearDeleteError } = loreAdminSlice.actions;
export default loreAdminSlice.reducer;
