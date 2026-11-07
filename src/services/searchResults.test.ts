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

describe('flattenSearchResults', () => {
  it('flattens the requested kinds, in order, with app-side fields', async () => {
    const { flattenSearchResults } = await import('./searchResults');
    const options = flattenSearchResults(
      {
        ...empty,
        anime: [{ _id: 'anime_naruto', title: { romaji: 'NARUTO' }, images: { poster: 'n.jpg' }, year: 2002 }],
        manga: [{ _id: 'manga_naruto', name: 'NARUTO', cover_image: 'm.jpg' }],
        movies: [{ _id: 'movie_naruto', title: 'Naruto', year: '2007' }],
      },
      ['movies', 'anime']
    );
    expect(options.map((o) => [o.kind, o.contentType, o.id, o.title, o.image, o.year])).toEqual([
      ['movies', 'movie', 'movie_naruto', 'Naruto', null, '2007'],
      ['anime', 'anime', 'anime_naruto', 'NARUTO', 'n.jpg', 2002],
    ]);
  });

  it('returns an empty list for no results', async () => {
    const { flattenSearchResults } = await import('./searchResults');
    expect(flattenSearchResults(null, ['anime'])).toEqual([]);
  });
});
