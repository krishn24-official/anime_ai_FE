import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchNewsThunk, setCategoryFilter, setSearchQuery, setSourceFilter, setDateRange } from '../../store/slices/newsSlice';
import { User, Calendar, X, Loader2, AlertCircle, FileText, Play, ExternalLink, Share2, Search, RefreshCw } from 'lucide-react';

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

const SOURCES = [
  { value: 'All', label: 'All Sources' },
  { value: 'crunchyroll', label: 'Crunchyroll' },
  { value: 'animenewsnetwork', label: 'Anime News Network' },
  { value: 'myanimelist', label: 'MyAnimeList' },
  { value: 'animecorner', label: 'Anime Corner' },
  { value: 'boxoffice', label: 'Box Office' },
  { value: 'youtube', label: 'YouTube' }
];

const News: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: newsItems, loading, error, categoryFilter, searchQuery, sourceFilter, startDate, endDate, page, hasMore } = useSelector((state: RootState) => state.news);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const categories: ('All' | 'Anime' | 'Games' | 'Movies' | 'TV-Series')[] = ['All', 'Anime', 'Games', 'Movies', 'TV-Series'];

  useEffect(() => {
    dispatch(fetchNewsThunk());
  }, [dispatch]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchNewsThunk({ page: 1, force: true }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setCategoryFilter(e.target.value as any));
    dispatch(fetchNewsThunk({ page: 1, force: true }));
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSourceFilter(e.target.value));
    dispatch(fetchNewsThunk({ page: 1, force: true }));
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    dispatch(setDateRange({
      startDate: type === 'start' ? value : startDate,
      endDate: type === 'end' ? value : endDate
    }));
    dispatch(fetchNewsThunk({ page: 1, force: true }));
  };

  const handleRefresh = () => {
    dispatch(fetchNewsThunk({ page: 1, force: true }));
  };

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading && hasMore) {
        dispatch(fetchNewsThunk({ page: page + 1 }));
      }
    },
    [loading, hasMore, page, dispatch]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersect]);

  const activeArticle = newsItems.find(item => item.id === activeArticleId);

  const formatAuthorName = (author: string) => {
    if (!author) return 'Moctale Official';
    return author
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8 text-white" />
          <h1 className="text-2xl md:text-3xl font-bold font-fraunces text-white tracking-wide">
            Latest News
          </h1>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-anime-border pb-4">
        
        {/* Category & Source Selectors */}
        <div className="flex space-x-3 overflow-x-auto pb-1 lg:pb-0">
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-anime-primary cursor-pointer shrink-0"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-anime-bg text-white">{cat}</option>
            ))}
          </select>

          <select
            value={sourceFilter}
            onChange={handleSourceChange}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-anime-primary cursor-pointer shrink-0"
          >
            {SOURCES.map(src => (
              <option key={src.value} value={src.value} className="bg-anime-bg text-white">{src.label}</option>
            ))}
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh news"
            className="p-2.5 rounded-xl text-anime-text hover:text-white hover:bg-white/5 transition-all shrink-0 disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Date Filters & Search */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-anime-primary w-full md:w-auto"
            />
            <span className="text-anime-text text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-anime-primary w-full md:w-auto"
            />
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search news..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-anime-primary"
            />
            <Search className="w-4 h-4 text-anime-text/40 absolute left-3 top-3.5" />
          </div>
        </div>
      </div>

      {loading && newsItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-anime-primary animate-spin" />
          <p className="text-anime-text text-sm">Fetching fresh articles...</p>
        </div>
      )}

      {error && (
        <div className="glass-panel p-6 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-center space-x-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <span className="font-semibold">Error:</span> {error}
          </div>
        </div>
      )}

      {!loading && newsItems.length === 0 && (
        <div className="glass-panel p-12 rounded-2xl border border-anime-border flex flex-col items-center justify-center text-center space-y-4">
          <FileText className="w-12 h-12 text-anime-text/40" />
          <h3 className="text-lg font-bold text-white font-fraunces">No News Found</h3>
          <p className="text-sm text-anime-text max-w-sm">
            We couldn't find any articles matching your filters.
          </p>
        </div>
      )}

      {newsItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveArticleId(item.id)}
              className="flex flex-col space-y-4 cursor-pointer group transition-all duration-300"
            >
              <div className="relative aspect-[16/11] rounded-2xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-anime-primary/20 transition-all duration-300">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 z-20 px-2.5 py-0.5 bg-black/60 border border-white/10 text-anime-primary text-[9px] font-bold rounded uppercase tracking-wider">
                  {item.category}
                </span>
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

              <div className="space-y-2.5 px-1">
                <h3 className="text-sm md:text-[15px] font-semibold text-white leading-snug tracking-wide transition-all group-hover:text-anime-primary">
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

      {/* Infinite scroll sentinel */}
      {!error && (
        <>
          <div ref={sentinelRef} className="w-full h-10" />
          {loading && newsItems.length > 0 && (
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
              <Loader2 className="w-7 h-7 text-anime-primary animate-spin" />
              <p className="text-xs text-anime-text/50">Fetching more news...</p>
            </div>
          )}
          {hasMore && !loading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
              <Loader2 className="w-7 h-7 text-anime-primary animate-spin" />
              <p className="text-xs text-anime-text/50">Scroll for more</p>
            </div>
          )}
          {newsItems.length > 0 && !hasMore && (
            <p className="text-center text-xs text-anime-text/30 py-4">All news loaded</p>
          )}
        </>
      )}

      {/* Article Detail Drawer Modal */}
      {activeArticle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-end z-50 transition-opacity" onClick={() => setActiveArticleId(null)}>
          <div className="w-full max-w-2xl bg-anime-bg border-l border-anime-border h-full overflow-y-auto p-8 md:p-12 relative flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
            
            <button
              onClick={() => setActiveArticleId(null)}
              className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden border border-anime-border">
                <img src={activeArticle.image} alt={activeArticle.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-4 left-4 px-3 py-1 bg-black/80 text-anime-primary text-xs font-bold rounded-lg uppercase tracking-wider">
                  {activeArticle.category}
                </span>
              </div>

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
                <h2 className="text-2xl md:text-3xl font-bold font-fraunces text-white leading-tight">
                  {activeArticle.title}
                </h2>
              </div>

              <p className="text-sm md:text-base text-anime-text leading-relaxed whitespace-pre-line">
                {activeArticle.content}
              </p>
            </div>

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
