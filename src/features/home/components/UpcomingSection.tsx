import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from './SectionHeader';
import type { AppDispatch, RootState } from '../../../store';
import { fetchUpcomingThunk } from '../../../store/slices/upcomingSlice';
import { Calendar, Clock, Loader2 } from 'lucide-react';

export const UpcomingSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { dated, estimated, loading, error } = useSelector((state: RootState) => state.upcoming);

  useEffect(() => {
    dispatch(fetchUpcomingThunk());
  }, [dispatch]);

  const isEmpty = !loading && dated.length === 0 && estimated.length === 0;

  return (
    <section>
      <SectionHeader 
        title="Upcoming Releases" 
        subtitle="Your chronological guide to what's dropping next."
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

      {isEmpty && (
        <div className="flex items-center justify-center p-8 md:p-12 border border-white/5 rounded-2xl bg-white/[0.02]">
          <p className="text-white/50 text-sm font-medium">Nothing scheduled yet -- check back soon.</p>
        </div>
      )}

      {!loading && !isEmpty && (
        <div className="space-y-8">
          {dated.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white mb-4 flex items-center"><Calendar className="w-4 h-4 mr-2 text-anime-primary" /> Confirmed Dates</h3>
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {dated.map((item) => (
                  <div 
                    key={`${item.content_type}-${item.content_id}`}
                    onClick={() => navigate('/content', { state: { searchQuery: item.title } })}
                    className="flex-none w-[140px] md:w-[160px] lg:w-[180px] group cursor-pointer snap-start"
                  >
                    <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden mb-3">
                      <img 
                        src={item.poster_image || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400'} 
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-4">
                        <span className="self-start px-2 py-1 text-[9px] font-bold uppercase rounded-md mb-2 shadow-lg bg-anime-primary/20 text-anime-primary border border-anime-primary/30 backdrop-blur-md">
                          {item.content_type === 'movie' ? 'Movie' : 'TV Series'}
                        </span>
                        <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight">
                          {item.title}
                        </h3>
                        <div className="flex items-center mt-2 text-anime-text/60 text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{new Date(item.release_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {estimated.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white mb-4 flex items-center"><Clock className="w-4 h-4 mr-2 text-anime-secondary" /> Coming Later</h3>
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {estimated.map((item) => (
                  <div 
                    key={`${item.content_type}-${item.content_id}`}
                    onClick={() => navigate('/content', { state: { searchQuery: item.title } })}
                    className="flex-none w-[140px] md:w-[160px] lg:w-[180px] group cursor-pointer snap-start"
                  >
                    <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden mb-3 border border-white/5">
                      <img 
                        src={item.poster_image || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400'} 
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-4">
                        <span className="self-start px-2 py-1 text-[9px] font-bold uppercase rounded-md mb-2 shadow-lg bg-anime-secondary/20 text-anime-secondary border border-anime-secondary/30 backdrop-blur-md">
                          {item.content_type === 'movie' ? 'Movie' : item.content_type === 'tv_series' ? 'TV Series' : 'Anime'}
                        </span>
                        <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight">
                          {item.title}
                        </h3>
                        <div className="flex items-center mt-2 text-anime-text/60 text-xs font-semibold">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{item.season_label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
