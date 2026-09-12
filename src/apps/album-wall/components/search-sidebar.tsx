import { useDraggable } from "@dnd-kit/react";
import { ActionIcon, Button, Input, Slider, type SliderMark } from "@mantine/core";
import { MdSearch } from "react-icons/md";

import { AlbumCard } from "./album-card";
import {
  MAX_WALL_DIMENSION,
  MIN_WALL_DIMENSION,
} from "../state/wall-state";

import type {
  AlbumSearchBy,
  AlbumSearchState,
} from "../albums";
import type { Album } from "../albums/types";
import type { SearchAlbumDragData } from "../drag-and-drop/types";

type SearchSidebarProps = {
  draftQuery: string;
  onDraftQueryChange: (query: string) => void;
  onSearch: (event: React.FormEvent<HTMLFormElement>) => void;
  onAddAlbum: (album: Album) => void;
  searchBy: AlbumSearchBy;
  onSearchByChange: (searchBy: AlbumSearchBy) => void;
  searchState: AlbumSearchState;
  rows: number;
  columns: number;
  occupancy: number;
  onDimensionChange: (dimension: "rows" | "columns", value: number) => void;
};

const searchModes: { label: string; value: AlbumSearchBy }[] = [
  { label: "Album", value: "album" },
  { label: "Song", value: "song" },
];

const SearchResultCard = ({
  album,
  onAddAlbum,
}: {
  album: Album;
  onAddAlbum: (album: Album) => void;
}) => {
  const dragData: SearchAlbumDragData = { kind: "search-album", album };
  const { isDragging, ref } = useDraggable({
    data: dragData,
    id: `search-album-${album.id}`,
  });

  return (
    <AlbumCard
      ref={ref}
      album={album}
      className="cursor-grab bg-white active:cursor-grabbing"
      details="always"
      interactive
      isDragging={isDragging}
      onActivate={() => onAddAlbum(album)}
    />
  );
};

const SearchStatus = ({ state }: { state: AlbumSearchState }) => {
  if (state.status === "loading") {
    return (
      <p className="my-[0.35rem] mb-3 text-[0.8rem] leading-snug wall-text-muted">
        Searching Apple Music…
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <p className="my-[0.35rem] mb-3 text-[0.8rem] leading-snug wall-text-error">
        {state.error}
      </p>
    );
  }

  if (state.isTooShort) {
    return (
      <p className="my-[0.35rem] mb-3 text-[0.8rem] leading-snug wall-text-muted">
        Enter at least 2 characters to search.
      </p>
    );
  }

  if (state.status === "empty") {
    return (
      <p className="my-[0.35rem] mb-3 text-[0.8rem] leading-snug wall-text-muted">
        No albums found.
      </p>
    );
  }

  if (state.status === "idle") {
    return (
      <p className="my-[0.35rem] mb-3 text-[0.8rem] leading-snug wall-text-muted">
        Search by album or song title.
      </p>
    );
  }

  return null;
};

const dimensionSliderMarks: SliderMark[] = Array.from(
  { length: MAX_WALL_DIMENSION - MIN_WALL_DIMENSION - 1 },
  (_, index) => ({
    value: MIN_WALL_DIMENSION + 1 + index,
  }),
);

const DimensionSlider = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => (
  <Slider
    className="w-full"
    label={(currentValue) => currentValue}
    marks={dimensionSliderMarks}
    max={MAX_WALL_DIMENSION}
    min={MIN_WALL_DIMENSION}
    onChange={onChange}
    step={1}
    value={value}
  />
);

export const SearchSidebar = ({
  draftQuery,
  onDraftQueryChange,
  onSearch,
  onAddAlbum,
  searchBy,
  onSearchByChange,
  searchState,
  rows,
  columns,
  occupancy,
  onDimensionChange,
}: SearchSidebarProps) => (
  <aside className="flex h-full min-h-0 flex-col overflow-hidden border-r wall-border wall-bg-sidebar max-[760px]:h-auto max-[760px]:border-r-0 max-[760px]:border-b">
    <div className="shrink-0 border-b p-4 wall-border">
      <form className="grid gap-2" onSubmit={onSearch}>
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[0.75rem] font-[650] wall-text-muted"
            id="search-mode-label"
          >
            Search by
          </span>
          <div
            aria-labelledby="search-mode-label"
            className="flex overflow-hidden rounded-lg border wall-border bg-white"
            role="group"
          >
            {searchModes.map((mode) => (
              <Button
                variant={searchBy === mode.value ? "filled" : "subtle"}
                radius="0"
                key={mode.value}
                onClick={() => onSearchByChange(mode.value)}
              >{mode.label}</Button>
            ))}
          </div>
        </div>
        <div className="flex flex-row gap-1 ">
          <Input
            autoComplete="off"
            className="w-full"
            variant="default"
            id="album-search"
            onChange={(event) => onDraftQueryChange(event.target.value)}
            placeholder="Try Fleetwood Mac"
            type="search"
            value={draftQuery}
          />
          <ActionIcon
            size='lg'
            type="submit"
            loading={searchState.isLoading}
          >
            <MdSearch/>
          </ActionIcon>
        </div>
      </form>
    </div>

    <div
      aria-busy={searchState.isLoading}
      aria-label="Search results"
      aria-live="polite"
      className="min-h-0 flex-1 overflow-y-auto p-[0.9rem] max-[760px]:max-h-[36vh]"
      role="region"
    >
      <SearchStatus state={searchState} />
      {searchState.albums.length > 0 ? (
        <div className="grid grid-cols-2 gap-[0.55rem]">
          {searchState.albums.map((album) => (
            <SearchResultCard
              album={album}
              key={album.id}
              onAddAlbum={onAddAlbum}
            />
          ))}
        </div>
      ) : null}
    </div>

    <section
      aria-label="Wall settings"
      className="grid shrink-0 gap-3 border-t p-5 wall-border wall-bg-settings"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="m-0 text-[0.85rem]">Wall settings</h2>
        <span className="text-[0.75rem] tabular-nums wall-text-muted">
          {occupancy} / {rows * columns}
        </span>
      </div>
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-3">
        <span className="text-[0.75rem] font-[650] wall-text-muted">Rows</span>
        <DimensionSlider
          onChange={(value) => onDimensionChange("rows", value)}
          value={rows}
        />
        <span className="text-[0.75rem] font-[650] wall-text-muted">Columns</span>
        <DimensionSlider
          onChange={(value) => onDimensionChange("columns", value)}
          value={columns}
        />
      </div>
    </section>
  </aside>
);
