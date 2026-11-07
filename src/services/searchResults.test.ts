import { describe, it, expect } from 'vitest';
import { getTopSearchResult } from './searchResults';
import type { GlobalSearchResults } from './searchService';

const empty: GlobalSearchResults = {
  characters: [], anime: [], manga: [], movies: [], tv_series: [], actors: [],
};

describe('getTopSearchResult', () => {
  it('resolves the top_result reference to its item', () => {
    const results: GlobalSearchResults = {
      ...empty,
      anime: [
        { _id: 'anime_one_piece', title: { english: 'ONE PIECE' }, images: { poster: 'p.jpg' }, year: 1999 },
      ],
      top_result: { kind: 'anime', id: 'anime_one_piece' },
    };
    expect(getTopSearchResult(results)).toMatchObject({
      kind: 'anime',
      title: 'ONE PIECE',
      subtitle: 'Anime · 1999',
      image: 'p.jpg',
    });
  });

  it('returns null when there is no top result, it is not displayed, or not in the lists', () => {
    expect(getTopSearchResult(null)).toBeNull();
    expect(getTopSearchResult({ ...empty, top_result: null })).toBeNull();
    expect(getTopSearchResult({ ...empty, top_result: { kind: 'organizations', id: 'org_x' } })).toBeNull();
    expect(getTopSearchResult({ ...empty, top_result: { kind: 'anime', id: 'missing' } })).toBeNull();
  });
});
