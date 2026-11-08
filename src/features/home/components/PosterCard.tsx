import React from 'react';
import { Crown, ImageOff, Share2 } from 'lucide-react';
import { getOptimizedImageUrl } from '../../../services/imageHelper';
import type { HomeCard } from '../homeCards';

interface PosterCardProps {
  card: HomeCard;
  onOpen: (card: HomeCard) => void;
  onShare?: (card: HomeCard) => void;
  rank?: number;
  crowned?: boolean;
}

/** Portrait card used by every row on the home page. */
export const PosterCard: React.FC<PosterCardProps> = ({ card, onOpen, onShare, rank, crowned }) => (
  <div role="listitem" className="group relative shrink-0 snap-start w-36 sm:w-40 lg:w-44 xl:w-48">
    <button
      onClick={() => onOpen(card)}
      className="relative block w-full aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 bg-anime-card text-left cursor-pointer transition-all duration-300 hover:border-anime-primary/70 hover:-translate-y-1 hover:shadow-xl hover:shadow-anime-primary/10 focus-visible:outline-2 focus-visible:outline-anime-primary"
    >
      {card.image ? (
        <img
          src={getOptimizedImageUrl(card.image, 400)}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <ImageOff className="absolute inset-0 m-auto w-8 h-8 text-white/15" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

      <div className="absolute top-2 left-2 flex items-center gap-1.5">
        {crowned && (
          <span title="Editor's Pick" className="w-7 h-7 rounded-lg bg-black/70 border border-anime-yellow/40 flex items-center justify-center">
            <Crown className="w-4 h-4 text-anime-yellow fill-anime-yellow" />
          </span>
        )}
        {rank !== undefined && (
          <span className="min-w-7 h-7 px-1.5 rounded-lg bg-black/70 border border-white/15 flex items-center justify-center text-xs font-bold text-white">
            {rank}
          </span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-3 space-y-1.5">
        <div className="flex flex-wrap gap-1">
          {card.badges.map((b) => (
            <span key={b} className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide bg-anime-primary/85 text-white">
              {b}
            </span>
          ))}
        </div>
        <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{card.title}</h3>
        {card.subtitle && <p className="text-[11px] text-white/65 line-clamp-1">{card.subtitle}</p>}
      </div>
    </button>

    {onShare && card.share && (
      <button
        onClick={() => onShare(card)}
        aria-label={`Share ${card.title}`}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 border border-white/20 text-white sm:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-white/20 cursor-pointer"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);
