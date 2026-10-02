import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";

import { useAlbumSearch, type AlbumSearchBy } from "./albums";
import "./album-wall.css";
import { ExportDrawer } from "./components/export-drawer";
import { Header } from "./components/header";
import { SearchSidebar } from "./components/search-sidebar";
import { WallGrid } from "./components/wall-grid";
import { WallSettingsSidebar } from "./components/wall-settings-sidebar";
import { loadAlbumWall, saveAlbumWall } from "./persistence/storage";
import {
  addAlbumToCell,
  addAlbumToFirstEmpty,
  getOccupancy,
  moveOrSwapAlbum,
  removeAlbumAt,
  resizeWall,
} from "./state/wall-state";

import type { Album } from "./albums/types";
import type { AlbumWallDragData } from "./drag-and-drop/types";

const isAlbumWallDragData = (value: unknown): value is AlbumWallDragData =>
  Boolean(value && typeof value === "object" && "kind" in value);

export const AlbumWall = () => {
  const [document, setDocument] = useState(loadAlbumWall);
  const { appearance, wall } = document;
  const [draftQuery, setDraftQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [draftSearchBy, setDraftSearchBy] = useState<AlbumSearchBy>("album");
  const [submittedSearchBy, setSubmittedSearchBy] =
    useState<AlbumSearchBy>("album");
  const searchState = useAlbumSearch(submittedQuery, submittedSearchBy);
  const [isExportOpen, exportDrawer] = useDisclosure(false);

  useEffect(() => {
    saveAlbumWall(document);
  }, [document]);

  const setWall = (nextWall: typeof wall) => {
    setDocument((current) => ({ ...current, wall: nextWall }));
  };

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
        aside={{ breakpoint: 0, width: 260 }}
        header={{ height: 52 }}
        mode="static"
        padding={0}
      >
        <Header exportOpened={isExportOpen} onExportClick={exportDrawer.open} />
        <ExportDrawer
          appearance={appearance}
          onClose={exportDrawer.close}
          opened={isExportOpen}
          wall={wall}
        />
        <AppShell.Main className="album-wall-main">
          <SearchSidebar
            draftQuery={draftQuery}
            onAddAlbum={addAlbum}
            onDraftQueryChange={setDraftQuery}
            onSearch={handleSearch}
            onSearchByChange={setDraftSearchBy}
            searchBy={draftSearchBy}
            searchState={searchState}
          />
          <WallGrid
            appearance={appearance}
            onRemove={handleRemove}
            onKeyboardMove={handleKeyboardMove}
            state={wall}
          />
        </AppShell.Main>
        <AppShell.Aside>
          <WallSettingsSidebar
            appearance={appearance}
            columns={wall.columns}
            occupancy={getOccupancy(wall)}
            onAppearanceChange={(nextAppearance) =>
              setDocument((current) => ({
                ...current,
                appearance: nextAppearance,
              }))
            }
            onDimensionChange={handleDimensionChange}
            rows={wall.rows}
          />
        </AppShell.Aside>
      </AppShell>
    </DragDropProvider>
  );
};
