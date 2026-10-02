export const MIN_ALBUM_GAP = 0;
export const MAX_ALBUM_GAP = 24;
export const MIN_WALL_PADDING = 0;
export const MAX_WALL_PADDING = 64;

export type WallAppearance = {
  albumGap: number;
  wallPadding: number;
  backgroundColor: string;
};

export const DEFAULT_WALL_APPEARANCE: WallAppearance = {
  albumGap: 8,
  wallPadding: 32,
  backgroundColor: "#f6f8f5",
};

const isIntegerInRange = (value: unknown, min: number, max: number) =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= min &&
  value <= max;

const isHexColor = (value: unknown): value is string =>
  typeof value === "string" && /^#[\da-f]{6}$/i.test(value);

export const isWallAppearance = (
  value: unknown,
): value is WallAppearance => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const appearance = value as Partial<WallAppearance>;
  return (
    isIntegerInRange(
      appearance.albumGap,
      MIN_ALBUM_GAP,
      MAX_ALBUM_GAP,
    ) &&
    isIntegerInRange(
      appearance.wallPadding,
      MIN_WALL_PADDING,
      MAX_WALL_PADDING,
    ) &&
    isHexColor(appearance.backgroundColor)
  );
};
