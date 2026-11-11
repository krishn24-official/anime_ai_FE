import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { contentService } from '../../../services/contentService';
import { contentCard, type HomeCard } from '../homeCards';
import { useCardActions } from '../hooks/useCardActions';
import { SectionHeader } from './SectionHeader';
import { PosterCard } from './PosterCard';
import { PosterRail } from './PosterRail';
import { RailSkeleton } from './RailSkeleton';

export const WeeklySuggestionsSection: React.FC = () => {
  const [cards, setCards] = useState<HomeCard[] | null>(null);
  const { open, modals } = useCardActions();

  useEffect(() => {
    contentService
      .fetchWeeklySuggestions(2)
      .then((items) => setCards(items.map(contentCard)))
      .catch(() => setCards([]));
  }, []);

  if (cards?.length === 0) return null;

  return (
    <section>
      <SectionHeader icon={Heart} title="This Week's Picks" subtitle="A rotating selection of great titles to watch and read." />
      {cards === null ? (
        <RailSkeleton />
      ) : (
        <PosterRail label="This week's picks">
          {cards.map((card) => <PosterCard key={card.key} card={card} onOpen={open} />)}
        </PosterRail>
      )}
      {modals}
    </section>
  );
};
