/**
 * App-side model for trending items.
 *
 * Components and the store use these types only. The backend's wire format
 * (snake_case fields, form field names) is known solely by
 * src/services/trendingService.ts, so a backend change is absorbed there.
 */

export type ContentType = 'anime' | 'manga' | 'movie' | 'tv_series';

export interface TrendingItem {
  contentType: ContentType;
  contentId: string;
  title: string;
  posterImage: string | null;
  reason: string | null;
  pinned: boolean;
  setAt: string | null;
  note: string | null;
}

/** Input for pinning an item as an Editor's Pick. */
export interface PinTrendingInput {
  contentType: string;
  contentId: string;
  note?: string;
  /** ISO 8601 timestamp */
  expiresAt?: string;
  image?: File | null;
}
