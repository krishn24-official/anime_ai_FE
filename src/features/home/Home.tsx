import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchHomeDataThunk } from '../../store/slices/homeSlice';
import { HeroSection } from './components/HeroSection';
import { TrendingSection } from './components/TrendingSection';
import { TodaysHighlightsSection } from './components/TodaysHighlightsSection';
import { AISection } from './components/AISection';
import { WeeklySuggestionsSection } from './components/WeeklySuggestionsSection';

/** MM-DD, the format birthdays are stored in. */
const todayMonthDay = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const home = useSelector((state: RootState) => state.home);

  useEffect(() => {
    dispatch(fetchHomeDataThunk());
  }, [dispatch]);

  const birthdays = useMemo(() => home.birthdays.filter((b) => b.dob === todayMonthDay()), [home.birthdays]);
  const anniversaries = useMemo(
    () => ({
      anime: home.animeAnniversaries,
      manga: home.mangaAnniversaries,
      movie: home.movieAnniversaries,
      tv_series: home.tvSeriesAnniversaries,
      episode: home.episodeAnniversaries,
      chapter: home.chapterAnniversaries,
    }),
    [home],
  );

  return (
    <div className="space-y-10 sm:space-y-14 animate-fade-in pb-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <HeroSection />
      <TrendingSection />
      <div className="flex flex-col xl:flex-row gap-10 xl:gap-6">
        <div className="flex-1 min-w-0">
          <TodaysHighlightsSection anniversaries={anniversaries} birthdays={birthdays} />
        </div>
        <div className="xl:w-[360px] shrink-0">
          <AISection />
        </div>
      </div>
      <WeeklySuggestionsSection />
    </div>
  );
};

export default Home;
