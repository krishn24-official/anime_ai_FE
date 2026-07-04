import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchNewsThunk } from '../../store/slices/newsSlice';
import { ChevronRight, User, Calendar, X, Loader2, AlertCircle, FileText, Play, ExternalLink, Share2 } from 'lucide-react';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const day = date.getDate();
  const fullMonths = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  let suffix = 'th';
  if (day === 1 || day === 21 || day === 31) suffix = 'st';
  else if (day === 2 || day === 22) suffix = 'nd';
  else if (day === 3 || day === 23) suffix = 'rd';
  
  return `${day}${suffix} ${fullMonths[date.getMonth()]}`;
};

const News: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: newsItems, loading, error } = useSelector((state: RootState) => state.news);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Anime' | 'Games' | 'Movies' | 'TV-Series'>('All');
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);

  const categories: ('All' | 'Anime' | 'Games' | 'Movies' | 'TV-Series')[] = ['All', 'Anime', 'Games', 'Movies', 'TV-Series'];

  useEffect(() => {
    dispatch(fetchNewsThunk(selectedCategory));
  }, [selectedCategory, dispatch]);

  const activeArticle = newsItems.find(item => item.id === activeArticleId);

  // Helper to format authors nicely
  const formatAuthorName = (author: string) => {
    if (!author) return 'Moctale Official';
    // Title case formatting
    return author
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative">
      {/* Title Header Row */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8 text-white" />
          <h1 className="text-2xl md:text-3xl font-bold font-outfit text-white tracking-wide">
            Latest News
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* Category selection inline dropdown for a cleaner look */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-anime-primary cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-anime-bg text-white">{cat}</option>
            ))}
          </select>
          <button className="p-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer text-anime-text/60 hover:text-white">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && newsItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-anime-primary animate-spin" />
          <p className="text-anime-text text-sm">Fetching fresh articles...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-panel p-6 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-center space-x-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <span className="font-semibold">Error:</span> {error}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && newsItems.length === 0 && (
        <div className="glass-panel p-12 rounded-2xl border border-anime-border flex flex-col items-center justify-center text-center space-y-4">
          <FileText className="w-12 h-12 text-anime-text/40" />
          <h3 className="text-lg font-bold text-white font-outfit">No News Found</h3>
          <p className="text-sm text-anime-text max-w-sm">
            We couldn't find any articles in this category. Run the backend ingestion pipeline to populate the news feed.
          </p>
        </div>
      )}

      {/* News Grid (3 Columns) */}
      {newsItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveArticleId(item.id)}
              className="flex flex-col space-y-4 cursor-pointer group transition-all duration-300"
            >
              {/* Card Image */}
              <div className="relative aspect-[16/11] rounded-2xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-anime-primary/20 transition-all duration-300">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 z-20 px-2.5 py-0.5 bg-black/60 border border-white/10 text-anime-primary text-[9px] font-bold rounded uppercase tracking-wider">
                  {item.category}
                </span>
                {/* Share Poster Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.dispatchEvent(new CustomEvent('open-share-poster', {
                      detail: {
                        type: 'news',
                        data: {
                          title: item.title,
                          image: item.image,
                          author: item.author,
                          date: formatDate(item.date)
                        }
                      }
                    }));
                  }}
                  className="absolute top-3 right-3 z-20 p-2 bg-black/60 hover:bg-anime-primary hover:text-black border border-white/10 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer animate-fade-in"
                  title="Create Share Poster"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Card Body */}
              <div className="space-y-2.5 px-1">
                <h3 className="text-sm md:text-[15px] font-semibold text-white leading-snug tracking-wide transition-all group-hover:text-anime-primary">
                  {/* Underline first few words to simulate entity highlights from the design screenshot */}
                  <span className="underline decoration-white/20 group-hover:decoration-anime-primary/40 mr-1">
                    {item.title.split(' ').slice(0, 2).join(' ')}
                  </span>
                  <span>{item.title.split(' ').slice(2).join(' ')}</span>
                  {item.summary && item.summary.length > 30 && (
                    <span className="text-anime-text/40 font-normal"> ...more</span>
                  )}
                </h3>
                <p className="text-[11px] text-anime-text/60 font-medium">
                  By {formatAuthorName(item.author)} • {formatDate(item.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Article Detail Drawer Modal */}
      {activeArticle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-end z-50 transition-opacity" onClick={() => setActiveArticleId(null)}>
          <div className="w-full max-w-2xl bg-anime-bg border-l border-anime-border h-full overflow-y-auto p-8 md:p-12 relative flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button
              onClick={() => setActiveArticleId(null)}
              className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all cursor-pointer"
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
                    <span>Source: {formatAuthorName(activeArticle.author)}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(activeArticle.date)}</span>
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

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-anime-text/60">Category: <strong className="text-white">{activeArticle.category}</strong></span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-share-poster', {
                      detail: {
                        type: 'news',
                        data: {
                          title: activeArticle.title,
                          image: activeArticle.image,
                          author: activeArticle.author,
                          date: formatDate(activeArticle.date)
                        }
                      }
                    }));
                  }}
                  className="px-5 py-2.5 bg-white/5 border border-white/10 hover:border-anime-primary hover:text-white text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Poster</span>
                </button>
                {activeArticle.url && (
                  <a
                    href={activeArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-anime-primary hover:bg-anime-primary/95 text-black text-xs font-bold rounded-xl transition-all flex items-center space-x-2"
                  >
                    {activeArticle.url.includes('youtube.com') || activeArticle.url.includes('youtu.be') ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>Watch Video</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Read Full Article</span>
                      </>
                    )}
                  </a>
                )}
                <button
                  onClick={() => setActiveArticleId(null)}
                  className="px-5 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default News;
