import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Horizontal, swipeable row of cards. Arrow buttons on wide screens. */
export const PosterRail: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <div className="relative group/rail">
      <div
        ref={ref}
        role="list"
        aria-label={label}
        className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      {[-1, 1].map((dir) => (
        <button
          key={dir}
          onClick={() => scroll(dir)}
          aria-label={dir < 0 ? `Scroll ${label} left` : `Scroll ${label} right`}
          className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 ${dir < 0 ? '-left-4' : '-right-4'} w-10 h-10 items-center justify-center rounded-full bg-anime-card/95 border border-white/15 text-white opacity-0 group-hover/rail:opacity-100 focus-visible:opacity-100 hover:bg-anime-primary transition-all cursor-pointer z-10`}
        >
          {dir < 0 ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      ))}
    </div>
  );
};
