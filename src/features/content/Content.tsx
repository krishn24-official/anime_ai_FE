import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import {
  fetchContentData,
  toggleWatchlistThunk,
  rateContentThunk,
  addCommentThunk,
  fetchCommentsThunk
} from '../../store/slices/contentSlice';
import { Star, Plus, Check, MessageSquare, Send, X, Eye, Loader2, Search } from 'lucide-react';
import type { FrontendCategory } from '../../services/contentService';
import { useLocation } from 'react-router-dom';

const Content: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, watchlist, ratings, comments, loading, error } = useSelector((state: RootState) => state.content);
  
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'All' | 'Anime' | 'Manga' | 'Movies' | 'TV-Series'>('All');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoOpenTitle, setAutoOpenTitle] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchContentData());
  }, [dispatch]);

  useEffect(() => {
    if (location.state && (location.state as any).searchQuery) {
      const q = (location.state as any).searchQuery;
      setSearchQuery(q);
      setAutoOpenTitle(q);
      // Reset the active tab to 'All' or match the category if needed so the item can actually be found
      setActiveTab('All');
      // Clear navigation state to prevent persistence on manual page refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (autoOpenTitle && items.length > 0) {
      // Find exact or case-insensitive title match first
      const exactMatch = items.find(
        (item) => item.title.toLowerCase() === autoOpenTitle.toLowerCase()
      );
      if (exactMatch) {
        setSelectedItemId(exactMatch.id);
      } else {
        // Fallback to closest partial match
        const partialMatch = items.find(
          (item) => item.title.toLowerCase().includes(autoOpenTitle.toLowerCase())
        );
        if (partialMatch) {
          setSelectedItemId(partialMatch.id);
        }
      }
      setAutoOpenTitle(null);
    }
  }, [autoOpenTitle, items]);

  const tabs: ('All' | 'Anime' | 'Manga' | 'Movies' | 'TV-Series')[] = ['All', 'Anime', 'Manga', 'Movies', 'TV-Series'];

  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === 'All' || item.category === activeTab;
    const matchesWatchlist = !showWatchlistOnly || watchlist.includes(item.id);
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesWatchlist && matchesSearch;
  });

  const selectedItem = items.find(item => item.id === selectedItemId);
  const activeComments = selectedItemId ? comments[selectedItemId] || [] : [];
  const userRating = selectedItemId ? ratings[selectedItemId] || 0 : 0;

  // Load comments when drawer is opened
  useEffect(() => {
    if (selectedItem) {
      dispatch(fetchCommentsThunk({ category: selectedItem.category as FrontendCategory, id: selectedItem.id }));
    }
  }, [selectedItemId, dispatch]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !commentText.trim()) return;
    dispatch(addCommentThunk({
      category: selectedItem.category as FrontendCategory,
      id: selectedItem.id,
      text: commentText
    }));
    setCommentText('');
  };

  const handleRating = (id: string, category: string, score: number) => {
    dispatch(rateContentThunk({ category: category as FrontendCategory, id, stars: score }));
  };

  const handleToggleWatchlist = (id: string, category: string) => {
    dispatch(toggleWatchlistThunk({ category: category as FrontendCategory, id }));
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-2xl border border-anime-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-anime-primary text-xs font-semibold uppercase tracking-wider">Media Catalog</span>
          <h1 className="text-3xl font-bold font-outfit text-white mt-1">Explore Content</h1>
          <p className="text-sm text-anime-text mt-1">
            Browse through your favorite anime, manga, movies, and TV-series. Rate your matches, write feedback, and build your custom watchlist.
          </p>
        </div>

        {/* Watchlist toggle */}
        <button
          onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
          className={`flex items-center space-x-2 px-5 py-3 rounded-xl border font-bold text-xs transition-all ${
            showWatchlistOnly
              ? 'bg-anime-primary border-anime-primary text-anime-bg'
              : 'bg-white/5 border-white/10 hover:border-anime-primary text-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>{showWatchlistOnly ? "Showing Watchlist" : "View Watchlist"}</span>
          <span className="ml-1 px-1.5 py-0.5 bg-black/20 rounded-md text-[10px]">{watchlist.length}</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-anime-border pb-4">
        {/* Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-1 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all w-fit shrink-0 ${
                activeTab === tab
                  ? 'bg-anime-primary text-anime-bg shadow-lg shadow-anime-primary/20'
                  : 'text-anime-text hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search content..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-anime-primary"
          />
          <Search className="w-4 h-4 text-anime-text/40 absolute left-3 top-3.5" />
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-anime-primary animate-spin" />
          <p className="text-sm text-anime-text/60 font-medium">Syncing database items...</p>
        </div>
      )}

      {error && (
        <div className="glass-panel p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center space-y-2">
          <p className="text-sm text-red-400 font-semibold">Error Syncing Library</p>
          <p className="text-xs text-anime-text/60">{error}</p>
        </div>
      )}

      {/* Catalog Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isAdded = watchlist.includes(item.id);
            return (
              <div
                key={item.id}
                className="glass-panel rounded-2xl overflow-hidden border border-anime-border flex flex-col group relative hover:border-anime-primary/30 transition-all duration-300 shadow-lg"
              >
                {/* Poster Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-black/40">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    loading="lazy"
                  />
                  
                  {/* Watchlist quick button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleWatchlist(item.id, item.category);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-xl transition-all z-20 border ${
                      isAdded
                        ? 'bg-anime-primary border-anime-primary text-anime-bg'
                        : 'bg-black/60 border-white/10 text-white hover:bg-anime-primary hover:text-anime-bg'
                    }`}
                  >
                    {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>

                  {/* Hover Quick View overlay */}
                  <div 
                    onClick={() => setSelectedItemId(item.id)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10 cursor-pointer"
                  >
                    <span className="px-4 py-2 bg-anime-primary text-anime-bg font-bold text-xs rounded-xl shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      View Details
                    </span>
                  </div>
                </div>

                {/* Title & Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] text-anime-secondary font-semibold uppercase">{item.category}</span>
                    <h3 className="font-bold text-sm text-white line-clamp-1 mt-1">{item.title}</h3>
                    <div className="text-xs text-anime-text/50 mt-1">
                      <span>{item.releaseYear}</span>
                    </div>
                  </div>

                  {/* Rating display removed from front */}
                </div>
              </div>
            );
          })}
          {filteredItems.length === 0 && (
            <p className="text-sm text-anime-text/60 italic col-span-4 py-8">No content found matching the criteria.</p>
          )}
        </div>
      )}

      {/* Detail & Comments Drawer Modal */}
      {selectedItem && (
        <div 
          onClick={() => setSelectedItemId(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-opacity"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-anime-bg border border-anime-border rounded-2xl max-h-[90vh] overflow-y-auto p-8 relative flex flex-col justify-between"
          >
            
            {/* Close */}
            <button
              onClick={() => setSelectedItemId(null)}
              className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all animate-fade-in"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              {/* Poster and Title banner */}
              <div className="flex space-x-4 items-start pt-6">
                <img src={selectedItem.poster} alt={selectedItem.title} className="w-24 rounded-xl border border-anime-border object-cover aspect-[3/4]" />
                <div>
                  <span className="text-xs text-anime-secondary font-semibold uppercase">{selectedItem.category}</span>
                  <h2 className="text-xl md:text-2xl font-bold font-outfit text-white leading-tight mt-1">{selectedItem.title}</h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <Star className="w-4 h-4 fill-anime-yellow text-anime-yellow" />
                    <span className="text-sm font-bold text-white">{selectedItem.averageRating}</span>
                    <span className="text-xs text-anime-text/60">• Released {selectedItem.releaseYear}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-anime-text leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                {selectedItem.description}
              </p>

              {/* Rating widget */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Rate this title</span>
                <div className="flex space-x-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(selectedItem.id, selectedItem.category, star)}
                      className="focus:outline-none transform hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${
                        star <= userRating ? 'fill-anime-yellow text-anime-yellow' : 'text-anime-text/30'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Watchlist toggle */}
              <button
                onClick={() => handleToggleWatchlist(selectedItem.id, selectedItem.category)}
                className={`w-full py-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center space-x-2 ${
                  watchlist.includes(selectedItem.id)
                    ? 'bg-anime-primary border-anime-primary text-anime-bg'
                    : 'bg-white/5 border-white/10 hover:border-anime-primary text-white'
                }`}
              >
                {watchlist.includes(selectedItem.id) ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>In Your Watchlist</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to Watchlist</span>
                  </>
                )}
              </button>

              {/* Comments Section */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-anime-primary" />
                  <span>Comments & Reviews ({activeComments.length})</span>
                </h3>

                {/* Comment list */}
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {activeComments.map((com) => (
                    <div key={com.id} className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-anime-primary">{com.username}</strong>
                        <span className="text-[10px] text-anime-text/40">{com.timestamp}</span>
                      </div>
                      <p className="text-white/90 leading-relaxed">{com.text}</p>
                    </div>
                  ))}
                  {activeComments.length === 0 && (
                    <p className="text-xs text-anime-text/50 italic py-2">No comments yet. Be the first to share your thoughts!</p>
                  )}
                </div>

                {/* Comment Form */}
                <form onSubmit={handlePostComment} className="space-y-2">
                  <div className="relative">
                    <textarea
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-3 pr-10 text-xs text-white focus:outline-none focus:border-anime-primary resize-none"
                    />
                    <button
                      type="submit"
                      className="absolute right-2.5 bottom-3.5 p-1.5 bg-anime-primary text-anime-bg rounded-lg hover:bg-white hover:text-anime-primary transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Content;
