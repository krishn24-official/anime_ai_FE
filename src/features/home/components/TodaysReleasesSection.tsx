import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from './SectionHeader';
import type { AppDispatch, RootState } from '../../../store';
import { fetchTodaysReleasesThunk } from '../../../store/slices/todaysReleasesSlice';
import { Loader2 } from 'lucide-react';
import { EpisodeChapterSummaryModal } from '../../content/EpisodeChapterSummaryModal';

export const TodaysReleasesSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state: RootState) => state.todaysReleases);

  // Modal state for episode/chapter click-through
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryModalType, setSummaryModalType] = useState<'episode' | 'chapter'>('episode');
  const [summaryModalId, setSummaryModalId] = useState('');

  useEffect(() => {
    dispatch(fetchTodaysReleasesThunk());
  }, [dispatch]);

  const isEmpty = !loading && items.length === 0;

  if (isEmpty) {
    return null;
  }

  const handleCardClick = (item: any) => {
    if (item.event_type === 'episode_release') {
      setSummaryModalType('episode');
      setSummaryModalId(item.content_id);
      setSummaryModalOpen(true);
    } else if (item.event_type === 'chapter_release') {
      setSummaryModalType('chapter');
      setSummaryModalId(item.content_id);
      setSummaryModalOpen(true);
    } else {
      // Premiere / release_start — keep existing behavior
      navigate('/content', { state: { searchQuery: (item as any).parent_title || item.title } });
    }
  };

  return (
    <section>
      <SectionHeader 
        title="Today's Releases" 
        subtitle="What's dropping today."
        actionRoute="/schedule"
        actionText="Full Schedule"
      />
      
      {loading && (
        <div className="flex items-center justify-center p-8 border border-white/5 rounded-2xl bg-white/[0.02]">
          <Loader2 className="w-6 h-6 animate-spin text-anime-primary" />
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-center p-8 border border-red-500/20 rounded-2xl bg-red-500/5">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-8">
          <div>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {items.map((item) => (
                <div 
                  key={`${item.content_type}-${item.content_id}`}
                  onClick={() => handleCardClick(item)}
                  className="flex-none w-[140px] md:w-[160px] lg:w-[180px] group cursor-pointer snap-start"
                >
                  <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden mb-3 border border-white/5">
                    <img 
                      src={item.poster_image || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400'} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-4">
                      {(() => {
                        let bgClass = 'bg-black/60 text-white border-white/20';
                        let label = item.content_type === 'movie' ? 'Movie' : 
                                    item.content_type === 'tv_series' ? 'TV Series' : 'Anime';
                                    
                        if (item.event_type === 'release_start') {
                          bgClass = 'bg-emerald-500/80 text-white border-white/20';
                          label = 'Premiere';
                        } else if (item.event_type === 'episode_release') {
                          bgClass = 'bg-black/60 text-white border-white/20';
                          label = 'New Episode';
                        } else if (item.event_type === 'chapter_release') {
                          bgClass = 'bg-black/60 text-white border-white/20';
                          label = 'New Chapter';
                        }

                        return (
                          <span className={`self-start px-2 py-1 text-[9px] font-bold uppercase rounded-md mb-2 shadow-lg border backdrop-blur-md ${bgClass}`}>
                            {label}
                          </span>
                        );
                      })()}
                      <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight">
                        {('parent_title' in item) ? item.parent_title : item.title}
                      </h3>
                      {('parent_title' in item) && (
                        <p className="text-anime-text text-xs mt-1 line-clamp-1">
                          {item.title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
