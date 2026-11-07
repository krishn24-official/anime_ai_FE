import { useEffect, useState } from 'react';
import { useDebouncedValue } from './useDebouncedValue';

export const MIN_SEARCH_LENGTH = 2;

interface SearchState<R> {
  query: string;
  data: R | null;
  error: string | null;
}

/**
 * Search-as-you-type: debounces `query`, calls `search`, and ignores stale responses.
 * Returns `data` only for the latest query (null while loading or for short queries).
 *
 * `search` must be stable between renders (a module-level function or useCallback),
 * otherwise every render starts a new request.
 */
export function useSearch<R>(
  query: string,
  search: (query: string) => Promise<R>,
  minLength: number = MIN_SEARCH_LENGTH
) {
  const debouncedQuery = useDebouncedValue(query.trim());
  const active = debouncedQuery.length >= minLength;
  // Results are stored with the query they belong to, so a slow, stale response
  // can never overwrite newer results, and "loading" needs no extra state.
  const [state, setState] = useState<SearchState<R> | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    search(debouncedQuery)
      .then((data) => {
        if (!cancelled) setState({ query: debouncedQuery, data, error: null });
      })
      .catch((err) => {
        console.error('Search failed:', err);
        if (!cancelled) setState({ query: debouncedQuery, data: null, error: "Couldn't load results" });
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, active, search]);

  const current = active && state?.query === debouncedQuery ? state : null;
  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    loading: active && !current,
    /** True once the latest query has been answered (the answer may be empty). */
    settled: !!current,
  };
}

/** useSearch for list results: `results` is always an array. */
export function useSearchResults<T>(
  query: string,
  search: (query: string) => Promise<T[]>,
  minLength: number = MIN_SEARCH_LENGTH
) {
  const { data, ...rest } = useSearch(query, search, minLength);
  return { results: data ?? ([] as T[]), ...rest };
}
