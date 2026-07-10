import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchCharactersData, searchCharactersThunk } from '../../store/slices/characterSlice';
import { Calendar, Search, Gift, Loader2, Sparkles, X, User, MessageCircle, Share2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const parseCharacterDescription = (description: string, charName: string) => {
  if (!description) return { metadata: {} as Record<string, string>, biography: '' };

  // Clean up common AniList/markdown tags
  let cleaned = description
    .replace(/__+/g, '') // Remove bold markers like __
    .replace(/\*+/g, '')  // Remove italic markers like *
    .trim();

  // Clean word-wrapped bangs (e.g. !382,000,000! -> 382,000,000)
  cleaned = cleaned.replace(/!(?=\S)/g, '').replace(/(?<=\S)!/g, '');

  const metadata: Record<string, string> = {};
  let biography = cleaned;

  const keys = ['Height', 'Weight', 'Family', 'Affiliations', 'Bounty', 'Residence', 'Age', 'Blood Type', 'Relatives', 'Occupation', 'Rank', 'Status'];

  let loop = true;
  while (loop) {
    biography = biography.trim().replace(/^[\s!~]+/, '').trim();
    const match = biography.match(/^(Height|Weight|Family|Affiliations|Bounty|Residence|Age|Blood Type|Relatives|Occupation|Rank|Status):\s*/i);
    if (match) {
      const matchedKey = match[1];
      const normalizedKey = matchedKey.charAt(0).toUpperCase() + matchedKey.slice(1).toLowerCase();
      biography = biography.substring(match[0].length).trim();

      // Find the end of this value
      // 1. Next metadata key
      let nextKeyIndex = -1;
      for (const k of keys) {
        const nextKeyRegex = new RegExp(`\\b${k}:`, 'i');
        const searchMatch = biography.match(nextKeyRegex);
        if (searchMatch && searchMatch.index !== undefined) {
          if (nextKeyIndex === -1 || searchMatch.index < nextKeyIndex) {
            nextKeyIndex = searchMatch.index;
          }
        }
      }

      // 2. Bang separator (if any)
      const bangIndex = biography.indexOf('!');

      // 3. Character name or pronouns (indicating start of narrative)
      let nameIndex = -1;
      const nameWords = charName.split(' ');
      const firstName = nameWords[0];
      const searchTerms = [charName, firstName, 'He is', 'She is', 'He was', 'She was', 'Born in', 'A member of'];
      for (const term of searchTerms) {
        if (!term || term.length < 3) continue;
        const termRegex = new RegExp(`\\b${term}\\b`, 'i');
        const termMatch = biography.match(termRegex);
        if (termMatch && termMatch.index !== undefined) {
          if (nameIndex === -1 || termMatch.index < nameIndex) {
            nameIndex = termMatch.index;
          }
        }
      }

      let valueEndIndex = biography.length;
      let cutLength = 0;

      if (nextKeyIndex !== -1) {
        valueEndIndex = Math.min(valueEndIndex, nextKeyIndex);
      }
      if (bangIndex !== -1) {
        // Only use bang as separator if it appears before the next key or there is no next key
        if (nextKeyIndex === -1 || bangIndex < nextKeyIndex) {
          valueEndIndex = Math.min(valueEndIndex, bangIndex);
          cutLength = 1;
        }
      }
      if (nameIndex !== -1) {
        // Only split by name/pronoun if it occurs after some value content (e.g. at least 3 chars)
        if (nameIndex > 3 && (nextKeyIndex === -1 || nameIndex < nextKeyIndex)) {
          valueEndIndex = Math.min(valueEndIndex, nameIndex);
        }
      }

      const val = biography.substring(0, valueEndIndex).trim();
      metadata[normalizedKey] = val;
      biography = biography.substring(valueEndIndex + cutLength).trim();
    } else {
      loop = false;
    }
  }

  biography = biography.replace(/^[\s!~]+/, '').trim();
  return { metadata, biography };
};

const Characters: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { characters, birthdays, loading, error } = useSelector((state: RootState) => state.characters);

  // Sentinel ref for IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [filterAnime, setFilterAnime] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    dispatch(fetchCharactersData());
  }, [dispatch]);

  useEffect(() => {
    if (location.state && (location.state as any).autoOpenName && characters.length > 0) {
      const targetName = (location.state as any).autoOpenName;
      const match = characters.find(
        (c) => c.name.toLowerCase() === targetName.toLowerCase()
      ) || birthdays.find(
        (b) => b.name.toLowerCase() === targetName.toLowerCase()
      );
      if (match) {
        setSelectedCharId(match.id);
      } else {
        const partial = characters.find(
          (c) => c.name.toLowerCase().includes(targetName.toLowerCase())
        ) || birthdays.find(
          (b) => b.name.toLowerCase().includes(targetName.toLowerCase())
        );
        if (partial) {
          setSelectedCharId(partial.id);
        }
      }
      window.history.replaceState({}, document.title);
    }
  }, [location, characters, birthdays]);

  const isFirstRender = useRef(true);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Handle live search dispatch without losing focus
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsSearchActive(!!debouncedSearch.trim());
    dispatch(searchCharactersThunk(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  // IntersectionObserver for progressive rendering (infinite scroll)
  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading && !isSearchActive) {
        setDisplayCount(prev => prev + 20);
      }
    },
    [loading, isSearchActive]
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

  // Extract unique anime names for dropdown
  const uniqueAnimeNames = Array.from(
    new Set(
      characters
        .flatMap((c) => c.anime.split(', ').map(a => a.trim()))
        .filter(Boolean)
    )
  ).sort();

  const filteredCharacters = characters
    .filter((char) => {
      const matchesGender = filterGender === 'all' || 
        (char.gender?.toLowerCase() === filterGender);
      
      const matchesAnime = filterAnime === 'all' || 
        char.anime.toLowerCase().includes(filterAnime.toLowerCase());

      return matchesGender && matchesAnime;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

  // Progressive rendering slice
  const visibleCharacters = isSearchActive ? filteredCharacters : filteredCharacters.slice(0, displayCount);

  // Auto-reveal background timer to fulfill "fetch even if user doesn't scroll"
  useEffect(() => {
    if (!isSearchActive && !loading && characters.length > 0 && displayCount < filteredCharacters.length) {
      const timer = setTimeout(() => {
        setDisplayCount(prev => Math.min(prev + 20, filteredCharacters.length));
      }, 500); // Reveal 20 more every 500ms in background
      return () => clearTimeout(timer);
    }
  }, [isSearchActive, loading, characters.length, displayCount, filteredCharacters.length]);

  const selectedChar = characters.find(c => c.id === selectedCharId) || 
                       birthdays.find(b => b.id === selectedCharId);

  const { metadata, biography } = selectedChar 
    ? parseCharacterDescription(selectedChar.description, selectedChar.name) 
    : { metadata: {} as Record<string, string>, biography: '' };

  const today = new Date();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header section */}
      <div className="glass-panel p-8 rounded-2xl border border-anime-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-anime-primary text-xs font-semibold uppercase tracking-wider">Database & Celebrations</span>
          <h1 className="text-3xl font-bold font-fraunces text-white mt-1">Character Center</h1>
          <p className="text-sm text-anime-text mt-1">
            Explore detailed information on anime characters, their origins, and today's birthday events.
          </p>
        </div>
        
        {/* Quick Date Display */}
        <div className="flex items-center space-x-3 bg-anime-primary/10 border border-anime-primary/25 px-5 py-3 rounded-xl">
          <Calendar className="w-6 h-6 text-anime-primary animate-pulse" />
          <div>
            <p className="text-[10px] text-anime-secondary font-semibold uppercase tracking-wider">Today's Date</p>
            <p className="text-sm font-bold text-white">
              {today.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Persistent Search & Filters Container (Never unmounted) */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Gender Filter Buttons */}
        <div className="flex space-x-2 bg-white/5 p-1.5 rounded-xl border border-white/5 w-fit">
          <button
            onClick={() => setFilterGender('all')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filterGender === 'all' ? 'bg-anime-primary text-anime-bg' : 'text-anime-text hover:text-white'
            }`}
          >
            All Characters
          </button>
          <button
            onClick={() => setFilterGender('male')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filterGender === 'male' ? 'bg-anime-primary text-anime-bg' : 'text-anime-text hover:text-white'
            }`}
          >
            Male
          </button>
          <button
            onClick={() => setFilterGender('female')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filterGender === 'female' ? 'bg-anime-primary text-anime-bg' : 'text-anime-text hover:text-white'
            }`}
          >
            Female
          </button>
        </div>

        {/* Anime Filter Dropdown */}
        <select
          value={filterAnime}
          onChange={(e) => setFilterAnime(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-anime-primary min-w-[200px]"
        >
          <option value="all" className="bg-anime-bg text-white">All Anime</option>
          {uniqueAnimeNames.map((name) => (
            <option key={name} value={name} className="bg-anime-bg text-white">{name}</option>
          ))}
        </select>

        {/* Alphabetical Sort Dropdown */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-anime-primary"
        >
          <option value="asc" className="bg-anime-bg text-white">Name: A to Z</option>
          <option value="desc" className="bg-anime-bg text-white">Name: Z to A</option>
        </select>

        <div className="relative w-full md:w-80 md:ml-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search characters..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-anime-primary"
          />
          <Search className="w-4 h-4 text-anime-text/40 absolute left-3 top-3.5" />
        </div>
      </div>

      {error && (
        <div className="glass-panel p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center space-y-2">
          <p className="text-sm text-red-400 font-semibold">Error Loading Database</p>
          <p className="text-xs text-anime-text/60">{error}</p>
        </div>
      )}

      {/* Main Grid Area (Handles loading states locally inside) */}
      {loading && characters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-anime-primary animate-spin" />
          <p className="text-sm text-anime-text/60 font-medium">Loading character entries...</p>
        </div>
      ) : (
        <>
          {/* Today's Birthdays */}
          {birthdays.length > 0 && !searchTerm && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold font-fraunces text-white flex items-center space-x-2">
                <Gift className="w-5 h-5 text-anime-pink animate-bounce" />
                <span>Today's Birthdays ({birthdays.length})</span>
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {birthdays.map((item) => (
                  <div
                    key={`bday-${item.id}`}
                    onClick={() => setSelectedCharId(item.id)}
                    className="glass-panel rounded-2xl overflow-hidden border border-anime-border flex flex-col group relative hover:border-anime-pink/40 transition-all duration-300 shadow-lg cursor-pointer"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-black/40">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                      />
                      
                      {/* Chatbot icon button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/chatbot', { state: { initialPrompt: `Tell me about ${item.name}` } });
                        }}
                        className="absolute top-3 left-3 p-2 bg-black/60 hover:bg-anime-primary hover:text-anime-bg border border-white/10 text-white rounded-xl transition-all cursor-pointer z-20"
                        title={`Ask chatbot about ${item.name}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      {/* Share Poster button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.dispatchEvent(new CustomEvent('open-share-poster', {
                            detail: {
                              type: 'birthday',
                              data: {
                                name: item.name,
                                image: item.image,
                                subtitle: `Celebrate with us! Happy Birthday ${item.name}`
                              }
                            }
                          }));
                        }}
                        className="absolute top-3 left-14 p-2 bg-black/60 hover:bg-anime-pink hover:text-white border border-white/10 text-white rounded-xl transition-all cursor-pointer z-20"
                        title={`Share birthday poster for ${item.name}`}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <div className="absolute top-3 right-3 z-20">
                        <span className="px-2 py-0.5 bg-anime-pink text-white text-[9px] font-bold rounded uppercase tracking-wider">
                          Birthday!
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                        <span className="px-4 py-2 bg-anime-pink text-white font-bold text-xs rounded-xl shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                          View Details
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-anime-pink transition-all">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Characters Index */}
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold font-fraunces text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-anime-yellow" />
              <span>Character Index ({filteredCharacters.length})</span>
            </h2>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="w-8 h-8 text-anime-primary animate-spin" />
                <p className="text-xs text-anime-text/50">Searching database...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {visibleCharacters.map((char) => (
                  <div
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className="glass-panel rounded-2xl overflow-hidden border border-anime-border flex flex-col group relative hover:border-anime-primary/30 transition-all duration-300 shadow-lg cursor-pointer"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-black/40">
                      <img
                        src={char.image}
                        alt={char.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                      />

                      {/* Chatbot icon button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/chatbot', { state: { initialPrompt: `Tell me about ${char.name}` } });
                        }}
                        className="absolute top-3 left-3 p-2 bg-black/60 hover:bg-anime-primary hover:text-anime-bg border border-white/10 text-white rounded-xl transition-all cursor-pointer z-20"
                        title={`Ask chatbot about ${char.name}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      {/* Share Poster button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.dispatchEvent(new CustomEvent('open-share-poster', {
                            detail: {
                              type: 'birthday',
                              data: {
                                name: char.name,
                                image: char.image,
                                subtitle: `Check out ${char.name} from ${char.anime}!`
                              }
                            }
                          }));
                        }}
                        className="absolute top-3 left-14 p-2 bg-black/60 hover:bg-anime-pink hover:text-white border border-white/10 text-white rounded-xl transition-all cursor-pointer z-20"
                        title={`Share poster for ${char.name}`}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {char.dob && (
                        <div className="absolute top-3 right-3 z-20">
                          <span className="px-2 py-0.5 bg-black/60 border border-white/10 text-white text-[9px] font-bold rounded">
                            {char.dob}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                        <span className="px-4 py-2 bg-anime-primary text-anime-bg font-bold text-xs rounded-xl shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                          View Details
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-anime-primary transition-all">
                        {char.name}
                      </h3>
                    </div>
                  </div>
                ))}
                {filteredCharacters.length === 0 && (
                  <p className="text-sm text-anime-text/60 italic col-span-4 py-8 text-center">
                    No matching characters found.
                  </p>
                )}
              </div>
            )}

            {/* Infinite scroll sentinel + bottom spinner */}
            <div ref={sentinelRef} className="w-full h-10" />
            {!isSearchActive && displayCount < filteredCharacters.length && (
              <div className="flex flex-col items-center justify-center py-8 space-y-2">
                <Loader2 className="w-7 h-7 text-anime-primary animate-spin" />
                <p className="text-xs text-anime-text/50">Loading more characters...</p>
              </div>
            )}
            {!isSearchActive && characters.length > 0 && displayCount >= filteredCharacters.length && (
              <p className="text-center text-xs text-anime-text/30 py-4">All characters loaded</p>
            )}
          </div>
        </>
      )}

      {/* Detail Drawer Modal (Matches Content.tsx) */}
      {selectedChar && (
        <div 
          onClick={() => setSelectedCharId(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-opacity"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-anime-bg border border-anime-border rounded-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-8 relative flex flex-col justify-between"
          >
            
            {/* Share Button */}
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-share-poster', {
                  detail: {
                    type: 'birthday',
                    data: {
                      name: selectedChar.name,
                      image: selectedChar.image,
                      subtitle: `Celebrate with us! Happy Birthday ${selectedChar.name}`
                    }
                  }
                }));
              }}
              className="absolute top-4 right-14 sm:top-6 sm:right-18 p-2 bg-white/5 hover:bg-anime-pink hover:text-white border border-white/10 rounded-xl text-white transition-all z-10 cursor-pointer"
              title="Share Birthday Poster"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Close Button */}
            <button
              onClick={() => setSelectedCharId(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              {/* Profile banner */}
              <div className="flex space-x-4 items-start pt-6">
                <img 
                  src={selectedChar.image} 
                  alt={selectedChar.name} 
                  className="w-24 rounded-xl border border-anime-border object-cover aspect-[3/4] bg-black/40 shrink-0" 
                />
                <div>
                  <span className="text-xs text-anime-secondary font-semibold uppercase">
                    {selectedChar.gender || 'Character'}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold font-fraunces text-white leading-tight mt-1">
                    {selectedChar.name}
                  </h2>
                  {selectedChar.nativeName && (
                    <p className="text-xs text-anime-text/40 font-semibold mt-1">Native: {selectedChar.nativeName}</p>
                  )}
                  {selectedChar.dob && (
                    <div className="flex items-center space-x-1 mt-2 text-xs text-anime-text/60">
                      <Calendar className="w-3.5 h-3.5 text-anime-primary" />
                      <span>Birthday: {selectedChar.dob}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Character Metadata Fields */}
              {Object.keys(metadata).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {Object.entries(metadata).map(([key, value]) => (
                    <div key={key} className="p-3 sm:p-4 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-anime-secondary font-bold uppercase tracking-wider block">{key}</span>
                      <p className="text-xs font-semibold text-white mt-1 leading-relaxed">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Origin Anime list */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] text-anime-secondary font-bold uppercase tracking-wider block">Appearance origins</span>
                <div className="flex flex-wrap gap-2">
                  {selectedChar.anime.split(',').map((animeName) => {
                    const trimmedName = animeName.trim();
                    if (!trimmedName) return null;
                    return (
                      <button
                        key={trimmedName}
                        onClick={() => {
                          setSelectedCharId(null);
                          navigate('/content', { state: { searchQuery: trimmedName } });
                        }}
                        className="px-3 py-1.5 bg-anime-primary/10 border border-anime-primary/20 hover:border-anime-primary hover:bg-anime-primary/25 rounded-lg text-xs font-semibold text-anime-primary transition-all cursor-pointer"
                      >
                        {trimmedName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description Detail */}
              <div className="space-y-2">
                <h3 className="text-xs text-anime-secondary font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Biography & Description</span>
                </h3>
                <p className="text-xs text-anime-text leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                  {biography || 'No biography available.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Characters;
