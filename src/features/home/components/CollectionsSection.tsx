import React from 'react';
import { SectionHeader } from './SectionHeader';

export const CollectionsSection: React.FC = () => {
  return (
    <section>
      <SectionHeader 
        title="Featured Collections" 
        subtitle="Hand-curated selections by the AniVerse editorial team."
      />
      <div className="flex items-center justify-center p-8 md:p-12 border border-white/5 rounded-2xl bg-white/[0.02]">
        <p className="text-white/50 text-sm font-medium">Featured collections are currently unavailable.</p>
      </div>
    </section>
  );
};
