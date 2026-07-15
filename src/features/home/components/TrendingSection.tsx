// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SectionHeader } from './SectionHeader';
import { type RootState, type AppDispatch } from '../../../store';
import { fetchTrendingThunk } from '../../../store/slices/trendingSlice';
import { Loader2 } from 'lucide-react';

export const TrendingSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state: RootState) => state.trending);

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
                  <div className="overflow-hidden transition-all duration-300 max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 group-hover:mt-3">
                    <p className="text-[10px] text-anime-text/90 italic line-clamp-3 bg-black/40 p-2 rounded-lg border border-white/5">
                      "{item.note}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
