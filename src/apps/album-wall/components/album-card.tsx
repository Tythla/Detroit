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
      <div className="album-card__artwork album-card__artwork--fallback" aria-hidden="true">
        {fallback}
      </div>
    );
  }

  return (
    <img
      alt={`${album.title} cover`}
      className="album-card__artwork"
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

    return (
      <div
        ref={ref}
        aria-label={`${album.title} by ${album.artist}`}
        className={`album-card album-card--${details} ${className} ${
          isDragging ? "album-card--dragging" : ""
        }`}
        onClick={interactive ? onActivate : undefined}
        onKeyDown={handleKeyDown}
        role={interactive || focusable ? "button" : undefined}
        tabIndex={interactive || focusable ? 0 : undefined}
      >
        <AlbumArtwork album={album} />
        <div className="album-card__details">
          <strong className="album-card__title">{album.title}</strong>
          <span className="album-card__artist">{album.artist}</span>
        </div>
      </div>
    );
  },
);
