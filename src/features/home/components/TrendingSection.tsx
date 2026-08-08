// @ts-nocheck
import React, { useEffect, useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SectionHeader } from './SectionHeader';
import { type RootState, type AppDispatch } from '../../../store';
import { fetchTrendingThunk } from '../../../store/slices/trendingSlice';
import { Loader2, Share2 } from 'lucide-react';

const EventCardShareModal = React.lazy(() => import('../../../components/EventCardShareModal'));

export const TrendingSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state: RootState) => state.trending);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareEventData, setShareEventData] = useState<{
    poster: string;
    title: string;
    subtitle: string;
    yearsAgo: string;
    typeLabel: string;
  } | null>(null);

  const handleShare = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setShareEventData({
      poster: item.poster_image || '',
      title: item.title || 'Trending',
      subtitle: item.note || '', // E.g., 'Trailer Released', 'New Movie'
      yearsAgo: '',
      typeLabel: '', 
    });
    setShareModalOpen(true);
  };

  useEffect(() => {
    dispatch(fetchTrendingThunk(5));
  }, [dispatch]);

  return (
    <section>
      <SectionHeader 
        title="Trending Now" 
        subtitle="The most discussed shows and movies this week."
        actionRoute="/content"
      />
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-anime-primary animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center p-8 md:p-12 border border-white/5 rounded-2xl bg-white/[0.02]">
          <p className="text-white/50 text-sm font-medium">Nothing pinned yet — check back soon.</p>
        </div>
      ) : (
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {items.map((item) => (
            <div 
              key={`${item.content_type}-${item.content_id}`}
              onClick={() => navigate('/content', { state: { contentId: item.content_id, category: item.content_type } })}
              className="group cursor-pointer relative rounded-2xl overflow-hidden border border-white/10 hover:border-anime-primary transition-all duration-300 hover:ring-2 hover:ring-anime-primary/20 hover:shadow-2xl hover:-translate-y-1 shrink-0 snap-start w-40 md:w-48 lg:w-56"
            >
              <div className="aspect-[2/3] w-full">
                {item.poster_image ? (
                  <img src={item.poster_image} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <span className="text-white/20">No Image</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-4">
                <span className="self-start px-2 py-1 bg-anime-primary text-black text-[9px] font-bold uppercase rounded-md mb-2 shadow-lg">
                  {item.reason || "Trending"}
                </span>
                <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight">
                  {item.title}
                </h3>
                
                {item.note && (
                  <p className="text-anime-primary font-medium text-[10px] mt-1 line-clamp-1 uppercase tracking-wider">
                    {item.note}
                  </p>
                )}
              </div>
              
              {/* Share button — appears on hover */}
              <button
                onClick={(e) => handleShare(e, item)}
                title="Share this card"
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/20 hover:scale-110 cursor-pointer z-10"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Share Card Modal */}
      {shareModalOpen && shareEventData && (
        <Suspense fallback={null}>
          <EventCardShareModal
            isOpen={shareModalOpen}
            onClose={() => { setShareModalOpen(false); setShareEventData(null); }}
            event={shareEventData}
          />
        </Suspense>
      )}
    </section>
  );
};
