import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  actionText?: string;
  actionRoute?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, actionText = 'View All', actionRoute }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
      <div className="space-y-1.5">
        <h2 className="text-2xl md:text-3xl font-bold font-fraunces text-white tracking-tight">{title}</h2>
        <p className="text-sm font-inter text-anime-text/60">{subtitle}</p>
      </div>
      
      {actionRoute && (
        <button 
          onClick={() => navigate(actionRoute)}
          className="text-xs font-semibold font-inter text-anime-text hover:text-white flex items-center space-x-1.5 transition-all group cursor-pointer shrink-0"
        >
          <span className="uppercase tracking-widest">{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
};
