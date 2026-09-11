import { useDraggable } from "@dnd-kit/react";

import { AlbumCard } from "./album-card";

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

const formControlClassName = "wall-form-control min-h-[2.2rem]";

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

const DimensionControl = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-[0.75rem] font-[650] wall-text-muted">{label}</span>
    <div className="grid grid-cols-3 items-center gap-1">
      <button
        aria-label={`Decrease ${label}`}
        className={`${formControlClassName} wall-btn-accent min-h-[1.8rem] cursor-pointer p-0 text-[1.05rem] leading-none`}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        type="button"
      >
        −
      </button>
      <output
        aria-label={`${label} count`}
        className="text-center text-[0.9rem] tabular-nums"
      >
        {value}
      </output>
      <button
        aria-label={`Increase ${label}`}
        className={`${formControlClassName} wall-btn-accent min-h-[1.8rem] cursor-pointer p-0 text-[1.05rem] leading-none`}
        disabled={value >= 7}
        onClick={() => onChange(value + 1)}
        type="button"
      >
        +
      </button>
    </div>
  </div>
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
    <h1 className="wall-eyebrow px-5 pt-3">Album Wall</h1>
    <div className="border-b p-5 pt-0 wall-border">
      <form className="mt-[1.2rem] grid gap-2" onSubmit={onSearch}>
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[0.75rem] font-[650] wall-text-muted"
            id="search-mode-label"
          >
            Search by
          </span>
          <div
            aria-labelledby="search-mode-label"
            className="flex overflow-hidden rounded-[0.35rem] border wall-border bg-white"
            role="group"
          >
            {searchModes.map((mode) => (
              <button
                aria-pressed={searchBy === mode.value}
                className={`min-h-[1.8rem] cursor-pointer border-0 px-[0.6rem] py-[0.35rem] text-[0.75rem] font-[650] ${
                  searchBy === mode.value
                    ? "wall-btn-accent"
                    : "wall-text-muted"
                }`}
                key={mode.value}
                onClick={() => onSearchByChange(mode.value)}
                type="button"
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        <label className="sr-only" htmlFor="album-search">
          Search albums or songs
        </label>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-[0.4rem]">
          <input
            autoComplete="off"
            className={`${formControlClassName} box-border w-full bg-white px-[0.6rem] py-2`}
            id="album-search"
            onChange={(event) => onDraftQueryChange(event.target.value)}
            placeholder="Try Fleetwood Mac"
            type="search"
            value={draftQuery}
          />
          <button
            className={`${formControlClassName} wall-btn-accent cursor-pointer px-[0.7rem] py-[0.45rem] font-bold`}
            type="submit"
          >
            Search
          </button>
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
      className="grid gap-3 border-t p-5 wall-border wall-bg-settings"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="m-0 text-[0.85rem]">Wall settings</h2>
        <span className="text-[0.75rem] tabular-nums wall-text-muted">
          {occupancy} / {rows * columns}
        </span>
      </div>
      <DimensionControl
        label="Rows"
        onChange={(value) => onDimensionChange("rows", value)}
        value={rows}
      />
      <DimensionControl
        label="Columns"
        onChange={(value) => onDimensionChange("columns", value)}
        value={columns}
      />
    </section>
  </aside>
);
