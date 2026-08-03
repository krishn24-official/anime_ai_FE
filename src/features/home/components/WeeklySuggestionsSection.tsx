import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from './SectionHeader';
import { contentService } from '../../../services/contentService';
import { Loader2 } from 'lucide-react';

export const WeeklySuggestionsSection: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const data = await contentService.fetchWeeklySuggestions(2);
        setItems(data);
      } catch (err) {
        setError('Failed to load weekly suggestions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  const isEmpty = !loading && items.length === 0;

  if (isEmpty) {
    return null;
  }

  const handleCardClick = (item: any) => {
    navigate('/content', { state: { searchQuery: item.title } });
  };

  return (
    <section>
      <SectionHeader 
        title="This Week's Picks" 
        subtitle="Our rotating selection of great titles to watch and read."
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
                        let label = item.content_type === 'movie' ? 'Movie' : 
                                    item.content_type === 'tv_series' ? 'TV Series' : 
                                    item.content_type === 'manga' ? 'Manga' : 'Anime';
                                    
                        return (
                          <span className="self-start px-2 py-1 text-[9px] font-bold uppercase rounded-md mb-2 shadow-lg border backdrop-blur-md bg-black/60 text-white border-white/20">
                            {label}
                          </span>
                        );
                      })()}
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
