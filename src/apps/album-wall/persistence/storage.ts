import {
  createEmptyWall,
  DEFAULT_WALL_COLUMNS,
  DEFAULT_WALL_ROWS,
  MAX_WALL_DIMENSION,
  MIN_WALL_DIMENSION,
  type WallState,
} from "../state/wall-state";

import type { Album } from "../albums/types";

const STORAGE_KEY = "detroit:album-wall:v1";

type PersistedAlbumWall = {
  version: 1;
  rows: number;
  columns: number;
  cells: Array<Album | null>;
};

const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === "string";

const isAlbum = (value: unknown): value is Album => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const album = value as Partial<Album>;
  return (
    typeof album.id === "string" &&
    typeof album.title === "string" &&
    typeof album.artist === "string" &&
    isNullableString(album.artworkUrl) &&
    isNullableString(album.url) &&
    isNullableString(album.releaseDate) &&
    isNullableString(album.genre) &&
    (album.trackCount === null || typeof album.trackCount === "number")
  );
};

const isPersistedAlbumWall = (
  value: unknown,
): value is PersistedAlbumWall => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const persisted = value as Partial<PersistedAlbumWall>;
  const rows = persisted.rows;
  const columns = persisted.columns;
  if (
    persisted.version !== 1 ||
    typeof rows !== "number" ||
    !Number.isInteger(rows) ||
    typeof columns !== "number" ||
    !Number.isInteger(columns) ||
    rows < MIN_WALL_DIMENSION ||
    rows > MAX_WALL_DIMENSION ||
    columns < MIN_WALL_DIMENSION ||
    columns > MAX_WALL_DIMENSION ||
    !Array.isArray(persisted.cells) ||
    persisted.cells.length !== rows * columns
  ) {
    return false;
  }

  const albumIds = new Set<string>();
  return persisted.cells.every((cell) => {
    if (cell === null) {
      return true;
    }

    if (!isAlbum(cell) || albumIds.has(cell.id)) {
      return false;
    }

    albumIds.add(cell.id);
    return true;
  });
};

export const loadWallState = (): WallState => {
  const fallback = createEmptyWall(DEFAULT_WALL_ROWS, DEFAULT_WALL_COLUMNS);

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return fallback;
    }

    const parsed: unknown = JSON.parse(stored);
    return isPersistedAlbumWall(parsed)
      ? {
        rows: parsed.rows,
        columns: parsed.columns,
        cells: parsed.cells,
      }
      : fallback;
  } catch {
    return fallback;
  }
};

export const saveWallState = (state: WallState) => {
  const persisted: PersistedAlbumWall = {
    version: 1,
    rows: state.rows,
    columns: state.columns,
    cells: state.cells,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
};
