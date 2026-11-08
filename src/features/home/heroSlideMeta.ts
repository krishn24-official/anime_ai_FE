import type { HeroSlide } from '../../domain/home';

/** YYYY-MM-DD in the viewer's time zone. */
const localIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' });

const SOURCE_NAMES: Record<string, string> = {
  thr: 'The Hollywood Reporter',
  animenewsnetwork: 'Anime News Network',
  animecorner: 'Anime Corner',
  myanimelist: 'MyAnimeList',
  bollywood_hungama: 'Bollywood Hungama',
  slashfilm: '/Film',
  boxoffice: 'Boxoffice',
};

const sourceName = (source: string) =>
  SOURCE_NAMES[source] ?? source.charAt(0).toUpperCase() + source.slice(1);

/** The small chip above the title. */
export const slideBadge = (slide: HeroSlide, today = new Date()): string => {
  switch (slide.kind) {
    case 'pick':
      return "Editor's Pick";
    case 'trailer':
      return 'New Trailer';
    case 'news':
      return 'News';
    case 'release':
      return slide.date && slide.date <= localIso(today) ? 'Out Now' : 'Coming Soon';
  }
};

/** The accent line under the title. */
export const slideSubtitle = (slide: HeroSlide): string | null => {
  if (slide.kind === 'news') {
    const source = slide.subtitle ? sourceName(slide.subtitle) : null;
    return [source, slide.date && shortDate(slide.date)].filter(Boolean).join(' · ') || null;
  }
  if (slide.kind === 'release' && slide.date) return `Releases ${shortDate(slide.date)}`;
  return slide.subtitle;
};

export type SlideAction = 'trailer' | 'article' | 'details';

/** What the main button does. */
export const primaryAction = (slide: HeroSlide): SlideAction => {
  if (slide.kind === 'news' && slide.linkUrl) return 'article';
  if ((slide.kind === 'trailer' || slide.kind === 'release') && slide.videoUrl) return 'trailer';
  return 'details';
};

/** Smaller TMDb renditions for phones; other hosts are used as-is. */
export const imageSrcSet = (url: string): string | undefined =>
  url.includes('image.tmdb.org/t/p/w1280/')
    ? `${url.replace('/w1280/', '/w780/')} 780w, ${url} 1280w`
    : undefined;
