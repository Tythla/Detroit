import { useDraggable, useDroppable } from "@dnd-kit/react";

import { AlbumCard } from "./album-card";
import { useBoundedGridSize } from "../layout/use-bounded-grid-size";

import type { Album } from "../albums/types";
import type {
  WallAlbumDragData,
  WallCellDropData,
} from "../drag-and-drop/types";
import type { WallState } from "../state/wall-state";

type WallGridProps = {
  state: WallState;
  highlightedCell: number | null;
  onRemove: (index: number) => void;
  onKeyboardMove: (index: number, direction: "up" | "down" | "left" | "right") => void;
};

const WallCell = ({
  album,
  highlighted,
  index,
  onRemove,
  onKeyboardMove,
}: {
  album: Album | null;
  highlighted: boolean;
  index: number;
  onRemove: (index: number) => void;
  onKeyboardMove: (index: number, direction: "up" | "down" | "left" | "right") => void;
}) => {
  const dropData: WallCellDropData = { kind: "wall-cell", index };
  const { isDropTarget, ref: droppableRef } = useDroppable({
    data: dropData,
    id: `wall-cell-${index}`,
  });
  const dragData: WallAlbumDragData = {
    album: album as Album,
    index,
    kind: "wall-album",
  };
  const { isDragging, ref: draggableRef } = useDraggable({
    data: dragData,
    disabled: !album,
    id: `wall-album-${index}`,
  });

  return (
    <div
      aria-label={album ? `${album.title} by ${album.artist}` : `Empty wall cell ${index + 1}`}
      className={`wall-cell ${isDropTarget ? "wall-cell--target" : ""} ${
        highlighted ? "wall-cell--highlighted" : ""
      }`}
      ref={droppableRef}
      role="gridcell"
      tabIndex={0}
    >
      {album ? (
        <div className="wall-cell__album-wrap">
          <AlbumCard
            ref={draggableRef}
            album={album}
            className="wall-album"
            details="overlay"
            focusable
            isDragging={isDragging}
            onKeyDown={(event) => {
              if (
                event.defaultPrevented ||
                !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
                  event.key,
                )
              ) {
                return;
              }

              event.preventDefault();
              onKeyboardMove(
                index,
                event.key.slice(5).toLowerCase() as
                  | "up"
                  | "down"
                  | "left"
                  | "right",
              );
            }}
          />
          <button
            aria-label={`Remove ${album.title} by ${album.artist}`}
            className="wall-cell__remove"
            onClick={() => onRemove(index)}
            type="button"
          >
            ×
          </button>
        </div>
      ) : (
        null
      )}
    </div>
  );
};

export const WallGrid = (props: WallGridProps) => <WallContent {...props} />;

const WallContent = ({
  state,
  highlightedCell,
  onRemove,
  onKeyboardMove,
}: WallGridProps) => {
  const { gridStyle, stageRef } = useBoundedGridSize(
    state.rows,
    state.columns,
  );

  return (
    <main className="album-wall-canvas">
      <div className="wall-canvas__header">
        <div>
          <p className="eyebrow">Your collection</p>
        </div>
      </div>
      <div className="wall-grid-stage" ref={stageRef}>
        <div
          aria-label={`${state.rows} by ${state.columns} album wall`}
          className="wall-grid"
          role="grid"
          style={{
            ...gridStyle,
            "--wall-columns": state.columns,
          } as React.CSSProperties}
        >
          {state.cells.map((album, index) => (
            <WallCell
              album={album}
              highlighted={highlightedCell === index}
              index={index}
              key={index}
              onKeyboardMove={onKeyboardMove}
              onRemove={onRemove}
            />
          ))}
        </div>
      </div>
    </main>
  );
};
