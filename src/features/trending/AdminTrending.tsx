// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '../../store';
import { searchService, type GlobalSearchResults } from '../../services/searchService';
import { trendingService, type TrendingItem } from '../../services/trendingService';
import { Sparkles, Trash2, Loader2, AlertCircle, CheckCircle2, Search, X, UploadCloud } from 'lucide-react';
import { resolveContentImage } from '../../utils/resolveContentImage';

const AdminTrending: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useSelector((state: RootState) => state.auth);

  const [activeItems, setActiveItems] = useState<TrendingItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Form State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: string; title: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [note, setNote] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (currentUser?.is_admin) {
      loadTrending();
    }
  }, [currentUser]);

  const loadTrending = async () => {
    try {
      setLoadingItems(true);
      const data = await trendingService.adminListTrending();
      setActiveItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingItems(false);
    }
  };

  // Search Debounce
  useEffect(() => {
    const delayFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = (await searchService.globalSearch(searchQuery)) as any;
          // Depending on how the interceptor returns data, might need to check if it's nested
          setSearchResults(res.data || res); 
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
      }
    }, 500);

    return () => clearTimeout(delayFn);
  }, [searchQuery]);

  const handleSelectItem = (item: any, type: string, title: string) => {
    setSelectedItem({ id: item._id, type, title });
    setPreviewImage(resolveContentImage(item, type));
    setSearchQuery('');
    setSearchResults(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) {
      setToast({ type: 'error', message: 'Please select a content item first.' });
      return;
    }

    setFormLoading(true);
    setToast(null);

    try {
      const formData = new FormData();
      formData.append('content_type', selectedItem.type);
      formData.append('content_id', selectedItem.id);
      if (note) formData.append('note', note);
      if (expiresAt) formData.append('expires_at', new Date(expiresAt).toISOString());
      if (imageFile) formData.append('image', imageFile);

      await trendingService.adminSetTrending(formData as any);

      setToast({ type: 'success', message: 'Item pinned to trending successfully!' });
      setSelectedItem(null);
      setPreviewImage(null);
      setImageFile(null);
      setNote('');
      setExpiresAt('');
      loadTrending();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to set trending item.' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemove = async (type: string, id: string) => {
    if (!window.confirm('Are you sure you want to remove this pinned item?')) return;
    try {
      await trendingService.adminRemoveTrending(type, id);
      setToast({ type: 'success', message: 'Item removed from trending.' });
      loadTrending();
    } catch (err: any) {
      setToast({ type: 'error', message: 'Failed to remove item.' });
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-10 h-10 text-anime-primary animate-spin" />
      </div>
    );
  }

  if (!currentUser?.is_admin) {
    return (
      <div className="max-w-md mx-auto mt-20 glass-panel p-8 rounded-2xl border border-red-500/25 bg-red-500/5 text-center space-y-6">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Access Denied</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative">
      <div className="flex items-center space-x-3 border-b border-white/5 pb-4">
        <Sparkles className="w-8 h-8 text-anime-primary" />
        <h1 className="text-2xl md:text-3xl font-bold font-fraunces text-white">
          Trending Management
        </h1>
      </div>

      {toast && (
        <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
          toast.type === 'success' ? 'bg-green-500/10 border-green-500/25 text-green-400' : 'bg-red-500/10 border-red-500/25 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="text-sm flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Set Trending Form */}
        <div className="premium-card p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold text-white">Pin a Content Item</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-white uppercase">Search Content</label>
              {!selectedItem ? (
                <div className="relative z-50">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Anime, Manga, Movies, or TV Series..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:border-anime-primary outline-none"
                  />
                  <Search className="w-4 h-4 text-white/40 absolute left-4 top-3.5" />
                  {isSearching && <Loader2 className="w-4 h-4 text-anime-primary animate-spin absolute right-4 top-3.5" />}
                  
                  {/* Search Results Dropdown */}
                  {searchResults && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto p-2 space-y-2 z-50">
                      {Object.entries(searchResults).map(([type, items]) => {
                        if (!items || !Array.isArray(items) || items.length === 0 || type === 'characters') return null;
                        return (
                          <div key={type}>
                            <div className="text-[10px] font-bold text-anime-primary uppercase px-2 py-1">{type}</div>
                            {items.map((item: any) => {
                              const title = item.title?.english || item.title?.romaji || item.title || item.name;
                              const mappedType = type === 'tv_series' ? 'tv_series' : type === 'movies' ? 'movie' : type;
                              return (
                                <div 
                                  key={item._id} 
                                  onClick={() => handleSelectItem(item, mappedType, title)}
                                  className="p-2 hover:bg-white/5 rounded-lg cursor-pointer text-xs text-white"
                                >
                                  {title}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                      {!Object.values(searchResults).some((arr: any) => arr && arr.length > 0) && (
                        <div className="p-2 text-xs text-white/50 text-center">No results found</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 p-4 bg-anime-primary/5 border border-anime-primary/20 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      <div className="w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-black/50 border border-white/10 relative group">
                        {imageFile ? (
                          <img src={URL.createObjectURL(imageFile)} alt="Upload Preview" className="w-full h-full object-cover" />
                        ) : previewImage ? (
                          <img src={previewImage} alt={selectedItem.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-white/30">No Image</div>
                        )}
                        {/* Removed File Upload Overlay */}
                      </div>
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] uppercase font-bold text-anime-primary">{selectedItem.type}</span>
                        <p className="text-sm text-white font-semibold">{selectedItem.title}</p>
                        <p className="text-[10px] text-white/50 mt-2 max-w-[200px] leading-snug">
                          Using {selectedItem.title}'s existing poster by default.
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={() => { setSelectedItem(null); setPreviewImage(null); setImageFile(null); }} className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase">Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Live-action movie just dropped"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-anime-primary outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase">Expires At (Optional)</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-anime-primary outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase">Custom Poster Image (Optional)</label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center justify-center space-x-2 px-4 py-3 bg-white/5 border border-white/10 hover:border-anime-primary hover:bg-white/10 text-white rounded-xl cursor-pointer transition-colors text-xs font-semibold flex-1">
                  <UploadCloud className="w-4 h-4" />
                  <span>{imageFile ? "Change Image" : "Upload Custom Image"}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
                  }} />
                </label>
                {imageFile && (
                  <div className="flex items-center space-x-2 w-1/3">
                    <span className="text-xs text-white/70 truncate flex-1">{imageFile.name}</span>
                    <button type="button" onClick={() => setImageFile(null)} className="p-1 hover:bg-white/10 rounded text-red-400 shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-white/40">If provided, this image will be used instead of the content's default poster.</p>
            </div>

            <button
              type="submit"
              disabled={formLoading || !selectedItem}
              className="btn-glow-primary w-full py-3 bg-anime-primary text-black font-bold rounded-xl disabled:opacity-50 flex justify-center items-center space-x-2"
            >
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Pin Item</span>}
            </button>
          </form>
        </div>

        {/* Active Pins List */}
        <div className="premium-card p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold text-white">Currently Pinned</h3>
          
          {loadingItems ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-anime-primary" /></div>
          ) : activeItems.length === 0 ? (
            <div className="text-center py-10 text-white/50 text-sm">No items pinned yet.</div>
          ) : (
            <div className="space-y-3">
              {activeItems.filter(i => i.pinned).map(item => (
                <div key={`${item.content_type}-${item.content_id}`} className="flex items-center space-x-4 p-3 bg-white/5 border border-white/10 rounded-xl">
                  {item.poster_image ? (
                    <img src={item.poster_image} alt="" className="w-12 h-16 object-cover rounded-lg bg-black shrink-0" />
                  ) : (
                    <div className="w-12 h-16 bg-white/10 rounded-lg shrink-0 flex items-center justify-center">?</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{item.title}</h4>
                    <span className="text-[10px] text-anime-primary uppercase">{item.content_type} • {item.reason}</span>
                  </div>
                  <button
                    onClick={() => handleRemove(item.content_type, item.content_id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTrending;
