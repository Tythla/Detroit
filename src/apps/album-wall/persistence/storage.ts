import {
  DEFAULT_WALL_APPEARANCE,
  isWallAppearance,
  type WallAppearance,
} from "../state/wall-appearance";
import {
  createEmptyWall,
  DEFAULT_WALL_COLUMNS,
  DEFAULT_WALL_ROWS,
  MAX_WALL_DIMENSION,
  MIN_WALL_DIMENSION,
  type WallState,
} from "../state/wall-state";

import type { Album } from "../albums/types";

const STORAGE_KEY_V1 = "detroit:album-wall:v1";
const STORAGE_KEY_V2 = "detroit:album-wall:v2";

type PersistedAlbumWallV1 = {
  version: 1;
  rows: number;
  columns: number;
  cells: Array<Album | null>;
};

type PersistedAlbumWallV2 = {
  version: 2;
  wall: WallState;
  appearance: WallAppearance;
};

export type AlbumWallDocument = {
  wall: WallState;
  appearance: WallAppearance;
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

const isWallState = (value: unknown): value is WallState => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const state = value as Partial<WallState>;
  const rows = state.rows;
  const columns = state.columns;
  if (
    typeof rows !== "number" ||
    !Number.isInteger(rows) ||
    typeof columns !== "number" ||
    !Number.isInteger(columns) ||
    rows < MIN_WALL_DIMENSION ||
    rows > MAX_WALL_DIMENSION ||
    columns < MIN_WALL_DIMENSION ||
    columns > MAX_WALL_DIMENSION ||
    !Array.isArray(state.cells) ||
    state.cells.length !== rows * columns
  ) {
    return false;
  }

  const albumIds = new Set<string>();
  return state.cells.every((cell) => {
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

const isPersistedAlbumWallV1 = (
  value: unknown,
): value is PersistedAlbumWallV1 => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const persisted = value as Partial<PersistedAlbumWallV1>;
  return (
    persisted.version === 1 &&
    isWallState({
      cells: persisted.cells,
      columns: persisted.columns,
      rows: persisted.rows,
    })
  );
};

const isPersistedAlbumWallV2 = (
  value: unknown,
): value is PersistedAlbumWallV2 => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const persisted = value as Partial<PersistedAlbumWallV2>;
  return (
    persisted.version === 2 &&
    isWallState(persisted.wall) &&
    isWallAppearance(persisted.appearance)
  );
};

const createFallbackDocument = (): AlbumWallDocument => ({
  appearance: { ...DEFAULT_WALL_APPEARANCE },
  wall: createEmptyWall(DEFAULT_WALL_ROWS, DEFAULT_WALL_COLUMNS),
});

const parseStoredValue = (stored: string | null): unknown => {
  if (!stored) {
    return null;
  }

  return JSON.parse(stored);
};

const migrateV1 = (persisted: PersistedAlbumWallV1): AlbumWallDocument => ({
  appearance: { ...DEFAULT_WALL_APPEARANCE },
  wall: {
    cells: persisted.cells,
    columns: persisted.columns,
    rows: persisted.rows,
  },
});

export const loadAlbumWall = (): AlbumWallDocument => {
  const fallback = createFallbackDocument();

  try {
    const current = parseStoredValue(
      window.localStorage.getItem(STORAGE_KEY_V2),
    );
    if (isPersistedAlbumWallV2(current)) {
      return {
        appearance: current.appearance,
        wall: current.wall,
      };
    }

    const legacy = parseStoredValue(
      window.localStorage.getItem(STORAGE_KEY_V1),
    );
    return isPersistedAlbumWallV1(legacy) ? migrateV1(legacy) : fallback;
  } catch {
    return fallback;
  }
};

export const saveAlbumWall = (document: AlbumWallDocument) => {
  if (!isWallAppearance(document.appearance)) {
    return;
  }

  const persisted: PersistedAlbumWallV2 = {
    appearance: document.appearance,
    version: 2,
    wall: document.wall,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(persisted));
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
};
