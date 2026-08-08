import React, { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { getOptimizedImageUrl } from '../../../services/imageHelper';
import { SectionHeader } from './SectionHeader';
import type { BirthdayEntity } from '../../../types';
const EventCardShareModal = React.lazy(() => import('../../../components/EventCardShareModal'));

interface BirthdaySectionProps {
  birthdays: BirthdayEntity[];
}

export const BirthdaySection: React.FC<BirthdaySectionProps> = ({ birthdays }) => {
  const navigate = useNavigate();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareEventData, setShareEventData] = useState<{
    poster: string;
    title: string;
    subtitle: string;
    yearsAgo: string;
    typeLabel: string;
  } | null>(null);

  const handleShare = (e: React.MouseEvent, item: BirthdayEntity) => {
    e.stopPropagation();
    
    // Format date like "8 Aug"
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    
    setShareEventData({
      poster: item.image || '',
      title: `Happy Birthday ${item.name}`,
      subtitle: '',
      yearsAgo: formattedDate,
      typeLabel: '',
    });
    setShareModalOpen(true);
  };

  if (!birthdays || birthdays.length === 0) {
    return (
      <section>
        <SectionHeader 
          title="Today's Birthdays" 
          subtitle="Character birthdays happening today."
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
        title="Today's Birthdays" 
        subtitle="Character birthdays happening today."
        actionRoute="/characters"
        actionText="View Calendar"
      />
      
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {birthdays.map((item) => (
          <div 
            key={item.id}
            onClick={() => {
              if (item.type === 'actor' || item.type === 'voice_actor') {
                navigate(`/actors/${item.id}`);
              } else {
                navigate('/characters', { state: { autoOpenName: item.name } });
              }
            }}
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
