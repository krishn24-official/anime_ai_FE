import React from 'react';
import { Loader2, Search, X } from 'lucide-react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Shows a spinner instead of the clear button. */
  loading?: boolean;
  autoFocus?: boolean;
  /** sm: compact (forms, toolbars) · md: default · lg: page-level search */
  size?: 'sm' | 'md' | 'lg';
  /** Classes for the wrapper (width, margins). */
  className?: string;
  ariaLabel?: string;
  /** Ref to the underlying <input>, e.g. to move focus programmatically. */
  inputRef?: React.Ref<HTMLInputElement>;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const SIZES = {
  sm: { input: 'py-2 pl-9 pr-9 text-xs rounded-xl', icon: 'w-3.5 h-3.5 left-3', side: 'right-3 w-3.5 h-3.5' },
  md: { input: 'py-2.5 pl-10 pr-10 text-sm rounded-xl', icon: 'w-4 h-4 left-3.5', side: 'right-3.5 w-4 h-4' },
  lg: { input: 'py-3 pl-12 pr-11 text-sm rounded-[14px]', icon: 'w-[18px] h-[18px] left-4', side: 'right-4 w-4 h-4' },
} as const;

/**
 * The one search box used across the app: search icon, clear button, loading spinner.
 * Pair it with useDebouncedValue() to search as the user types.
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  loading = false,
  autoFocus = false,
  size = 'md',
  className = '',
  ariaLabel,
  inputRef,
  onFocus,
  onKeyDown,
}) => {
  const s = SIZES[size];
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className={`absolute ${s.icon} text-anime-text/40 pointer-events-none`} strokeWidth={2} />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && value) onChange('');
          onKeyDown?.(e);
        }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={ariaLabel || placeholder}
        className={`w-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] focus:bg-white/[0.08] text-white placeholder:text-anime-text/40 focus:outline-none focus:border-anime-primary/50 transition-all ${s.input}`}
      />
      {loading ? (
        <Loader2 className={`absolute ${s.side} text-anime-primary animate-spin`} />
      ) : (
        value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="absolute right-3 p-0.5 text-anime-text/40 hover:text-white transition cursor-pointer"
          >
            <X className={s.side.split(' ').slice(1).join(' ')} />
          </button>
        )
      )}
    </div>
  );
};

export default SearchInput;
