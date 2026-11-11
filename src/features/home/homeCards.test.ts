import { describe, expect, it } from 'vitest';
import { anniversaryCards, birthdayCard, contentCard, releaseCard, trendingCard } from './homeCards';

const empty = { anime: [], manga: [], movie: [], tv_series: [], episode: [], chapter: [] };

describe('home cards', () => {
  it('maps trending items with a type badge and a detail link', () => {
    const card = trendingCard({
      contentType: 'tv_series', contentId: 'tv_x', title: 'X', posterImage: null,
      reason: null, pinned: true, setAt: null, note: 'New Season',
    });
    expect(card.badges).toEqual(['TV Series']);
    expect(card.subtitle).toBe('New Season');
    expect(card.target).toEqual({ kind: 'content', type: 'tv_series', id: 'tv_x' });
  });

  it('opens episodes in the summary modal and premieres on the detail page', () => {
    const ep = releaseCard({ content_type: 'episode', content_id: 'ep1', parent_id: 'a', parent_title: 'Show', title: 'Ep 5' } as never);
    expect(ep).toMatchObject({ title: 'Show', subtitle: 'Ep 5', badges: ['New Episode'], target: { kind: 'episode', id: 'ep1' } });
    const movie = releaseCard({ content_type: 'movie', content_id: 'm1', title: 'M', date: '', event_type: 'release_start' });
    expect(movie.badges).toEqual(['Premiere']);
  });

  it('links characters by name and actors by id', () => {
    const base = { id: 'c1', name: 'Gojo', anime: 'JJK', dob: '12-07', image: '', description: '' };
    expect(birthdayCard({ ...base, type: 'character' }).target).toEqual({ kind: 'character', name: 'Gojo' });
    expect(birthdayCard({ ...base, type: 'voice_actor' }).target).toEqual({ kind: 'actor', id: 'c1' });
  });

  it('normalises anniversaries from every collection shape', () => {
    const cards = anniversaryCards({
      ...empty,
      anime: [{ _id: 'anime_a', title: { romaji: 'Romaji Title' }, years_ago: 1, images: { poster: 'p.jpg' } }],
      manga: [{ _id: 'manga_b', name: 'Manga B', years_ago: 10 }],
      chapter: [{ content_id: 'ch1', parent_title: 'Manga B', years_ago: 3 }],
    });
    expect(cards.map((c) => c.title)).toEqual(['Romaji Title', 'Manga B', 'Manga B']);
    expect(cards[0].badges).toEqual(['1 Year Ago', 'Anime']);
    expect(cards[2]).toMatchObject({ subtitle: 'Chapter', target: { kind: 'chapter', id: 'ch1' } });
  });

  it('maps snake_case catalog items', () => {
    expect(contentCard({ content_type: 'manga', content_id: 'm', title: 'T' }).badges).toEqual(['Manga']);
  });
});
