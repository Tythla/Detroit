import type { Album } from "../albums/types";

export type SearchAlbumDragData = {
  kind: "search-album";
  album: Album;
};

export type WallAlbumDragData = {
  kind: "wall-album";
  index: number;
  album: Album;
};

export type WallCellDropData = {
  kind: "wall-cell";
  index: number;
};

export type AlbumWallDragData =
  | SearchAlbumDragData
  | WallAlbumDragData
  | WallCellDropData;
