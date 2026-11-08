import { describe, expect, it } from 'vitest';
import type { HeroSlide } from '../../domain/home';
import { imageSrcSet, primaryAction, slideBadge, slideSubtitle } from './heroSlideMeta';

const base: HeroSlide = {
  kind: 'trailer', key: 'k', title: 'T', image: 'i', imageIsWide: true, subtitle: null, description: null,
  date: null, content: { type: 'movie', id: 'movie_t' }, videoUrl: null, linkUrl: null,
};
const today = new Date(2026, 10, 8);

describe('hero slide meta', () => {
  it('labels releases by date', () => {
    expect(slideBadge({ ...base, kind: 'release', date: '2026-11-08' }, today)).toBe('Out Now');
    expect(slideBadge({ ...base, kind: 'release', date: '2026-11-20' }, today)).toBe('Coming Soon');
    expect(slideSubtitle({ ...base, kind: 'release', date: '2026-11-20' })).toBe('Releases Nov 20');
    expect(slideBadge({ ...base, kind: 'pick' }, today)).toBe("Editor's Pick");
  });

  it('names news sources and dates', () => {
    expect(slideSubtitle({ ...base, kind: 'news', subtitle: 'thr', date: '2026-11-07' }))
      .toBe('The Hollywood Reporter · Nov 7');
    expect(slideSubtitle({ ...base, kind: 'news', subtitle: 'variety' })).toBe('Variety');
  });

  it('picks the main action', () => {
    expect(primaryAction({ ...base, videoUrl: 'https://youtu.be/x' })).toBe('trailer');
    expect(primaryAction(base)).toBe('details');
    expect(primaryAction({ ...base, kind: 'news', content: null, linkUrl: 'https://a.b' })).toBe('article');
  });

  it('offers a smaller TMDb image for phones', () => {
    expect(imageSrcSet('https://image.tmdb.org/t/p/w1280/a.jpg')).toContain('/w780/a.jpg 780w');
    expect(imageSrcSet('https://s4.anilist.co/banner.jpg')).toBeUndefined();
  });
});
