/**
 * Turns the home page's different data sources into one card model, so every
 * row renders the same <PosterCard>. Pure functions: no React, no fetching.
 */
import type { BirthdayEntity } from '../../types';
import type { TrendingItem } from '../../domain/trending';
import type { TodaysReleaseItem } from '../../services/contentService';

/** Where a card leads when opened. */
export type CardTarget =
  | { kind: 'content'; type: string; id: string }
  | { kind: 'episode' | 'chapter'; id: string }
  | { kind: 'character'; name: string }
  | { kind: 'actor'; id: string }
  | { kind: 'search'; query: string };

export interface HomeCard {
  key: string;
  title: string;
  subtitle?: string;
  image?: string;
  badges: string[];
  target: CardTarget;
  /** Text for the shareable poster; omitted = no share button. */
  share?: { title: string; subtitle: string; yearsAgo: string; typeLabel: string };
}

export const TYPE_LABELS: Record<string, string> = {
  anime: 'Anime',
  manga: 'Manga',
  movie: 'Movie',
  tv_series: 'TV Series',
  episode: 'Episode',
  chapter: 'Chapter',
};

const yearsAgoLabel = (years: number) => (years === 1 ? '1 Year Ago' : `${years} Years Ago`);

export const trendingCard = (item: TrendingItem): HomeCard => ({
  key: `${item.contentType}-${item.contentId}`,
  title: item.title,
  subtitle: item.note ?? undefined,
  image: item.posterImage ?? undefined,
  badges: [TYPE_LABELS[item.contentType] ?? item.contentType],
  target: { kind: 'content', type: item.contentType, id: item.contentId },
  share: { title: item.title, subtitle: item.note ?? '', yearsAgo: '', typeLabel: '' },
});

export const releaseCard = (item: TodaysReleaseItem): HomeCard => {
  if (item.content_type === 'episode' || item.content_type === 'chapter') {
    return {
      key: `${item.content_type}-${item.content_id}`,
      title: item.parent_title,
      subtitle: item.title,
      image: item.poster_image,
      badges: [item.content_type === 'episode' ? 'New Episode' : 'New Chapter'],
      target: { kind: item.content_type, id: item.content_id },
    };
  }
  return {
    key: `${item.content_type}-${item.content_id}`,
    title: item.title,
    image: item.poster_image,
    badges: [item.event_type === 'release_start' ? 'Premiere' : TYPE_LABELS[item.content_type]],
    target: { kind: 'content', type: item.content_type, id: item.content_id },
  };
};

export const birthdayCard = (b: BirthdayEntity, today = new Date()): HomeCard => ({
  key: `birthday-${b.id}`,
  title: b.name,
  subtitle: b.anime,
  image: b.image,
  badges: ['Birthday'],
  target: b.type === 'character' ? { kind: 'character', name: b.name } : { kind: 'actor', id: b.id },
  share: {
    title: `Happy Birthday ${b.name}`,
    subtitle: '',
    yearsAgo: today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    typeLabel: '',
  },
});

/** Raw "on this day" anniversaries, as returned by the events API. */
export interface AnniversaryGroups {
  anime: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any -- untyped API payloads
  manga: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  movie: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  tv_series: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  episode: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  chapter: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const PREMIERE_LABELS: Record<string, string> = {
  anime: 'Anime Premiere',
  manga: 'Manga Debut',
  movie: 'Movie Premiere',
  tv_series: 'Series Premiere',
};

const titleOf = (doc: { title?: unknown; name?: string }) => {
  const t = doc.title;
  if (typeof t === 'string') return t;
  if (t && typeof t === 'object') {
    const o = t as Record<string, string>;
    return o.english || o.romaji || o.japanese;
  }
  return doc.name;
};

export const anniversaryCards = (groups: AnniversaryGroups): HomeCard[] => {
  const cards: HomeCard[] = [];
  for (const type of ['anime', 'manga', 'movie', 'tv_series'] as const) {
    for (const d of groups[type]) {
      const title = titleOf(d) || 'Unknown';
      const years = yearsAgoLabel(d.years_ago);
      cards.push({
        key: `${type}-${d._id}`,
        title,
        subtitle: PREMIERE_LABELS[type],
        image: d.images?.poster || d.poster || d.cover_image || undefined,
        badges: [years, TYPE_LABELS[type]],
        target: { kind: 'content', type, id: d._id },
        share: { title, subtitle: PREMIERE_LABELS[type], yearsAgo: years, typeLabel: TYPE_LABELS[type] },
      });
    }
  }
  for (const type of ['episode', 'chapter'] as const) {
    for (const d of groups[type]) {
      const title = d.parent_title || 'Unknown';
      const subtitle = d.title || TYPE_LABELS[type];
      const years = yearsAgoLabel(d.years_ago);
      cards.push({
        key: `${type}-${d.content_id}`,
        title,
        subtitle,
        image: d.poster_image || undefined,
        badges: [years, TYPE_LABELS[type]],
        target: { kind: type, id: d.content_id },
        share: { title, subtitle, yearsAgo: years, typeLabel: TYPE_LABELS[type] },
      });
    }
  }
  return cards;
};

/** Any catalog item in the API's snake_case shape (weekly picks, ...). */
export const contentCard = (item: {
  content_type: string;
  content_id: string;
  title: string;
  poster_image?: string | null;
}): HomeCard => ({
  key: `${item.content_type}-${item.content_id}`,
  title: item.title,
  image: item.poster_image ?? undefined,
  badges: [TYPE_LABELS[item.content_type] ?? item.content_type],
  target: { kind: 'content', type: item.content_type, id: item.content_id },
});
