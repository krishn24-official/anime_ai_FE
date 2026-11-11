import type { ContentType, TrendingItem } from '../domain/trending';

/** Wire format returned by the backend. Only the services layer may depend on it. */
export interface TrendingItemDto {
  content_type: string;
  content_id: string;
  title: string;
  poster_image: string | null;
  reason: string | null;
  pinned: boolean;
  set_at: string | null;
  note?: string | null;
}

export const toTrendingItem = (dto: TrendingItemDto): TrendingItem => ({
  contentType: dto.content_type as ContentType,
  contentId: dto.content_id,
  title: dto.title,
  posterImage: dto.poster_image ?? null,
  reason: dto.reason ?? null,
  pinned: Boolean(dto.pinned),
  setAt: dto.set_at ?? null,
  note: dto.note ?? null,
});
