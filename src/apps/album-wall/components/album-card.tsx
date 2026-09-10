import { forwardRef, useState, type KeyboardEvent } from "react";

import type { Album } from "../albums/types";

type AlbumCardProps = {
  album: Album;
  className?: string;
  details?: "always" | "overlay";
  focusable?: boolean;
  interactive?: boolean;
  isDragging?: boolean;
  onActivate?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
};

const AlbumArtwork = ({ album }: { album: Album }) => {
  const [hasError, setHasError] = useState(false);
  const fallback = album.title.slice(0, 2).toUpperCase();

  if (!album.artworkUrl || hasError) {
    return (
      <div
        aria-hidden="true"
        className="wall-artwork-fallback grid aspect-square w-full place-items-center font-extrabold tracking-[0.06em]"
      >
        {fallback}
      </div>
    );
  }

  return (
    <img
      alt={`${album.title} cover`}
      className="block aspect-square w-full object-cover wall-bg-artwork"
      loading="lazy"
      onError={() => setHasError(true)}
      src={album.artworkUrl}
    />
  );
};

export const AlbumCard = forwardRef<HTMLDivElement, AlbumCardProps>(
  function AlbumCard(
    {
      album,
      className = "",
      details = "always",
      focusable = false,
      interactive = false,
      isDragging = false,
      onActivate,
      onKeyDown,
    },
    ref,
  ) {
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);

      if (!interactive || !onActivate) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onActivate();
      }
    };

    const isOverlay = details === "overlay";

    return (
      <div
        ref={ref}
        aria-label={`${album.title} by ${album.artist}`}
        className={`album-card box-border min-w-0 focus-visible:rounded-[0.35rem] ${
          isOverlay
            ? "relative cursor-grab overflow-hidden rounded-[0.3rem]"
            : "grid gap-[0.35rem] p-[0.2rem]"
        } ${isDragging ? "opacity-45" : ""} ${className}`}
        onClick={interactive ? onActivate : undefined}
        onKeyDown={handleKeyDown}
        role={interactive || focusable ? "button" : undefined}
        tabIndex={interactive || focusable ? 0 : undefined}
      >
        <AlbumArtwork album={album} />
        <div
          className={
            isOverlay
              ? "wall-overlay-details absolute right-0 bottom-0 left-0 px-[0.45rem] pt-[1.8rem] pb-[0.45rem] text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
              : "grid min-w-0 gap-[0.08rem]"
          }
        >
          <strong className="truncate text-[0.72rem]">{album.title}</strong>
          <span
            className={`truncate text-[0.68rem] ${isOverlay ? "text-white/80" : "wall-text-muted"}`}
          >
            {album.artist}
          </span>
        </div>
      </div>
    );
  },
);
