/** App-side model for the home hero. The wire format lives in services/homeService.ts. */
import type { ContentType } from './trending';

export type HeroSlideKind = 'pick' | 'trailer' | 'release' | 'news';

export interface HeroSlide {
  kind: HeroSlideKind;
  key: string;
  title: string;
  image: string;
  /** false: a portrait poster, shown framed over a blurred copy */
  imageIsWide: boolean;
  subtitle: string | null;
  description: string | null;
  /** ISO date (YYYY-MM-DD): release or publish date */
  date: string | null;
  content: { type: ContentType; id: string } | null;
  videoUrl: string | null;
  linkUrl: string | null;
}
