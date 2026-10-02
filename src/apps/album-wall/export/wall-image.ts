import type { Album } from "../albums/types";
import type { WallAppearance } from "../state/wall-appearance";
import type { WallState } from "../state/wall-state";

export type ExportFormat = "png" | "jpg";

const EXPORT_CELL_SIZE = 600;
const EXPORT_ARTWORK_SIZE = 800;
const LAYOUT_REFERENCE_CELL_SIZE = 160;
const MAX_EXPORT_EDGE = 4096;
const JPEG_QUALITY = 0.92;
const EMPTY_CELL_FILL = "#ffffff";
const EMPTY_CELL_STROKE = "#d5dcd7";
const FALLBACK_FILL = "#dfe7e1";
const FALLBACK_TEXT = "#1d2321";

const withArtworkSize = (url: string, size: number) =>
  url.replace(/\/\d+x\d+([a-z]*)(\.\w+)$/i, `/${size}x${size}$1$2`);

const scaledLength = (value: number, cellSize: number) =>
  (value * cellSize) / LAYOUT_REFERENCE_CELL_SIZE;

const getWallImageMetrics = (
  wall: WallState,
  appearance: WallAppearance,
  cellSize: number,
) => {
  const gap = scaledLength(appearance.albumGap, cellSize);
  const padding = scaledLength(appearance.wallPadding, cellSize);

  return {
    cellSize,
    gap,
    height:
      padding * 2 + cellSize * wall.rows + gap * Math.max(0, wall.rows - 1),
    padding,
    width:
      padding * 2 +
      cellSize * wall.columns +
      gap * Math.max(0, wall.columns - 1),
  };
};

const loadArtwork = async (url: string): Promise<ImageBitmap | null> => {
  try {
    const response = await fetch(withArtworkSize(url, EXPORT_ARTWORK_SIZE), {
      cache: "reload",
      mode: "cors",
    });
    if (!response.ok) {
      return null;
    }

    return await createImageBitmap(await response.blob());
  } catch {
    return null;
  }
};

const drawFallback = (
  context: CanvasRenderingContext2D,
  album: Album,
  x: number,
  y: number,
  cellSize: number,
) => {
  context.fillStyle = FALLBACK_FILL;
  context.fillRect(x, y, cellSize, cellSize);
  context.fillStyle = FALLBACK_TEXT;
  context.font = `700 ${Math.round(cellSize * 0.28)}px ui-sans-serif, system-ui, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(
    album.title.slice(0, 2).toUpperCase(),
    x + cellSize / 2,
    y + cellSize / 2,
  );
};

const drawEmptyCell = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
) => {
  context.fillStyle = EMPTY_CELL_FILL;
  context.fillRect(x, y, cellSize, cellSize);
  context.strokeStyle = EMPTY_CELL_STROKE;
  context.lineWidth = Math.max(1, cellSize / LAYOUT_REFERENCE_CELL_SIZE);
  context.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
};

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  format: ExportFormat,
) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Couldn't create the image file."));
          return;
        }

        resolve(blob);
      },
      format === "png" ? "image/png" : "image/jpeg",
      format === "jpg" ? JPEG_QUALITY : undefined,
    );
  });

const downloadBlob = (blob: Blob, fileName: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = fileName;
  link.href = objectUrl;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};

export const downloadWallImage = async (
  wall: WallState,
  appearance: WallAppearance,
  format: ExportFormat,
) => {
  let cellSize = EXPORT_CELL_SIZE;
  let metrics = getWallImageMetrics(wall, appearance, cellSize);
  const edge = Math.max(metrics.width, metrics.height);

  if (edge > MAX_EXPORT_EDGE) {
    cellSize *= MAX_EXPORT_EDGE / edge;
    metrics = getWallImageMetrics(wall, appearance, cellSize);
  }

  const artwork = await Promise.all(
    wall.cells.map((album) =>
      album?.artworkUrl ? loadArtwork(album.artworkUrl) : Promise.resolve(null),
    ),
  );

  const canvas = document.createElement("canvas");
  canvas.height = Math.max(1, Math.round(metrics.height));
  canvas.width = Math.max(1, Math.round(metrics.width));
  const context = canvas.getContext("2d");

  if (!context) {
    artwork.forEach((bitmap) => bitmap?.close());
    throw new Error("Couldn't export the album wall.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.fillStyle = appearance.backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  wall.cells.forEach((album, index) => {
    const column = index % wall.columns;
    const row = Math.floor(index / wall.columns);
    const x = Math.round(
      metrics.padding + column * (metrics.cellSize + metrics.gap),
    );
    const y = Math.round(
      metrics.padding + row * (metrics.cellSize + metrics.gap),
    );
    const bitmap = artwork[index];

    if (bitmap) {
      context.drawImage(bitmap, x, y, metrics.cellSize, metrics.cellSize);
      bitmap.close();
      return;
    }

    if (album) {
      drawFallback(context, album, x, y, metrics.cellSize);
      return;
    }

    drawEmptyCell(context, x, y, metrics.cellSize);
  });

  const blob = await canvasToBlob(canvas, format);
  downloadBlob(blob, `album-wall.${format}`);
};
