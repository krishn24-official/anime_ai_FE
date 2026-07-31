import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from './SectionHeader';
import { getOptimizedImageUrl } from '../../../services/imageHelper';
import { EpisodeChapterSummaryModal } from '../../content/EpisodeChapterSummaryModal';

interface TodaysEventsSectionProps {
  animeAnniversaries: any[];
  mangaAnniversaries: any[];
  episodeAnniversaries: any[];
  chapterAnniversaries: any[];
  movieAnniversaries?: any[];
  tvSeriesAnniversaries?: any[];
}

export const TodaysEventsSection: React.FC<TodaysEventsSectionProps> = ({
  animeAnniversaries,
  mangaAnniversaries,
  episodeAnniversaries,
  chapterAnniversaries,
  movieAnniversaries = [],
  tvSeriesAnniversaries = [],
}) => {
  const navigate = useNavigate();

  // Modal state for episode/chapter detail
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryModalType, setSummaryModalType] = useState<'episode' | 'chapter'>('episode');
  const [summaryModalId, setSummaryModalId] = useState('');

  // Normalize all event types into a unified card list
  const events: {
    id: string;
    type: 'anime' | 'manga' | 'episode' | 'chapter' | 'movie' | 'tv_series';
    title: string;
    subtitle: string;
    poster: string;
    yearsAgo: number;
    contentId?: string;
    contentType?: string;
  }[] = [];

  // Anime anniversaries
  for (const a of animeAnniversaries) {
    const titleObj = a.title || {};
    const titleStr = typeof titleObj === 'string' ? titleObj : (titleObj.english || titleObj.romaji || titleObj.japanese || 'Unknown Anime');
    const poster = a.images?.poster || a.poster || a.cover_image || '';
    events.push({
      id: `anime_${a._id}`,
      type: 'anime',
      title: titleStr,
      subtitle: 'Anime Premiere',
      poster,
      yearsAgo: a.years_ago,
      contentId: a._id,
      contentType: 'anime',
    });
  }

  // Manga anniversaries
  for (const m of mangaAnniversaries) {
    const titleStr = m.name || m.title || 'Unknown Manga';
    const poster = m.cover_image || m.poster || m.images?.poster || '';
    events.push({
      id: `manga_${m._id}`,
      type: 'manga',
      title: titleStr,
      subtitle: 'Manga Debut',
      poster,
      yearsAgo: m.years_ago,
      contentId: m._id,
      contentType: 'manga',
    });
  }

  // Movie anniversaries
  for (const m of movieAnniversaries) {
    const titleStr = m.title || 'Unknown Movie';
    const poster = m.images?.poster || m.poster || '';
    events.push({
      id: `movie_${m._id}`,
      type: 'movie',
      title: titleStr,
      subtitle: 'Movie Premiere',
      poster,
      yearsAgo: m.years_ago,
      contentId: m._id,
      contentType: 'movie',
    });
  }

  // TV Series anniversaries
  for (const tv of tvSeriesAnniversaries) {
    const titleStr = tv.title || 'Unknown TV Series';
    const poster = tv.images?.poster || tv.poster || '';
    events.push({
      id: `tv_${tv._id}`,
      type: 'tv_series',
      title: titleStr,
      subtitle: 'Series Premiere',
      poster,
      yearsAgo: tv.years_ago,
      contentId: tv._id,
      contentType: 'tv_series',
    });
  }

  // Episode anniversaries
  for (const ep of episodeAnniversaries) {
    events.push({
      id: `ep_${ep.content_id}`,
      type: 'episode',
      title: ep.parent_title || 'Unknown',
      subtitle: ep.title || `Episode`,
      poster: ep.poster_image || '',
      yearsAgo: ep.years_ago,
      contentId: ep.content_id,
    });
  }

  // Chapter anniversaries
  for (const ch of chapterAnniversaries) {
    events.push({
      id: `ch_${ch.content_id}`,
      type: 'chapter',
      title: ch.parent_title || 'Unknown',
      subtitle: ch.title || `Chapter`,
      poster: ch.poster_image || '',
      yearsAgo: ch.years_ago,
      contentId: ch.content_id,
    });
  }

  if (events.length === 0) {
    return null;
  }

  const handleCardClick = (event: typeof events[0]) => {
    if (event.type === 'episode') {
      setSummaryModalType('episode');
      setSummaryModalId(event.contentId || '');
      setSummaryModalOpen(true);
    } else if (event.type === 'chapter') {
      setSummaryModalType('chapter');
      setSummaryModalId(event.contentId || '');
      setSummaryModalOpen(true);
    } else if (event.type === 'anime') {
      navigate(`/content/anime/${event.contentId}`);
    } else if (event.type === 'manga') {
      navigate(`/content/manga/${event.contentId}`);
    } else if (event.type === 'movie') {
      navigate(`/content/movie/${event.contentId}`);
    } else if (event.type === 'tv_series') {
      navigate(`/content/tv_series/${event.contentId}`);
    }
  };

  const getYearsAgoLabel = (years: number) => {
    if (years === 1) return '1 Year Ago';
    return `${years} Years Ago`;
  };

  return (
    <section>
      <SectionHeader
        title="Today's Events"
        subtitle="On this day in anime & manga history."
        actionRoute="/schedule"
        actionText="Full Schedule"
      />

      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => handleCardClick(event)}
            className="flex-none w-[140px] md:w-[160px] lg:w-[180px] group cursor-pointer snap-start"
          >
            <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden mb-3 border border-white/5">
              <img
                src={event.poster ? getOptimizedImageUrl(event.poster, 400) : 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400'}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-4">
                {/* Years Ago Badge */}
                <span className="self-start px-2 py-1 text-[9px] font-bold uppercase rounded-md mb-2 shadow-lg border backdrop-blur-md bg-amber-500/80 text-white border-white/20">
                  {getYearsAgoLabel(event.yearsAgo)}
                </span>

                {/* Type Badge */}
                <span className="self-start px-2 py-1 text-[9px] font-bold uppercase rounded-md mb-2 shadow-lg border backdrop-blur-md bg-black/60 text-white border-white/20">
                  {event.type === 'anime' ? 'Anime' : event.type === 'manga' ? 'Manga' : event.type === 'movie' ? 'Movie' : event.type === 'tv_series' ? 'TV' : event.type === 'episode' ? 'Episode' : 'Chapter'}
                </span>

                <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight">
                  {event.title}
                </h3>
                <p className="text-anime-text text-xs mt-1 line-clamp-1">
                  {event.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Episode/Chapter Summary Modal */}
      <EpisodeChapterSummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        type={summaryModalType}
        contentId={summaryModalId}
      />
    </section>
  );
};
