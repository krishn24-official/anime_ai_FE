import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getOptimizedImageUrl } from '../../../services/imageHelper';
import { SectionHeader } from './SectionHeader';
import type { BirthdayEntity } from '../../../types';

interface BirthdaySectionProps {
  birthdays: BirthdayEntity[];
}

export const BirthdaySection: React.FC<BirthdaySectionProps> = ({ birthdays }) => {
  const navigate = useNavigate();

  if (!birthdays || birthdays.length === 0) {
    return (
      <section>
        <SectionHeader 
          title="Today's Celebrations" 
          subtitle="Special events and character birthdays."
          actionRoute="/characters"
          actionText="View Calendar"
        />
        <div className="w-full p-8 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
          <p className="text-anime-text text-sm font-inter">No special celebrations scheduled for today.</p>
          <button 
            onClick={() => navigate('/characters')}
            className="text-xs font-semibold text-white/70 hover:text-white transition-colors"
          >
            Explore upcoming events
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader 
        title="Today's Celebrations" 
        subtitle="Special events and character birthdays."
        actionRoute="/characters"
        actionText="View Calendar"
      />
      
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {birthdays.map((item) => (
          <div 
            key={item.id}
            onClick={() => navigate('/characters', { state: { autoOpenName: item.name } })}
            className="group cursor-pointer relative rounded-2xl overflow-hidden border border-white/10 hover:border-anime-primary transition-all duration-300 hover:ring-2 hover:ring-anime-primary/20 hover:shadow-2xl hover:-translate-y-1 shrink-0 snap-start w-40 md:w-48 lg:w-56"
          >
            <div className="aspect-[2/3] w-full">
              <img 
                src={getOptimizedImageUrl(item.image, 400)} 
                alt={item.name} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight">
                {item.name}
              </h3>
              <p className="text-[10px] text-white/70 font-mono mt-1 line-clamp-1">{item.anime}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
