import { apiClient } from './apiClient';
import type { ContentType } from '../domain/trending';
import type { HeroSlide, HeroSlideKind } from '../domain/home';

/** Wire format returned by GET /home/hero. Only this file depends on it. */
export interface HeroSlideDto {
  kind: string;
  key: string;
  title: string;
  image: string;
  image_is_wide: boolean;
  subtitle: string | null;
  description: string | null;
  date: string | null;
  content_type: string | null;
  content_id: string | null;
  video_url: string | null;
  link_url: string | null;
}

export const toHeroSlide = (dto: HeroSlideDto): HeroSlide => ({
  kind: dto.kind as HeroSlideKind,
  key: dto.key,
  title: dto.title,
  image: dto.image,
  imageIsWide: dto.image_is_wide !== false,
  subtitle: dto.subtitle ?? null,
  description: dto.description ?? null,
  date: dto.date ?? null,
  content:
    dto.content_type && dto.content_id
      ? { type: dto.content_type as ContentType, id: dto.content_id }
      : null,
  videoUrl: dto.video_url ?? null,
  linkUrl: dto.link_url ?? null,
});

export const homeService = {
  fetchHero: async (limit = 7): Promise<HeroSlide[]> => {
    const dtos = await apiClient.get<HeroSlideDto[]>('/home/hero', { params: { limit } });
    return dtos.map(toHeroSlide);
  },
};
