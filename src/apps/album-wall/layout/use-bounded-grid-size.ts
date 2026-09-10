import { useEffect, useRef, useState, type CSSProperties } from "react";

const GRID_GAP_PX = 8;

type StageSize = {
  height: number;
  width: number;
};

const getGridSize = (
  stage: StageSize,
  rows: number,
  columns: number,
): StageSize => {
  const widthFromHeight =
    ((stage.height - GRID_GAP_PX * (rows - 1)) / rows) * columns +
    GRID_GAP_PX * (columns - 1);
  const width = Math.max(0, Math.min(stage.width, widthFromHeight));
  const cellSize =
    columns > 0
      ? Math.max(0, (width - GRID_GAP_PX * (columns - 1)) / columns)
      : 0;

  return {
    height: cellSize * rows + GRID_GAP_PX * (rows - 1),
    width,
  };
};

export const useBoundedGridSize = (rows: number, columns: number) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState<StageSize>({
    height: 0,
    width: 0,
  });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }

      const { height, width } = entry.contentRect;
      setStageSize((current) =>
        current.height === height && current.width === width
          ? current
          : { height, width },
      );
    });

    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const gridSize = getGridSize(stageSize, rows, columns);
  const gridStyle: CSSProperties | undefined =
    stageSize.width > 0 && stageSize.height > 0
      ? {
        height: `${gridSize.height}px`,
        width: `${gridSize.width}px`,
      }
      : undefined;

  return { gridStyle, stageRef };
};
