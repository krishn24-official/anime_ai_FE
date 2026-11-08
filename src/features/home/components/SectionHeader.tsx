import React from 'react';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  actionText?: string;
  actionRoute?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, icon: Icon, actionText = 'View All', actionRoute }) => (
  <div className="flex items-end justify-between gap-4 mb-5 sm:mb-6">
    <div className="flex items-start gap-3 min-w-0">
      {Icon && (
        <span className="shrink-0 mt-0.5 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-anime-primary/15 border border-anime-primary/30 flex items-center justify-center">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-anime-primary" />
        </span>
      )}
      <div className="min-w-0">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-fraunces text-white tracking-tight">{title}</h2>
        <p className="text-xs sm:text-sm text-anime-text/60 mt-0.5">{subtitle}</p>
      </div>
    </div>
    {actionRoute && (
      <Link
        to={actionRoute}
        className="shrink-0 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-anime-primary hover:text-white transition-colors group"
      >
        {actionText}
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    )}
  </div>
);
