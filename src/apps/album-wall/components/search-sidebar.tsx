import { useDraggable } from "@dnd-kit/react";
import {
  ActionIcon,
  SegmentedControl,
  TextInput,
} from "@mantine/core";
import { MdSearch } from "react-icons/md";

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

export const SearchSidebar = ({
  draftQuery,
  onDraftQueryChange,
  onSearch,
  onAddAlbum,
  searchBy,
  onSearchByChange,
  searchState,
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
          <SegmentedControl
            aria-labelledby="search-mode-label"
            autoContrast
            data={searchModes}
            onChange={(value) => onSearchByChange(value as AlbumSearchBy)}
            transitionDuration={0}
            value={searchBy}
          />
        </div>
        <div className="flex flex-row gap-1">
          <TextInput
            aria-label="Album or song title"
            autoComplete="off"
            className="w-full"
            id="album-search"
            onChange={(event) => onDraftQueryChange(event.target.value)}
            placeholder="Try Imaginal Disk"
            type="search"
            value={draftQuery}
          />
          <ActionIcon
            aria-label="Search Apple Music"
            autoContrast
            loading={searchState.isLoading}
            size="lg"
            type="submit"
          >
            <MdSearch />
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

  </aside>
);
