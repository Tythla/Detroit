import type { Album } from "../albums/types";

export const DEFAULT_WALL_ROWS = 5;
export const DEFAULT_WALL_COLUMNS = 5;
export const MIN_WALL_DIMENSION = 1;
export const MAX_WALL_DIMENSION = 7;

export type WallState = {
  rows: number;
  columns: number;
  cells: Array<Album | null>;
};

export type AddResult =
  | { kind: "added"; state: WallState; index: number }
  | { kind: "duplicate"; index: number }
  | { kind: "full" }
  | { kind: "occupied" };

const isDimension = (value: number) =>
  Number.isInteger(value) &&
  value >= MIN_WALL_DIMENSION &&
  value <= MAX_WALL_DIMENSION;

export const createEmptyWall = (
  rows = DEFAULT_WALL_ROWS,
  columns = DEFAULT_WALL_COLUMNS,
): WallState => ({
  rows,
  columns,
  cells: Array.from({ length: rows * columns }, () => null),
});

export const getOccupancy = (state: WallState) =>
  state.cells.reduce((count, album) => count + (album ? 1 : 0), 0);

export const findAlbumIndex = (state: WallState, albumId: string) =>
  state.cells.findIndex((album) => album?.id === albumId);

const cloneWithCells = (state: WallState, cells: Array<Album | null>) => ({
  rows: state.rows,
  columns: state.columns,
  cells,
});

export const addAlbumToFirstEmpty = (
  state: WallState,
  album: Album,
): AddResult => {
  const existingIndex = findAlbumIndex(state, album.id);
  if (existingIndex >= 0) {
    return { kind: "duplicate", index: existingIndex };
  }

  const index = state.cells.findIndex((cell) => cell === null);
  if (index < 0) {
    return { kind: "full" };
  }

  const cells = [...state.cells];
  cells[index] = album;
  return { kind: "added", index, state: cloneWithCells(state, cells) };
};

export const addAlbumToCell = (
  state: WallState,
  album: Album,
  targetIndex: number,
): AddResult => {
  const existingIndex = findAlbumIndex(state, album.id);
  if (existingIndex >= 0) {
    return { kind: "duplicate", index: existingIndex };
  }

  if (targetIndex < 0 || targetIndex >= state.cells.length) {
    return { kind: "occupied" };
  }

  if (state.cells[targetIndex]) {
    return { kind: "occupied" };
  }

  const cells = [...state.cells];
  cells[targetIndex] = album;
  return {
    kind: "added",
    index: targetIndex,
    state: cloneWithCells(state, cells),
  };
};

export const moveOrSwapAlbum = (
  state: WallState,
  sourceIndex: number,
  targetIndex: number,
): WallState | null => {
  if (
    sourceIndex < 0 ||
    sourceIndex >= state.cells.length ||
    targetIndex < 0 ||
    targetIndex >= state.cells.length ||
    sourceIndex === targetIndex ||
    !state.cells[sourceIndex]
  ) {
    return null;
  }

  const cells = [...state.cells];
  [cells[sourceIndex], cells[targetIndex]] = [
    cells[targetIndex],
    cells[sourceIndex],
  ];
  return cloneWithCells(state, cells);
};

export const removeAlbumAt = (
  state: WallState,
  index: number,
): WallState | null => {
  if (index < 0 || index >= state.cells.length || !state.cells[index]) {
    return null;
  }

  const cells = [...state.cells];
  cells[index] = null;
  return cloneWithCells(state, cells);
};

export const resizeWall = (
  state: WallState,
  rows: number,
  columns: number,
): WallState | null => {
  if (!isDimension(rows) || !isDimension(columns)) {
    return null;
  }

  for (let row = 0; row < state.rows; row += 1) {
    for (let column = 0; column < state.columns; column += 1) {
      const sourceIndex = row * state.columns + column;
      if (
        state.cells[sourceIndex] &&
        (row >= rows || column >= columns)
      ) {
        return null;
      }
    }
  }

  const cells = Array.from({ length: rows * columns }, () => null as Album | null);
  const rowsToCopy = Math.min(rows, state.rows);
  const columnsToCopy = Math.min(columns, state.columns);

  for (let row = 0; row < rowsToCopy; row += 1) {
    for (let column = 0; column < columnsToCopy; column += 1) {
      cells[row * columns + column] = state.cells[row * state.columns + column];
    }
  }

  return { rows, columns, cells };
};
