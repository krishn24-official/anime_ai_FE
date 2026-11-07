import React, { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, Menu, X, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { logoutUserThunk } from '../store/slices/authSlice';
import { searchService } from '../services/searchService';
import { SearchInput } from './search/SearchInput';
import { useSearch } from '../hooks/useSearchResults';
import {
  getTopSearchResult,
  searchResultTitle,
  type DisplayedSearchItem,
  type DisplayedSearchKind,
} from '../services/searchResults';

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // Phones: the search bar is hidden behind a button and opens below the header.
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { data: searchResults, loading: isSearchLoading } = useSearch(searchQuery, searchService.globalSearch);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // The input is always mounted (just hidden on phones), so autoFocus would not
  // fire when the phone search bar opens: focus it explicitly.
  useEffect(() => {
    if (isMobileSearchOpen) searchInputRef.current?.focus();
  }, [isMobileSearchOpen]);

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

  const handleLogout = async () => {
    await dispatch(logoutUserThunk());
    navigate('/');
  };

  const hasResults = searchResults && (
    searchResults.characters.length > 0 ||
    searchResults.anime.length > 0 ||
    searchResults.manga.length > 0 ||
    searchResults.movies.length > 0 ||
    searchResults.tv_series.length > 0 ||
    (searchResults.actors && searchResults.actors.length > 0)
  );

  const topResult = getTopSearchResult(searchResults);

  // Same navigation as clicking the item in its category list.
  const openSearchResult = (kind: DisplayedSearchKind, item: DisplayedSearchItem) => {
    const title = searchResultTitle(kind, item);
    if (kind === 'characters') {
      navigate('/characters', { state: { autoOpenName: title } });
    } else if (kind === 'actors') {
      navigate(`/actors/${item._id}`);
    } else {
      const clickType = kind === 'movies' ? 'movie' : kind;
      searchService.logSearchClick(clickType, item._id, searchQuery);
      navigate('/content', { state: { searchQuery: title } });
    }
    setSearchQuery('');
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
  };

  return (
    <header className={`h-[72px] fixed top-0 right-0 bg-anime-bg/95 backdrop-blur-md border-b border-white/5 flex items-center justify-between gap-2 px-4 sm:px-10 z-40 transition-all duration-300 w-full ${
      isSidebarCollapsed ? 'lg:w-[calc(100%-72px)]' : 'lg:w-[calc(100%-260px)]'
    }`}>
      {/* LEFT: Page Title */}
      <div className="flex items-center space-x-3 min-w-0 flex-1 md:flex-none md:w-auto lg:w-1/4">
        {/* Mobile Hamburger menu */}
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Open navigation sidebar"
          className="p-2 rounded-[14px] bg-white/5 hover:bg-white/10 text-white lg:hidden cursor-pointer shrink-0 transition-all"
        >
          <Menu className="w-[18px] h-[18px]" strokeWidth={2} />
        </button>

        <h1 className="min-w-0 text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-fraunces text-white tracking-tight truncate">
          {title}
        </h1>
      </div>
      
      {/* CENTER: Global Search */}
      <div
        ref={searchContainerRef}
        className={`${isMobileSearchOpen ? 'flex' : 'hidden'} md:flex absolute md:relative top-full md:top-auto inset-x-0 md:inset-x-auto md:flex-1 justify-center md:max-w-[560px] px-4 py-3 md:py-0 bg-anime-bg md:bg-transparent border-b border-white/5 md:border-0 z-50`}
      >
        <div className="relative w-full">
          <SearchInput
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setIsSearchOpen(value.trim().length >= 2);
            }}
            onFocus={() => {
              if (searchQuery.trim().length >= 2) setIsSearchOpen(true);
            }}
            placeholder="Search AniVerse..."
            size="lg"
            inputRef={searchInputRef}
          />

          {isSearchOpen && (
            <div className="absolute left-0 mt-3 w-full bg-[#14161B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[60vh] md:max-h-[400px] overflow-y-auto overscroll-contain">
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
                  {/* Top result: best match across all categories */}
                  {topResult && (
                    <div className="first:pt-0">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider block mb-2 px-1">Top result</span>
                      <div
                        onClick={() => openSearchResult(topResult.kind, topResult.item)}
                        className="flex items-center space-x-3 p-2 bg-white/[0.06] hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-all"
                      >
                        <img
                          src={topResult.image || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=100'}
                          alt={topResult.title}
                          className="w-10 h-14 rounded-lg object-cover bg-white/5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{topResult.title}</p>
                          <p className="text-[10px] text-anime-text/60">{topResult.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  )}

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

                  {/* Actors */}
                  {searchResults.actors && searchResults.actors.length > 0 && (
                    <div className="pt-3 first:pt-0">
                      <span className="text-[10px] font-bold text-anime-primary uppercase tracking-wider block mb-2 px-1">Actors</span>
                      <div className="space-y-1">
                        {searchResults.actors.map(actor => (
                          <div
                            key={actor._id}
                            onClick={() => {
                              navigate(`/actors/${actor._id}`);
                              setSearchQuery('');
                              setIsSearchOpen(false);
                            }}
                            className="flex items-center space-x-3 p-1.5 hover:bg-white/5 rounded-xl cursor-pointer transition-all"
                          >
                            <img
                              src={actor.images?.profile || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt={actor.name}
                              className="w-8 h-10 rounded-lg object-cover bg-white/5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{actor.name}</p>
                              <p className="text-[10px] text-anime-text/60">Actor</p>
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
      <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0 lg:w-1/4">
        {/* Search toggle (phones only) */}
        <button
          type="button"
          onClick={() => setIsMobileSearchOpen((open) => !open)}
          aria-label={isMobileSearchOpen ? 'Close search' : 'Open search'}
          className="md:hidden p-2.5 rounded-[14px] bg-white/5 hover:bg-white/10 text-white cursor-pointer transition-all"
        >
          {isMobileSearchOpen ? <X className="w-[18px] h-[18px]" /> : <Search className="w-[18px] h-[18px]" />}
        </button>
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
            <div className="fixed inset-x-4 top-[76px] sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-3 sm:w-80 bg-[#14161B] border border-white/10 ring-1 ring-black/50 rounded-2xl shadow-2xl overflow-hidden z-50">
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
            <div className="absolute right-0 top-full mt-3 w-56 bg-[#14161B] border border-white/10 ring-1 ring-black/50 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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
