import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

// ─── Mock service modules ──────────────────────────────────────────────────────
// vi.mock factories are hoisted — all data must be inline (no top-level variable refs).
vi.mock('../../services/apiClient', () => ({
  apiClient: { ensureGuestSession: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('../../services/contentService', () => ({
  contentService: {
    fetchAnime: vi.fn().mockResolvedValue([{ id: '1', title: 'Test Anime', category: 'Anime' }]),
    fetchManga: vi.fn().mockResolvedValue([{ id: '2', title: 'Test Manga', category: 'Manga' }]),
    fetchMovies: vi.fn().mockResolvedValue([{ id: '3', title: 'Test Movie', category: 'Movies' }]),
    fetchTVSeries: vi.fn().mockResolvedValue([{ id: '4', title: 'Test TV', category: 'TV-Series' }]),
    fetchUserWatchlist: vi.fn().mockResolvedValue([{ content_id: '1' }]),
  },
}));

// Import AFTER mocks are set up (they're hoisted, but conceptually cleaner)
import contentReducer, { fetchContentData } from './contentSlice';
import { contentService } from '../../services/contentService';

// ─── Helpers ────────────────────────────────────────────────────────────────────
type ContentState = ReturnType<typeof contentReducer>;

function createTestStore(overrides?: Partial<ContentState>) {
  const base: ContentState = {
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
  return configureStore({
    reducer: { content: contentReducer },
    preloadedState: { content: { ...base, ...overrides } },
  });
}

// ─── Tests ──────────────────────────────────────────────────────────────────────
describe('fetchContentData condition caching', () => {
  const fetchAnimeSpy = contentService.fetchAnime as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchAnimeSpy.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('skips the fetch when data is already loaded and still fresh (navigate away and back)', async () => {
    const store = createTestStore();

    // First dispatch — should proceed (no data yet)
    vi.setSystemTime(Date.now());
    await store.dispatch(fetchContentData());
    expect(fetchAnimeSpy).toHaveBeenCalledTimes(1);
    expect(store.getState().content.items.length).toBeGreaterThan(0);

    // Second dispatch immediately after (simulating navigate back) — should be skipped
    await store.dispatch(fetchContentData());
    expect(fetchAnimeSpy).toHaveBeenCalledTimes(1); // still 1 — no new call
  });

  it('always proceeds when { force: true } is passed regardless of freshness', async () => {
    const store = createTestStore();

    vi.setSystemTime(Date.now());
    await store.dispatch(fetchContentData());
    expect(fetchAnimeSpy).toHaveBeenCalledTimes(1);

    // Force refresh — should proceed even though data is fresh
    await store.dispatch(fetchContentData({ force: true }));
    expect(fetchAnimeSpy).toHaveBeenCalledTimes(2);
  });

  it('proceeds again after STALE_TIME_MS has elapsed', async () => {
    const store = createTestStore();

    const now = Date.now();
    vi.setSystemTime(now);
    await store.dispatch(fetchContentData());
    expect(fetchAnimeSpy).toHaveBeenCalledTimes(1);

    // Advance time past 5 minutes
    vi.setSystemTime(now + 5 * 60 * 1000 + 1);
    await store.dispatch(fetchContentData());
    expect(fetchAnimeSpy).toHaveBeenCalledTimes(2); // new call made
  });

  it('returns false (skips) when a fetch is already in flight (loading: true)', async () => {
    // Pre-seed state with loading: true to simulate an in-flight request
    const store = createTestStore({ loading: true });

    await store.dispatch(fetchContentData());
    // Should have been skipped entirely — no API calls
    expect(fetchAnimeSpy).toHaveBeenCalledTimes(0);
  });
});
