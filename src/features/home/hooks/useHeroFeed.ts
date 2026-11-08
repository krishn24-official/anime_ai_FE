import { useEffect, useState } from 'react';
import type { HeroSlide } from '../../../domain/home';
import { homeService } from '../../../services/homeService';

/** Hero slides for the home page. An empty list on failure: the hero just hides. */
export const useHeroFeed = (limit = 7) => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    homeService
      .fetchHero(limit)
      .then((data) => active && setSlides(data))
      .catch(() => active && setSlides([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [limit]);

  return { slides, loading };
};
