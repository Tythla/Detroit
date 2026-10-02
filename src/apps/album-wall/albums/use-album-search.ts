import { useEffect, useState } from "react";

import { searchAppleAlbums } from "./apple-itunes";

import type { Album, AlbumSearchBy } from "./types";

export const MIN_ALBUM_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;
const CLIENT_CACHE_TTL_MS = 5 * 60 * 1_000;
const MAX_CACHE_ENTRIES = 100;

type CacheEntry = {
  albums: Album[];
  expiresAt: number;
};

type SettledSearchState = AlbumSearchState & {
  cacheKey: string | null;
};

const resultCache = new Map<string, CacheEntry>();

export type AlbumSearchStatus =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error";

export type AlbumSearchState = {
  albums: Album[];
  error: string | null;
  isLoading: boolean;
  isTooShort: boolean;
  status: AlbumSearchStatus;
};

const makeCacheKey = (query: string, searchBy: AlbumSearchBy) =>
  `${searchBy}:${query.toLocaleLowerCase()}`;

const cacheResults = (key: string, albums: Album[]) => {
  if (resultCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = resultCache.keys().next().value as string | undefined;
    if (oldestKey) {
      resultCache.delete(oldestKey);
    }
  }

  resultCache.set(key, {
    albums,
    expiresAt: Date.now() + CLIENT_CACHE_TTL_MS,
  });
};

const idleState: AlbumSearchState = {
  albums: [],
  error: null,
  isLoading: false,
  isTooShort: false,
  status: "idle",
};

const loadingState: AlbumSearchState = {
  albums: [],
  error: null,
  isLoading: true,
  isTooShort: false,
  status: "loading",
};

export const useAlbumSearch = (
  query: string,
  searchBy: AlbumSearchBy = "album",
): AlbumSearchState => {
  const normalizedQuery = query.trim();
  const cacheKey = makeCacheKey(normalizedQuery, searchBy);
  const [settledState, setSettledState] = useState<SettledSearchState>({
    ...idleState,
    cacheKey: null,
  });

  useEffect(() => {
    if (normalizedQuery.length < MIN_ALBUM_SEARCH_LENGTH) {
      return;
    }

    const cached = resultCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      resultCache.delete(cacheKey);
      resultCache.set(cacheKey, cached);
      let cancelled = false;
      queueMicrotask(() => {
        if (!cancelled) {
          setSettledState({
            albums: cached.albums,
            cacheKey,
            error: null,
            isLoading: false,
            isTooShort: false,
            status: cached.albums.length > 0 ? "success" : "empty",
          });
        }
      });
      return () => {
        cancelled = true;
      };
    }

    if (cached) {
      resultCache.delete(cacheKey);
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void searchAppleAlbums(normalizedQuery, searchBy, controller.signal)
        .then((albums) => {
          cacheResults(cacheKey, albums);
          setSettledState({
            albums,
            cacheKey,
            error: null,
            isLoading: false,
            isTooShort: false,
            status: albums.length > 0 ? "success" : "empty",
          });
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) {
            return;
          }

          setSettledState({
            albums: [],
            cacheKey,
            error:
              error instanceof Error
                ? error.message
                : "Album search is temporarily unavailable.",
            isLoading: false,
            isTooShort: false,
            status: "error",
          });
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [cacheKey, normalizedQuery, searchBy]);

  if (normalizedQuery.length < MIN_ALBUM_SEARCH_LENGTH) {
    return {
      ...idleState,
      isTooShort: normalizedQuery.length > 0,
    };
  }

  if (settledState.cacheKey === cacheKey) {
    return settledState;
  }

  return loadingState;
};
