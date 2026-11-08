import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Sparkles } from 'lucide-react';
import type { AppDispatch, RootState } from '../../../store';
import { fetchTodaysReleasesThunk } from '../../../store/slices/todaysReleasesSlice';
import type { BirthdayEntity } from '../../../types';
import { anniversaryCards, birthdayCard, releaseCard, type AnniversaryGroups, type HomeCard } from '../homeCards';
import { useCardActions } from '../hooks/useCardActions';
import { SectionHeader } from './SectionHeader';
import { PosterCard } from './PosterCard';
import { PosterRail } from './PosterRail';

const MAX_CARDS = 20; // the rest are one tap away via "See All"

interface Props {
  anniversaries: AnniversaryGroups;
  birthdays: BirthdayEntity[];
}

interface Tab {
  id: string;
  label: string;
  cards: HomeCard[];
  route: string;
}

/** Today's events, releases and birthdays as tabs. Empty tabs are hidden. */
export const TodaysHighlightsSection: React.FC<Props> = ({ anniversaries, birthdays }) => {
  const dispatch = useDispatch<AppDispatch>();
  const releases = useSelector((state: RootState) => state.todaysReleases.items);
  const { open, share, modals } = useCardActions();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTodaysReleasesThunk());
  }, [dispatch]);

  const tabs = useMemo<Tab[]>(
    () =>
      [
        { id: 'events', label: 'Events', cards: anniversaryCards(anniversaries), route: '/schedule' },
        { id: 'releases', label: 'Releases', cards: releases.map(releaseCard), route: '/schedule' },
        { id: 'birthdays', label: 'Birthdays', cards: birthdays.map((b) => birthdayCard(b)), route: '/characters' },
      ].filter((t) => t.cards.length > 0),
    [anniversaries, releases, birthdays],
  );

  if (tabs.length === 0) return null;
  const active = tabs.find((t) => t.id === selected) ?? tabs[0];

  return (
    <section className="min-w-0">
      <SectionHeader icon={Sparkles} title="Today's Highlights" subtitle="On this day: anniversaries, releases and birthdays." actionText="See All" actionRoute={active.route} />
      <div role="tablist" aria-label="Today's highlights" className="flex gap-2 mb-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === active.id}
            onClick={() => setSelected(t.id)}
            className={`shrink-0 px-4 sm:px-5 py-2 rounded-full text-sm font-semibold border transition-colors cursor-pointer ${
              t.id === active.id
                ? 'bg-anime-primary border-anime-primary text-white'
                : 'bg-white/[0.04] border-white/10 text-white/75 hover:text-white hover:border-white/25'
            }`}
          >
            {t.label} <span className="ml-1 text-xs opacity-70">{t.cards.length}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel">
        <PosterRail label={active.label}>
          {active.cards.slice(0, MAX_CARDS).map((card) => <PosterCard key={card.key} card={card} onOpen={open} onShare={share} />)}
        </PosterRail>
      </div>
      {modals}
    </section>
  );
};
