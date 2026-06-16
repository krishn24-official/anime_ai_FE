import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { ChevronRight, User, Calendar, Clock, X } from 'lucide-react';

const News: React.FC = () => {
  const newsItems = useSelector((state: RootState) => state.news.items);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Anime' | 'Games' | 'Movies' | 'TV-Series'>('All');
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);

  const categories: ('All' | 'Anime' | 'Games' | 'Movies' | 'TV-Series')[] = ['All', 'Anime', 'Games', 'Movies', 'TV-Series'];

  const filteredNews = newsItems.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  // Limit to latest 10 items for the active view
  const displayedNews = filteredNews.slice(0, 10);

  const activeArticle = newsItems.find(item => item.id === activeArticleId);

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative">
      {/* Header */}
      <div className="glass-panel p-8 rounded-2xl border border-anime-border">
        <span className="text-anime-primary text-xs font-semibold uppercase tracking-wider">Stay Updated</span>
        <h1 className="text-3xl font-bold font-outfit text-white mt-1">Latest News</h1>
        <p className="text-sm text-anime-text mt-1">
          Explore breaking stories, announcements, and coverage across Anime, Games, Movies, and TV-Series.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 border-b border-anime-border pb-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all w-fit shrink-0 ${
              selectedCategory === cat
                ? 'bg-anime-primary text-anime-bg shadow-lg shadow-anime-primary/20'
                : 'text-anime-text hover:text-white hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News Grid (max 10 items) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedNews.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setActiveArticleId(item.id)}
            className={`glass-panel rounded-2xl overflow-hidden border border-anime-border flex flex-col justify-between group cursor-pointer transition-all duration-300 hover:border-anime-primary/40 ${
              index === 0 ? 'md:col-span-2 md:flex-row h-fit md:h-80' : 'h-full'
            }`}
          >
            {/* Image */}
            <div className={`relative overflow-hidden shrink-0 ${
              index === 0 ? 'w-full md:w-1/2 h-56 md:h-full' : 'w-full h-48'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-t from-anime-bg/90 to-transparent z-10" />
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              />
              <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/60 border border-white/10 text-anime-primary text-[10px] font-bold rounded-lg uppercase tracking-wider">
                {item.category}
              </span>
            </div>

            {/* Info */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center space-x-3 text-xs text-anime-text/50">
                  <span className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{item.author}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </span>
                </div>

                <h3 className={`font-bold font-outfit text-white group-hover:text-anime-primary transition-all mt-3 ${
                  index === 0 ? 'text-xl md:text-2xl' : 'text-base'
                }`}>
                  {item.title}
                </h3>
                
                <p className="text-xs text-anime-text mt-3 leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-anime-primary group-hover:text-white transition-all pt-3 border-t border-white/5">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>3 min read</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>Read Article</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Drawer Modal */}
      {activeArticle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-end z-50 transition-opacity">
          <div className="w-full max-w-2xl bg-anime-bg border-l border-anime-border h-full overflow-y-auto p-8 md:p-12 relative flex flex-col justify-between">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveArticleId(null)}
              className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              {/* Image & category */}
              <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden border border-anime-border">
                <img src={activeArticle.image} alt={activeArticle.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-4 left-4 px-3 py-1 bg-black/80 text-anime-primary text-xs font-bold rounded-lg uppercase tracking-wider">
                  {activeArticle.category}
                </span>
              </div>

              {/* Title & metadata */}
              <div className="space-y-3">
                <div className="flex items-center space-x-4 text-xs text-anime-text/50">
                  <span className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Written by {activeArticle.author}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{activeArticle.date}</span>
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold font-outfit text-white leading-tight">
                  {activeArticle.title}
                </h2>
              </div>

              {/* Body */}
              <p className="text-sm md:text-base text-anime-text leading-relaxed whitespace-pre-line">
                {activeArticle.content}
              </p>
            </div>

            {/* Footer comments or share options */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-anime-text/60">Category: <strong className="text-white">{activeArticle.category}</strong></span>
              <button
                onClick={() => setActiveArticleId(null)}
                className="px-6 py-2.5 bg-white/5 border border-white/10 hover:border-anime-primary text-white text-xs font-bold rounded-xl transition-all"
              >
                Close Article
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default News;
