import type { Album, AlbumSearchBy } from "./types";

const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";
const PROVIDER_REQUEST_LIMIT = 20;
const PROVIDER_REQUEST_WINDOW_MS = 60_000;
const MAX_RESULTS = 50;

type AppleMusicResult = {
  artistName?: unknown;
  artworkUrl100?: unknown;
  collectionId?: unknown;
  collectionName?: unknown;
  collectionViewUrl?: unknown;
  primaryGenreName?: unknown;
  releaseDate?: unknown;
  trackCount?: unknown;
};

type AppleSearchResponse = {
  results: unknown[];
};

export class MusicSearchError extends Error {
  constructor(message = "Album search is temporarily unavailable.") {
    super(message);
    this.name = "MusicSearchError";
  }
}

const providerRequestTimes: number[] = [];

const reserveProviderRequest = () => {
  const now = Date.now();

  while (
    providerRequestTimes.length > 0 &&
    now - providerRequestTimes[0] >= PROVIDER_REQUEST_WINDOW_MS
  ) {
    providerRequestTimes.shift();
  }

  if (providerRequestTimes.length >= PROVIDER_REQUEST_LIMIT) {
    throw new MusicSearchError(
      "Search is busy. Please wait a moment and try again.",
    );
  }

  providerRequestTimes.push(now);
};

const stringValue = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

const isAppleSearchResponse = (value: unknown): value is AppleSearchResponse =>
  Boolean(
    value &&
    typeof value === "object" &&
    "results" in value &&
    Array.isArray(value.results),
  );

const enlargeArtwork = (value: unknown): string | null => {
  const url = stringValue(value);
  return url?.replace(/100x100(?=bb)/, "600x600") ?? null;
};

const normalizeAlbumUrl = (value: unknown): string | null => {
  const url = stringValue(value);
  if (!url) {
    return null;
  }

  try {
    const albumUrl = new URL(url);
    albumUrl.searchParams.delete("i");
    return albumUrl.toString();
  } catch {
    return null;
  }
};

const toAlbum = (
  value: unknown,
): { album: Album; collectionId: number } | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const result = value as AppleMusicResult;
  const title = stringValue(result.collectionName);
  const artist = stringValue(result.artistName);

  if (typeof result.collectionId !== "number" || !title || !artist) {
    return null;
  }

  return {
    album: {
      id: String(result.collectionId),
      title,
      artist,
      artworkUrl: enlargeArtwork(result.artworkUrl100),
      url: normalizeAlbumUrl(result.collectionViewUrl),
      releaseDate: stringValue(result.releaseDate),
      genre: stringValue(result.primaryGenreName),
      trackCount:
        typeof result.trackCount === "number" ? result.trackCount : null,
    },
    collectionId: result.collectionId,
  };
};

export const mapAppleResultsToAlbums = (results: unknown[]): Album[] => {
  const albums = new Map<number, Album>();

  for (const result of results) {
    const mapped = toAlbum(result);
    if (mapped && !albums.has(mapped.collectionId)) {
      albums.set(mapped.collectionId, mapped.album);
    }
  }

  return [...albums.values()];
};

export const searchAppleAlbums = async (
  query: string,
  searchBy: AlbumSearchBy,
  signal: AbortSignal,
): Promise<Album[]> => {
  reserveProviderRequest();

  const parameters = new URLSearchParams({
    country: "US",
    entity: searchBy === "song" ? "song" : "album",
    explicit: "Yes",
    limit: String(MAX_RESULTS),
    media: "music",
    term: query,
  });
  const response = await fetch(`${ITUNES_SEARCH_URL}?${parameters}`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new MusicSearchError();
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new MusicSearchError();
  }

  if (!isAppleSearchResponse(payload)) {
    throw new MusicSearchError();
  }

  return mapAppleResultsToAlbums(payload.results);
};
