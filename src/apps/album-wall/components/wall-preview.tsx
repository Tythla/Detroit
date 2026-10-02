import { AlbumCard } from "./album-card";
import { useBoundedGridSize } from "../layout/use-bounded-grid-size";

import type { WallAppearance } from "../state/wall-appearance";
import type { WallState } from "../state/wall-state";

type WallPreviewProps = {
  appearance: WallAppearance;
  state: WallState;
};

export const WallPreview = ({ appearance, state }: WallPreviewProps) => {
  const { gridStyle, stageRef } = useBoundedGridSize(
    state.rows,
    state.columns,
    appearance.albumGap,
  );

  return (
    <div
      aria-label={`${state.rows} by ${state.columns} album wall preview`}
      className="album-wall-export-preview"
      role="region"
      style={{
        backgroundColor: appearance.backgroundColor,
        padding: `${appearance.wallPadding}px`,
      }}
    >
      <div
        className="grid h-full min-h-0 min-w-0 place-items-center overflow-hidden"
        ref={stageRef}
      >
        <div
          className="grid max-h-full max-w-full"
          style={{
            ...gridStyle,
            gap: `${appearance.albumGap}px`,
            gridAutoRows: "minmax(0, 1fr)",
            gridTemplateColumns: `repeat(${state.columns}, minmax(0, 1fr))`,
          }}
        >
          {state.cells.map((album, index) => (
            <div
              className="relative grid aspect-square h-full min-h-0 min-w-0 place-items-center border bg-white wall-border"
              key={index}
            >
              {album ? (
                <AlbumCard
                  album={album}
                  className="h-full w-full"
                  details="none"
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
