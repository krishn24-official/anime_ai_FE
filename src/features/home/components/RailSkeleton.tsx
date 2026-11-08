import React from 'react';

/** Placeholder row while a rail loads. */
export const RailSkeleton: React.FC = () => (
  <div className="flex gap-3 sm:gap-4 overflow-hidden" aria-hidden="true">
    {Array.from({ length: 7 }, (_, i) => (
      <div key={i} className="shrink-0 w-36 sm:w-40 lg:w-44 xl:w-48 aspect-[2/3] rounded-2xl bg-anime-card animate-pulse" />
    ))}
  </div>
);
