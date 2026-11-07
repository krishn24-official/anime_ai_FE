import { describe, it, expect } from 'vitest';
import { toTrendingItem } from './trendingMapper';

describe('toTrendingItem', () => {
  it('maps the backend wire format to the app model', () => {
    expect(
      toTrendingItem({
        content_type: 'anime',
        content_id: 'anime_naruto',
        title: 'Naruto',
        poster_image: 'https://img/naruto.jpg',
        reason: "Editor's Pick",
        pinned: true,
        set_at: '2026-09-18T13:41:59.806000',
        note: 'New season',
      })
    ).toEqual({
      contentType: 'anime',
      contentId: 'anime_naruto',
      title: 'Naruto',
      posterImage: 'https://img/naruto.jpg',
      reason: "Editor's Pick",
      pinned: true,
      setAt: '2026-09-18T13:41:59.806000',
      note: 'New season',
    });
  });

  it('normalises missing optional fields to null', () => {
    const item = toTrendingItem({
      content_type: 'movie',
      content_id: 'movie_x',
      title: 'X',
      poster_image: null,
      reason: null,
      pinned: false,
      set_at: null,
    });
    expect(item.note).toBeNull();
    expect(item.posterImage).toBeNull();
  });
});
