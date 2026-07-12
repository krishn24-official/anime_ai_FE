import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, LogOut, Menu, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { logoutUserThunk } from '../store/slices/authSlice';
import { searchService } from '../services/searchService';
import type { GlobalSearchResults } from '../services/searchService';

interface HeaderProps {
  title?: string;
  isSidebarCollapsed?: boolean;
  notifications?: {
    id: string;
    title: string;
    category: string;
    image: string;
    url?: string;
  }[];
  onClearNotifications?: () => void;
  onDismissNotification?: (id: string) => void;
  onToggleMobileSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "Welcome back, Otaku!", 
  isSidebarCollapsed = false,
  notifications = [],
  onClearNotifications,
  onDismissNotification,
  onToggleMobileSidebar
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.auth);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchResults | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      setIsSearchOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearchLoading(true);
      setIsSearchOpen(true);
      try {
        const results = await searchService.globalSearch(searchQuery.trim());
        setSearchResults(results);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleLogout = async () => {
    await dispatch(logoutUserThunk());
    navigate('/');
  };

  const hasResults = searchResults && (
    searchResults.characters.length > 0 ||
    searchResults.anime.length > 0 ||
    searchResults.manga.length > 0 ||
    searchResults.movies.length > 0 ||
    searchResults.tv_series.length > 0
  );

  return (
    <header className={`h-[72px] fixed top-0 right-0 bg-anime-bg/95 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 sm:px-10 z-40 transition-all duration-300 w-full ${
      isSidebarCollapsed ? 'lg:w-[calc(100%-72px)]' : 'lg:w-[calc(100%-260px)]'
    }`}>
      {/* LEFT: Page Title */}
      <div className="flex items-center space-x-3 w-auto lg:w-1/4 min-w-0 shrink-0">
        {/* Mobile Hamburger menu */}
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Open navigation sidebar"
          className="p-2 rounded-[14px] bg-white/5 hover:bg-white/10 text-white lg:hidden cursor-pointer shrink-0 transition-all"
        >
          <Menu className="w-[18px] h-[18px]" strokeWidth={2} />
        </button>

        <h1 className="text-lg md:text-xl lg:text-2xl font-bold font-fraunces text-white tracking-tight truncate">
          {title}
        </h1>
      </div>
      
      {/* CENTER: Global Search */}
      <div ref={searchContainerRef} className="flex-1 flex justify-center max-w-[560px] px-4 hidden md:flex relative z-50">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim().length >= 2) {
                setIsSearchOpen(true);
              }
            }}
            placeholder="Search AniVerse..."
            className="w-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.12] focus:bg-white/[0.12] rounded-[14px] py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-anime-text/40 font-inter"
          />
          <Search className="w-[18px] h-[18px] text-anime-text/50 absolute left-4 top-3" strokeWidth={2} />

          {isSearchOpen && (
            <div className="absolute left-0 mt-3 w-full bg-anime-bg/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
              {isSearchLoading ? (
                <div className="p-6 text-center text-xs text-anime-text/60 flex items-center justify-center space-x-2">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-anime-primary border-t-transparent rounded-full" />
                  <span>Searching databases...</span>
                </div>
              ) : !hasResults ? (
                <div className="p-6 text-center text-xs text-anime-text/40">
                  No matching entries found
                </div>
              ) : (
                <div className="p-4 space-y-4 divide-y divide-white/5">
                  {/* Characters */}
                  {searchResults.characters.length > 0 && (
                    <div className="pt-2 first:pt-0">
                      <span className="text-[10px] font-bold text-anime-primary uppercase tracking-wider block mb-2 px-1">Characters</span>
                      <div className="space-y-1">
                        {searchResults.characters.map(char => (
                          <div
                            key={char._id}
                            onClick={() => {
                              navigate('/characters', { state: { autoOpenName: char.name } });
                              setSearchQuery('');
                              setIsSearchOpen(false);
                            }}
                            className="flex items-center space-x-3 p-1.5 hover:bg-white/5 rounded-xl cursor-pointer transition-all"
                          >
                            <img
                              src={char.images?.profile || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt={char.name}
                              className="w-8 h-10 rounded-lg object-cover bg-white/5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{char.name}</p>
                              <p className="text-[10px] text-anime-text/60">{char.role || 'Character'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Anime */}
                  {searchResults.anime.length > 0 && (
                    <div className="pt-3">
                      <span className="text-[10px] font-bold text-anime-yellow uppercase tracking-wider block mb-2 px-1">Anime</span>
                      <div className="space-y-1">
                        {searchResults.anime.map(item => (
                          <div
                            key={item._id}
                            onClick={() => {
                              searchService.logSearchClick('anime', item._id, searchQuery);
                              const title = item.title?.english || item.title?.romaji || 'Untitled';
                              navigate('/content', { state: { searchQuery: title } });
                              setSearchQuery('');
                              setIsSearchOpen(false);
                            }}
                            className="flex items-center space-x-3 p-1.5 hover:bg-white/5 rounded-xl cursor-pointer transition-all"
                          >
                            <img
                              src={item.images?.poster || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=100'}
                              alt={item.title?.english || item.title?.romaji || 'Anime poster'}
                              className="w-8 h-10 rounded-lg object-cover bg-white/5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{item.title?.english || item.title?.romaji || 'Untitled'}</p>
                              <p className="text-[10px] text-anime-text/60">{item.year || 'Anime'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manga */}
                  {searchResults.manga.length > 0 && (
                    <div className="pt-3">
                      <span className="text-[10px] font-bold text-anime-pink uppercase tracking-wider block mb-2 px-1">Manga</span>
                      <div className="space-y-1">
                        {searchResults.manga.map(item => (
                          <div
                            key={item._id}
                            onClick={() => {
                              searchService.logSearchClick('manga', item._id, searchQuery);
                              navigate('/content', { state: { searchQuery: item.name } });
                              setSearchQuery('');
                              setIsSearchOpen(false);
                            }}
                            className="flex items-center space-x-3 p-1.5 hover:bg-white/5 rounded-xl cursor-pointer transition-all"
                          >
                            <img
                              src={item.cover_image || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=100'}
                              alt={item.name}
                              className="w-8 h-10 rounded-lg object-cover bg-white/5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                              <p className="text-[10px] text-anime-text/60">{item.status || 'Manga'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Movies */}
                  {searchResults.movies.length > 0 && (
                    <div className="pt-3">
                      <span className="text-[10px] font-bold text-anime-purple uppercase tracking-wider block mb-2 px-1">Movies</span>
                      <div className="space-y-1">
                        {searchResults.movies.map(item => (
                          <div
                            key={item._id}
                            onClick={() => {
                              searchService.logSearchClick('movie', item._id, searchQuery);
                              navigate('/content', { state: { searchQuery: item.title } });
                              setSearchQuery('');
                              setIsSearchOpen(false);
                            }}
                            className="flex items-center space-x-3 p-1.5 hover:bg-white/5 rounded-xl cursor-pointer transition-all"
                          >
                            <img
                              src={item.images?.poster || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=100'}
                              alt={item.title}
                              className="w-8 h-10 rounded-lg object-cover bg-white/5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                              <p className="text-[10px] text-anime-text/60">{item.year || 'Movie'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TV Series */}
                  {searchResults.tv_series.length > 0 && (
                    <div className="pt-3">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block mb-2 px-1">TV Series</span>
                      <div className="space-y-1">
                        {searchResults.tv_series.map(item => (
                          <div
                            key={item._id}
                            onClick={() => {
                              searchService.logSearchClick('tv_series', item._id, searchQuery);
                              navigate('/content', { state: { searchQuery: item.title } });
                              setSearchQuery('');
                              setIsSearchOpen(false);
                            }}
                            className="flex items-center space-x-3 p-1.5 hover:bg-white/5 rounded-xl cursor-pointer transition-all"
                          >
                            <img
                              src={item.images?.poster || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=100'}
                              alt={item.title}
                              className="w-8 h-10 rounded-lg object-cover bg-white/5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                              <p className="text-[10px] text-anime-text/60">{item.year || 'TV Series'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Notifications & Profile */}
      <div className="flex items-center justify-end space-x-3 w-auto lg:w-1/4">
        {/* Notifications */}
        <div ref={notificationsRef} className="relative">
          <button 
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              localStorage.setItem('last_news_checked_time', String(Date.now() / 1000));
            }}
            className="w-10 h-10 rounded-[14px] bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center relative cursor-pointer border border-transparent"
          >
            <Bell className="w-[18px] h-[18px] text-anime-text" strokeWidth={2} />
            {notifications.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-anime-text/40" />
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-anime-bg/95 backdrop-blur-md border border-white/20 ring-1 ring-white/5 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => {
                      if (onClearNotifications) onClearNotifications();
                      setIsDropdownOpen(false);
                    }}
                    className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-anime-text/40">
                    No new notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => {
                        navigate('/news');
                        setIsDropdownOpen(false);
                      }}
                      className="p-3.5 flex items-start space-x-3 cursor-pointer hover:bg-white/5 transition-all relative group"
                    >
                      <img src={n.image} alt={n.title} className="w-12 h-9 rounded-lg object-cover bg-white/5 shrink-0" />
                      <div className="flex-1 min-w-0 space-y-0.5 pr-6">
                        <span className="text-[9px] font-bold text-anime-primary uppercase tracking-wider">{n.category}</span>
                        <p className="text-xs font-medium text-white line-clamp-2 leading-snug">
                          {n.title}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDismissNotification) onDismissNotification(n.id);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg text-anime-text/40 hover:text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100 shrink-0 z-10"
                        title="Dismiss Notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-[14px] bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer border border-transparent outline-none"
            aria-label="Profile menu"
          >
            <User className="w-[18px] h-[18px] text-anime-text" strokeWidth={2} />
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-3 w-56 bg-anime-bg/95 backdrop-blur-md border border-white/20 ring-1 ring-white/5 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-white/5">
                <p className="text-sm font-semibold text-white truncate">
                  {currentUser?.display_name || currentUser?.username || 'Guest User'}
                </p>
                <p className="text-[10px] text-anime-secondary font-medium mt-0.5">
                  Rank: S-Tier
                </p>
              </div>
              <div className="p-1.5">
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-anime-text hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
