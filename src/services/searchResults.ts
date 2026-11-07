import type {
  GlobalSearchResults,
  SearchActorItem,
  SearchAnimeItem,
  SearchCharacterItem,
  SearchMangaItem,
  SearchMovieItem,
  SearchTVSeriesItem,
} from './searchService';

/** Kinds the header search dropdown can display and open. */
export type DisplayedSearchKind = 'characters' | 'actors' | 'anime' | 'manga' | 'movies' | 'tv_series';

export type DisplayedSearchItem =
  | SearchCharacterItem
  | SearchActorItem
  | SearchAnimeItem
  | SearchMangaItem
  | SearchMovieItem
  | SearchTVSeriesItem;

export interface TopSearchResult {
  kind: DisplayedSearchKind;
  item: DisplayedSearchItem;
  title: string;
  subtitle: string;
  image: string | null;
}

const KIND_LABEL: Record<DisplayedSearchKind, string> = {
  characters: 'Character',
  actors: 'Actor',
  anime: 'Anime',
  manga: 'Manga',
  movies: 'Movie',
  tv_series: 'TV Series',
};

export const searchResultTitle = (kind: DisplayedSearchKind, item: DisplayedSearchItem): string => {
  if (kind === 'anime') {
    const t = (item as SearchAnimeItem).title;
    return t?.english || t?.romaji || 'Untitled';
  }
  if (kind === 'movies' || kind === 'tv_series') return (item as SearchMovieItem).title;
  return (item as SearchCharacterItem).name;
};

const imageOf = (kind: DisplayedSearchKind, item: DisplayedSearchItem): string | null => {
  if (kind === 'characters' || kind === 'actors') return (item as SearchCharacterItem).images?.profile || null;
  if (kind === 'manga') return (item as SearchMangaItem).cover_image || null;
  return (item as SearchAnimeItem).images?.poster || null;
};

/** Resolve the backend's top_result reference to the item it points at. */
export const getTopSearchResult = (results: GlobalSearchResults | null): TopSearchResult | null => {
  const ref = results?.top_result;
  if (!results || !ref || !(ref.kind in KIND_LABEL)) return null;
  const kind = ref.kind as DisplayedSearchKind;
  const list = (results[kind] || []) as DisplayedSearchItem[];
  const item = list.find((i) => i._id === ref.id);
  if (!item) return null;

  const year = (item as SearchMovieItem).year;
  return {
    kind,
    item,
    title: searchResultTitle(kind, item),
    subtitle: year ? `${KIND_LABEL[kind]} · ${year}` : KIND_LABEL[kind],
    image: imageOf(kind, item),
  };
};

/** Singular content type the rest of the API uses (ratings, trending, lore...). */
export type SearchContentType = 'character' | 'actor' | 'anime' | 'manga' | 'movie' | 'tv_series';

const CONTENT_TYPE: Record<DisplayedSearchKind, SearchContentType> = {
  characters: 'character',
  actors: 'actor',
  anime: 'anime',
  manga: 'manga',
  movies: 'movie',
  tv_series: 'tv_series',
};

/** One pickable search result, independent of its kind's wire format. */
export interface SearchOption {
  id: string;
  kind: DisplayedSearchKind;
  contentType: SearchContentType;
  title: string;
  image: string | null;
  year: string | number | null;
  /** The raw item, for callers that need kind-specific fields. */
  item: DisplayedSearchItem;
}

/** Flatten global search results into options, in the given kind order. */
export const flattenSearchResults = (
  results: GlobalSearchResults | null,
  kinds: DisplayedSearchKind[]
): SearchOption[] => {
  if (!results) return [];
  return kinds.flatMap((kind) =>
    ((results[kind] || []) as DisplayedSearchItem[]).map((item) => ({
      id: item._id,
      kind,
      contentType: CONTENT_TYPE[kind],
      title: searchResultTitle(kind, item),
      image: imageOf(kind, item),
      year: (item as SearchMovieItem).year ?? null,
      item,
    }))
  );
};
