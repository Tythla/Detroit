import { useDraggable, useDroppable } from "@dnd-kit/react";
import { CloseButton } from "@mantine/core";

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
  onRemove: (index: number) => void;
  onKeyboardMove: (index: number, direction: "up" | "down" | "left" | "right") => void;
};

const WallCell = ({
  album,
  index,
  onRemove,
  onKeyboardMove,
}: {
  album: Album | null;
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
      className={`wall-cell group relative grid aspect-square h-full min-h-0 min-w-0 place-items-center border bg-white outline-none wall-border ${
        isDropTarget ? "wall-cell--active" : ""
      }`}
      ref={droppableRef}
      role="gridcell"
      tabIndex={0}
    >
      {album ? (
        <div className="relative h-full w-full">
          <AlbumCard
            ref={draggableRef}
            album={album}
            className="h-full w-full"
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
          <div className="wall-remove-btn-wrap">
            <CloseButton
              aria-label={`Remove ${album.title} by ${album.artist}`}
              className="wall-remove-btn"
              onClick={() => onRemove(index)}
              size="lg"
            />
          </div>
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
  onRemove,
  onKeyboardMove,
}: WallGridProps) => {
  const { gridStyle, stageRef } = useBoundedGridSize(
    state.rows,
    state.columns,
  );

  return (
    <main className="album-wall-canvas flex min-h-0 min-w-0 flex-col gap-5 overflow-hidden max-[760px]:h-auto max-[760px]:min-h-[70vh] max-[760px]:overflow-visible">
      <div className="mx-auto flex w-full max-w-[1100px] items-end justify-between gap-6 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-2" />
      <div
        className="grid min-h-0 min-w-0 flex-1 place-items-center overflow-hidden max-[760px]:h-[min(80vw,60vh)] max-[760px]:min-h-64"
        ref={stageRef}
      >
        <div
          aria-label={`${state.rows} by ${state.columns} album wall`}
          className="grid max-h-full max-w-full gap-2"
          role="grid"
          style={{
            ...gridStyle,
            gridAutoRows: "minmax(0, 1fr)",
            gridTemplateColumns: `repeat(${state.columns}, minmax(0, 1fr))`,
          }}
        >
          {state.cells.map((album, index) => (
            <WallCell
              album={album}
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
