import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Flame } from 'lucide-react';
import type { AppDispatch, RootState } from '../../../store';
import { fetchTrendingThunk } from '../../../store/slices/trendingSlice';
import { trendingCard } from '../homeCards';
import { useCardActions } from '../hooks/useCardActions';
import { SectionHeader } from './SectionHeader';
import { PosterCard } from './PosterCard';
import { PosterRail } from './PosterRail';
import { RailSkeleton } from './RailSkeleton';

export const TrendingSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading } = useSelector((state: RootState) => state.trending);
  const { open, share, modals } = useCardActions();

  useEffect(() => {
    dispatch(fetchTrendingThunk(10));
  }, [dispatch]);

  if (!loading && items.length === 0) return null;

  return (
    <section>
      <SectionHeader icon={Flame} title="Trending This Week" subtitle="The most discussed anime, movies and series right now." actionRoute="/content" />
      {loading ? (
        <RailSkeleton />
      ) : (
        <PosterRail label="Trending">
          {items.map((item, i) => (
            <PosterCard key={`${item.contentType}-${item.contentId}`} card={trendingCard(item)} rank={i + 1} crowned={item.pinned} onOpen={open} onShare={share} />
          ))}
        </PosterRail>
      )}
      {modals}
    </section>
  );
};
