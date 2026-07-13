import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from './SectionHeader';
import type { AppDispatch, RootState } from '../../../store';
import { fetchTodaysReleasesThunk } from '../../../store/slices/todaysReleasesSlice';
import { Loader2 } from 'lucide-react';

export const TodaysReleasesSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state: RootState) => state.todaysReleases);

  useEffect(() => {
    dispatch(fetchTodaysReleasesThunk());
  }, [dispatch]);

  const isEmpty = !loading && items.length === 0;

  if (isEmpty) {
    return null;
  }

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
                  onClick={() => navigate('/content', { state: { searchQuery: (item as any).parent_title || item.title } })}
                  className="flex-none w-[140px] md:w-[160px] lg:w-[180px] group cursor-pointer snap-start"
                >
                  <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden mb-3 border border-white/5">
                    <img 
                      src={item.poster_image || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400'} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-4">
                      <span className="self-start px-2 py-1 text-[9px] font-bold uppercase rounded-md mb-2 shadow-lg bg-anime-primary/20 text-anime-primary border border-anime-primary/30 backdrop-blur-md">
                        {item.content_type === 'movie' ? 'Movie' : 
                         item.content_type === 'tv_series' ? 'TV Series' : 
                         (item.content_type as string) === 'episode' ? 'Episode' :
                         (item.content_type as string) === 'chapter' ? 'Chapter' : 'Anime'}
                      </span>
                      <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
