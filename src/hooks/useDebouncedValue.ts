import { useEffect, useState } from 'react';

/** Default delay for search-as-you-type across the app. */
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Returns `value` after it has stopped changing for `delay` ms.
 * Use it to trigger searches without firing a request on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay: number = SEARCH_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
