import {
  Button,
  ColorInput,
  Divider,
  Slider,
  type SliderMark,
} from "@mantine/core";

import {
  DEFAULT_WALL_APPEARANCE,
  MAX_ALBUM_GAP,
  MAX_WALL_PADDING,
  MIN_ALBUM_GAP,
  MIN_WALL_PADDING,
  type WallAppearance,
} from "../state/wall-appearance";
import {
  MAX_WALL_DIMENSION,
  MIN_WALL_DIMENSION,
} from "../state/wall-state";

type WallSettingsSidebarProps = {
  appearance: WallAppearance;
  columns: number;
  occupancy: number;
  onAppearanceChange: (appearance: WallAppearance) => void;
  onDimensionChange: (dimension: "rows" | "columns", value: number) => void;
  rows: number;
};

const dimensionSliderMarks: SliderMark[] = Array.from(
  { length: MAX_WALL_DIMENSION - MIN_WALL_DIMENSION - 1 },
  (_, index) => ({
    value: MIN_WALL_DIMENSION + 1 + index,
  }),
);

const SettingSlider = ({
  label,
  marks,
  max,
  min,
  onChange,
  suffix = "",
  value,
}: {
  label: string;
  marks?: SliderMark[];
  max: number;
  min: number;
  onChange: (value: number) => void;
  suffix?: string;
  value: number;
}) => (
  <div className="grid gap-2">
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[0.75rem] font-[650] wall-text-muted">
        {label}
      </span>
      <span className="text-[0.75rem] tabular-nums wall-text-muted">
        {value}
        {suffix}
      </span>
    </div>
    <Slider
      id={`wall-setting-${label.toLowerCase().replaceAll(" ", "-")}`}
      label={(currentValue) => `${currentValue}${suffix}`}
      marks={marks}
      max={max}
      min={min}
      onChange={onChange}
      step={1}
      thumbLabel={label}
      value={value}
    />
  </div>
);

const backgroundSwatches = [
  "#f6f8f5",
  "#ffffff",
  "#fff8e1",
  "#ffdd9a",
  "#eef2ee",
  "#dfe7e1",
  "#1d2321",
];

export const WallSettingsSidebar = ({
  appearance,
  columns,
  occupancy,
  onAppearanceChange,
  onDimensionChange,
  rows,
}: WallSettingsSidebarProps) => (
  <section
    aria-label="Wall settings"
    className="album-wall-settings-sidebar flex h-full min-h-0 flex-col gap-5 overflow-y-auto p-5 wall-bg-settings"
  >
    <div className="flex items-baseline justify-between gap-2">
      <h2 className="m-0 text-[0.85rem]">Wall settings</h2>
      <span className="text-[0.75rem] tabular-nums wall-text-muted">
        {occupancy} / {rows * columns}
      </span>
    </div>

    <section aria-labelledby="wall-dimensions-heading" className="grid gap-4">
      <h3 className="m-0 text-[0.75rem] uppercase tracking-[0.08em] wall-text-muted" id="wall-dimensions-heading">
        Dimensions
      </h3>
      <SettingSlider
        label="Rows"
        marks={dimensionSliderMarks}
        max={MAX_WALL_DIMENSION}
        min={MIN_WALL_DIMENSION}
        onChange={(value) => onDimensionChange("rows", value)}
        value={rows}
      />
      <SettingSlider
        label="Columns"
        marks={dimensionSliderMarks}
        max={MAX_WALL_DIMENSION}
        min={MIN_WALL_DIMENSION}
        onChange={(value) => onDimensionChange("columns", value)}
        value={columns}
      />
    </section>

    <Divider />

    <section aria-labelledby="wall-appearance-heading" className="grid gap-4">
      <h3 className="m-0 text-[0.75rem] uppercase tracking-[0.08em] wall-text-muted" id="wall-appearance-heading">
        Appearance
      </h3>
      <SettingSlider
        label="Album gap"
        max={MAX_ALBUM_GAP}
        min={MIN_ALBUM_GAP}
        onChange={(albumGap) =>
          onAppearanceChange({ ...appearance, albumGap })
        }
        suffix="px"
        value={appearance.albumGap}
      />
      <SettingSlider
        label="Wall padding"
        max={MAX_WALL_PADDING}
        min={MIN_WALL_PADDING}
        onChange={(wallPadding) =>
          onAppearanceChange({ ...appearance, wallPadding })
        }
        suffix="px"
        value={appearance.wallPadding}
      />
      <ColorInput
        format="hex"
        label="Background"
        onChange={(backgroundColor) =>
          onAppearanceChange({ ...appearance, backgroundColor })
        }
        swatches={backgroundSwatches}
        value={appearance.backgroundColor}
      />
    </section>

    <Button
      className="mt-auto"
      onClick={() => onAppearanceChange(DEFAULT_WALL_APPEARANCE)}
      variant="subtle"
    >
      Reset appearance
    </Button>
  </section>
);
