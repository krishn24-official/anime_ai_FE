import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FileText } from 'lucide-react';
import { SearchInput } from './SearchInput';
import { useSearchResults } from '../../hooks/useSearchResults';
import { searchService } from '../../services/searchService';
import {
  flattenSearchResults,
  type DisplayedSearchKind,
  type SearchOption,
} from '../../services/searchResults';

const KIND_BADGE: Record<DisplayedSearchKind, { label: string; className: string }> = {
  anime: { label: 'Anime', className: 'bg-anime-yellow/15 text-anime-yellow' },
  manga: { label: 'Manga', className: 'bg-anime-pink/15 text-anime-pink' },
  movies: { label: 'Movie', className: 'bg-anime-purple/15 text-anime-purple' },
  tv_series: { label: 'TV Series', className: 'bg-teal-400/15 text-teal-400' },
  characters: { label: 'Character', className: 'bg-anime-primary/15 text-anime-primary' },
  actors: { label: 'Actor', className: 'bg-white/10 text-white/70' },
};

export interface ContentSearchPickerProps {
  /** Called when the user picks a result. The input is cleared afterwards. */
  onSelect: (option: SearchOption) => void;
  /** Which kinds to offer, in display order. */
  kinds?: DisplayedSearchKind[];
  placeholder?: string;
  autoFocus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Search box with a results dropdown for picking a title/character/actor.
 * Uses the global ranked search (GET /search), so results match the header search.
 */
export const ContentSearchPicker: React.FC<ContentSearchPickerProps> = ({
  onSelect,
  kinds = ['anime', 'manga', 'movies', 'tv_series'],
  placeholder = 'Search anime, manga, movies or TV series...',
  autoFocus = false,
  size = 'md',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const kindsKey = kinds.join(',');

  const search = useCallback(
    async (q: string) =>
      flattenSearchResults(await searchService.globalSearch(q), kindsKey.split(',') as DisplayedSearchKind[]),
    [kindsKey]
  );
  const { results: options, loading, settled } = useSearchResults(query, search);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const pick = (option: SearchOption) => {
    onSelect(option);
    setQuery('');
    setOpen(false);
  };

  const showNoResults = open && settled && options.length === 0;

  return (
    <div ref={containerRef} className={`relative z-40 ${className}`}>
      <SearchInput
        value={query}
        onChange={(v) => {
          setQuery(v);
          setOpen(!!v.trim());
        }}
        onFocus={() => options.length > 0 && setOpen(true)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        placeholder={placeholder}
        loading={loading}
        autoFocus={autoFocus}
        size={size}
      />

      {open && (options.length > 0 || showNoResults) && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-[#14161B] border border-white/15 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50 overflow-hidden">
          {showNoResults ? (
            <div className="p-4 text-center text-xs text-anime-text/50">No results found</div>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-white/10 overscroll-contain">
              {options.map((option) => (
                <div
                  key={`${option.kind}-${option.id}`}
                  onClick={() => pick(option)}
                  className="p-3 hover:bg-white/10 flex items-center justify-between gap-3 cursor-pointer transition select-none"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {option.image ? (
                      <img
                        src={option.image}
                        alt=""
                        className="w-9 h-12 object-cover rounded-md bg-black/40 shrink-0 border border-white/10"
                      />
                    ) : (
                      <div className="w-9 h-12 rounded-md bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-anime-text/40">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{option.title}</p>
                      <p className="text-[11px] text-anime-text/50 truncate">
                        <span className="font-mono">{option.id}</span>
                        {option.year ? ` · ${option.year}` : ''}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide ${KIND_BADGE[option.kind].className}`}
                  >
                    {KIND_BADGE[option.kind].label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentSearchPicker;
