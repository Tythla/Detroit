import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { useEffect, useState } from "react";

import { useAlbumSearch, type AlbumSearchBy } from "./albums";
import "./album-wall.css";
import { SearchSidebar } from "./components/search-sidebar";
import { WallGrid } from "./components/wall-grid";
import { loadWallState, saveWallState } from "./persistence/storage";
import {
  addAlbumToCell,
  addAlbumToFirstEmpty,
  getOccupancy,
  moveOrSwapAlbum,
  removeAlbumAt,
  resizeWall,
  type WallState,
} from "./state/wall-state";

import type { Album } from "./albums/types";
import type { AlbumWallDragData } from "./drag-and-drop/types";

const isAlbumWallDragData = (value: unknown): value is AlbumWallDragData =>
  Boolean(value && typeof value === "object" && "kind" in value);

export const AlbumWall = () => {
  const [wall, setWall] = useState<WallState>(() => loadWallState());
  const [draftQuery, setDraftQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [draftSearchBy, setDraftSearchBy] = useState<AlbumSearchBy>("album");
  const [submittedSearchBy, setSubmittedSearchBy] =
    useState<AlbumSearchBy>("album");
  const [highlightedCell, setHighlightedCell] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "Ready to build your album wall.",
  );
  const searchState = useAlbumSearch(submittedQuery, submittedSearchBy);

  useEffect(() => {
    saveWallState(wall);
  }, [wall]);

  const focusWallCell = (index: number) => {
    setHighlightedCell(index);
    queueMicrotask(() => {
      document.getElementById(`wall-cell-${index}`)?.focus();
    });
  };

  const reportAddResult = (
    result: ReturnType<typeof addAlbumToFirstEmpty>,
    album: Album,
  ) => {
    if (result.kind === "added") {
      setWall(result.state);
      focusWallCell(result.index);
      setStatusMessage(`${album.title} added to cell ${result.index + 1}.`);
      return;
    }

    if (result.kind === "duplicate") {
      focusWallCell(result.index);
      setStatusMessage(`${album.title} is already on your wall.`);
      return;
    }

    if (result.kind === "full") {
      setStatusMessage("Your wall is full. Remove an album before adding another.");
      return;
    }

    setStatusMessage("That wall cell is occupied. Choose an empty cell.");
  };

  const addAlbum = (album: Album) => {
    reportAddResult(addAlbumToFirstEmpty(wall, album), album);
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(draftQuery.trim());
    setSubmittedSearchBy(draftSearchBy);
    setStatusMessage(
      draftQuery.trim()
        ? `Searching for ${draftQuery.trim()}.`
        : "Enter an album or song title to search.",
    );
  };

  const handleDimensionChange = (
    dimension: "rows" | "columns",
    value: number,
  ) => {
    const updated = resizeWall(
      wall,
      dimension === "rows" ? value : wall.rows,
      dimension === "columns" ? value : wall.columns,
    );

    if (!updated) {
      setStatusMessage(
        "Move or remove albums from the cells outside the smaller wall first.",
      );
      return;
    }

    setWall(updated);
    setStatusMessage(`Wall resized to ${updated.rows} rows by ${updated.columns} columns.`);
  };

  const handleRemove = (index: number) => {
    const album = wall.cells[index];
    const updated = removeAlbumAt(wall, index);
    if (!updated || !album) {
      return;
    }

    setWall(updated);
    setHighlightedCell(null);
    setStatusMessage(`${album.title} removed from your wall.`);
  };

  const handleKeyboardMove = (
    index: number,
    direction: "up" | "down" | "left" | "right",
  ) => {
    const row = Math.floor(index / wall.columns);
    const column = index % wall.columns;
    const nextRow =
      direction === "up"
        ? row - 1
        : direction === "down"
          ? row + 1
          : row;
    const nextColumn =
      direction === "left"
        ? column - 1
        : direction === "right"
          ? column + 1
          : column;

    if (
      nextRow < 0 ||
      nextRow >= wall.rows ||
      nextColumn < 0 ||
      nextColumn >= wall.columns
    ) {
      setStatusMessage("That move would leave the wall.");
      return;
    }

    const targetIndex = nextRow * wall.columns + nextColumn;
    const targetWasOccupied = Boolean(wall.cells[targetIndex]);
    const updated = moveOrSwapAlbum(wall, index, targetIndex);
    if (!updated) {
      return;
    }

    setWall(updated);
    focusWallCell(targetIndex);
    setStatusMessage(targetWasOccupied ? "Albums swapped." : "Album moved to its new wall cell.");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) {
      return;
    }

    const sourceData = event.operation.source?.data;
    const targetData = event.operation.target?.data;
    if (!isAlbumWallDragData(sourceData) || !isAlbumWallDragData(targetData)) {
      return;
    }

    if (
      sourceData.kind === "search-album" &&
      targetData.kind === "wall-cell"
    ) {
      const result = addAlbumToCell(wall, sourceData.album, targetData.index);
      if (result.kind === "occupied") {
        setStatusMessage("That wall cell is occupied. Choose an empty cell.");
        return;
      }
      reportAddResult(result, sourceData.album);
      return;
    }

    if (
      sourceData.kind === "wall-album" &&
      targetData.kind === "wall-cell"
    ) {
      const targetWasOccupied = Boolean(wall.cells[targetData.index]);
      const updated = moveOrSwapAlbum(
        wall,
        sourceData.index,
        targetData.index,
      );
      if (!updated) {
        return;
      }

      setWall(updated);
      focusWallCell(targetData.index);
      setStatusMessage(
        targetWasOccupied
          ? "Albums swapped."
          : "Album moved to its new wall cell.",
      );
    }
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="album-wall-app">
        <div className="album-wall-shell">
          <SearchSidebar
            columns={wall.columns}
            draftQuery={draftQuery}
            occupancy={getOccupancy(wall)}
            onAddAlbum={addAlbum}
            onDimensionChange={handleDimensionChange}
            onDraftQueryChange={setDraftQuery}
            onSearch={handleSearch}
            onSearchByChange={setDraftSearchBy}
            rows={wall.rows}
            searchBy={draftSearchBy}
            searchState={searchState}
          />
          <WallGrid
            highlightedCell={highlightedCell}
            onRemove={handleRemove}
            onKeyboardMove={handleKeyboardMove}
            state={wall}
          />
        </div>
        <p aria-live="polite" className="album-wall-status" role="status">
          {statusMessage}
        </p>
      </div>
    </DragDropProvider>
  );
};
