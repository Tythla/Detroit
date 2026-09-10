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
      className="search-result"
      details="always"
      interactive
      isDragging={isDragging}
      onActivate={() => onAddAlbum(album)}
    />
  );
};

const SearchStatus = ({ state }: { state: AlbumSearchState }) => {
  if (state.status === "loading") {
    return <p className="search-status">Searching Apple Music…</p>;
  }

  if (state.status === "error") {
    return <p className="search-status search-status--error">{state.error}</p>;
  }

  if (state.isTooShort) {
    return <p className="search-status">Enter at least 2 characters to search.</p>;
  }

  if (state.status === "empty") {
    return <p className="search-status">No albums found.</p>;
  }

  if (state.status === "idle") {
    return <p className="search-status">Search by album or song title.</p>;
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
  <div className="dimension-control">
    <span>{label}</span>
    <div className="dimension-control__actions">
      <button
        aria-label={`Decrease ${label}`}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        type="button"
      >
        −
      </button>
      <output aria-label={`${label} count`}>{value}</output>
      <button
        aria-label={`Increase ${label}`}
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
  <aside className="album-wall-sidebar">
    <div className="sidebar__search">
      <div className="sidebar__heading">
        <p className="eyebrow">Album Wall</p>
        <h1>Find something to keep</h1>
      </div>
      <form className="search-form" onSubmit={onSearch}>
        <label htmlFor="album-search">Search albums or songs</label>
        <div className="search-form__row">
          <input
            id="album-search"
            onChange={(event) => onDraftQueryChange(event.target.value)}
            placeholder="Try Fleetwood Mac"
            type="search"
            value={draftQuery}
          />
          <button type="submit">Search</button>
        </div>
        <label className="search-form__mode" htmlFor="search-mode">
          Search by
          <select
            id="search-mode"
            onChange={(event) =>
              onSearchByChange(event.target.value as AlbumSearchBy)
            }
            value={searchBy}
          >
            <option value="album">Album</option>
            <option value="song">Song</option>
          </select>
        </label>
      </form>
    </div>

    <div
      aria-busy={searchState.isLoading}
      aria-label="Search results"
      aria-live="polite"
      className="search-results"
      role="region"
    >
      <SearchStatus state={searchState} />
      {searchState.albums.length > 0 ? (
        <div className="search-results__grid">
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

    <section aria-label="Wall settings" className="sidebar__settings">
      <div className="settings__heading">
        <h2>Wall settings</h2>
        <span>{occupancy} / {rows * columns}</span>
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
