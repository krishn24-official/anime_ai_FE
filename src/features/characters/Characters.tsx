import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchCharactersData, searchCharactersThunk } from '../../store/slices/characterSlice';
import { Calendar, Search, Gift, Loader2, Sparkles, X, User } from 'lucide-react';

const Characters: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { characters, birthdays, loading, error } = useSelector((state: RootState) => state.characters);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [filterAnime, setFilterAnime] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCharactersData());
  }, [dispatch]);

  // Handle live search dispatch without losing focus
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    dispatch(searchCharactersThunk(value));
  };

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

  const selectedChar = characters.find(c => c.id === selectedCharId) || 
                       birthdays.find(b => b.id === selectedCharId);

  const today = new Date();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header section */}
      <div className="glass-panel p-8 rounded-2xl border border-anime-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-anime-primary text-xs font-semibold uppercase tracking-wider">Database & Celebrations</span>
          <h1 className="text-3xl font-bold font-outfit text-white mt-1">Character Center</h1>
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
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4 items-center">
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
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-anime-primary"
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
        </div>

        <div className="relative w-full md:w-80">
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
              <h2 className="text-xl font-bold font-outfit text-white flex items-center space-x-2">
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
            <h2 className="text-xl font-bold font-outfit text-white flex items-center space-x-2">
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
                {filteredCharacters.map((char) => (
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
          </div>
        </>
      )}

      {/* Detail Drawer Modal (Matches Content.tsx) */}
      {selectedChar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-end z-50 transition-opacity">
          <div className="w-full max-w-xl bg-anime-bg border-l border-anime-border h-full overflow-y-auto p-8 relative flex flex-col justify-between">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedCharId(null)}
              className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              {/* Profile banner */}
              <div className="flex space-x-4 items-start pt-6">
                <img 
                  src={selectedChar.image} 
                  alt={selectedChar.name} 
                  className="w-24 rounded-xl border border-anime-border object-cover aspect-[3/4] bg-black/40" 
                />
                <div>
                  <span className="text-xs text-anime-secondary font-semibold uppercase">
                    {selectedChar.gender || 'Character'}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold font-outfit text-white leading-tight mt-1">
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

              {/* Origin Anime list */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-anime-secondary font-bold uppercase tracking-wider">Appearance origins</span>
                <p className="text-xs font-semibold text-white leading-relaxed">{selectedChar.anime}</p>
              </div>

              {/* Description Detail */}
              <div className="space-y-2">
                <h3 className="text-xs text-anime-secondary font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Biography & Description</span>
                </h3>
                <p className="text-xs text-anime-text leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                  {selectedChar.description}
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
