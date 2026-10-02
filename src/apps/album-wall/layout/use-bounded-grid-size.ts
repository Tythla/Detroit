import { useEffect, useRef, useState, type CSSProperties } from "react";

type StageSize = {
  height: number;
  width: number;
};

const getGridSize = (
  stage: StageSize,
  rows: number,
  columns: number,
  gap: number,
): StageSize => {
  const widthFromHeight =
    ((stage.height - gap * (rows - 1)) / rows) * columns +
    gap * (columns - 1);
  const width = Math.max(0, Math.min(stage.width, widthFromHeight));
  const cellSize =
    columns > 0
      ? Math.max(0, (width - gap * (columns - 1)) / columns)
      : 0;

  return {
    height: cellSize * rows + gap * (rows - 1),
    width,
  };
};

export const useBoundedGridSize = (
  rows: number,
  columns: number,
  gap: number,
) => {
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

  const gridSize = getGridSize(stageSize, rows, columns, gap);
  const gridStyle: CSSProperties | undefined =
    stageSize.width > 0 && stageSize.height > 0
      ? {
        height: `${gridSize.height}px`,
        width: `${gridSize.width}px`,
      }
      : undefined;

  return { gridStyle, stageRef };
};
