import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchHomeDataThunk } from '../../store/slices/homeSlice';

import { HeroSection } from './components/HeroSection';
import { TrendingSection } from './components/TrendingSection';
import { BirthdaySection } from './components/BirthdaySection';
import { AISection } from './components/AISection';
import { TodaysReleasesSection } from './components/TodaysReleasesSection';
import { CollectionsSection } from './components/CollectionsSection';

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { slides, birthdays } = useSelector((state: RootState) => state.home);

  // Fetch home data on mount
  useEffect(() => {
    dispatch(fetchHomeDataThunk());
  }, [dispatch]);

  const todayStr = (() => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  })();

  const todayBirthdays = birthdays.filter(b => b.dob === todayStr);

  return (
    <div className="space-y-16 lg:space-y-24 animate-fade-in pb-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Hero Story */}
      <HeroSection slides={slides} />
      
      {/* 2. Trending Now */}
      <TrendingSection />

      {/* 3. Today's Celebrations Spotlight */}
      <BirthdaySection birthdays={todayBirthdays} />

      {/* 4. AI Companion Dashboard */}
      <AISection />

      {/* 5. Today's Releases */}
      <TodaysReleasesSection />

      {/* 6. Featured Collections */}
      <CollectionsSection />
    </div>
  );
};

export default Home;
