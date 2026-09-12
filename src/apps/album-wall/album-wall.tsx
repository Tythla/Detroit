import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { AppShell } from "@mantine/core";
import { useEffect, useState } from "react";

import { useAlbumSearch, type AlbumSearchBy } from "./albums";
import "./album-wall.css";
import { Header } from "./components/header";
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
  const searchState = useAlbumSearch(submittedQuery, submittedSearchBy);

  useEffect(() => {
    saveWallState(wall);
  }, [wall]);

  const reportAddResult = (result: ReturnType<typeof addAlbumToFirstEmpty>) => {
    if (result.kind === "added") {
      setWall(result.state);
    }
  };

  const addAlbum = (album: Album) => {
    reportAddResult(addAlbumToFirstEmpty(wall, album));
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(draftQuery.trim());
    setSubmittedSearchBy(draftSearchBy);
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
      return;
    }

    setWall(updated);
  };

  const handleRemove = (index: number) => {
    const updated = removeAlbumAt(wall, index);
    if (!updated) {
      return;
    }

    setWall(updated);
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
      return;
    }

    const targetIndex = nextRow * wall.columns + nextColumn;
    const updated = moveOrSwapAlbum(wall, index, targetIndex);
    if (!updated) {
      return;
    }

    setWall(updated);
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
        return;
      }
      reportAddResult(result);
      return;
    }

    if (
      sourceData.kind === "wall-album" &&
      targetData.kind === "wall-cell"
    ) {
      const updated = moveOrSwapAlbum(
        wall,
        sourceData.index,
        targetData.index,
      );
      if (!updated) {
        return;
      }

      setWall(updated);
    }
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <AppShell
        className="album-wall-app"
        header={{ height: 52 }}
        mode="static"
        padding={0}
      >
        <Header />
        <AppShell.Main className="album-wall-main">
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
            onRemove={handleRemove}
            onKeyboardMove={handleKeyboardMove}
            state={wall}
          />
        </AppShell.Main>
      </AppShell>
    </DragDropProvider>
  );
};
