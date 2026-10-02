import { Button, Drawer, Group, Radio } from "@mantine/core";
import { useState } from "react";

import { WallPreview } from "./wall-preview";
import { downloadWallImage } from "../export/wall-image";

import type { ExportFormat } from "../export/wall-image";
import type { WallAppearance } from "../state/wall-appearance";
import type { WallState } from "../state/wall-state";

type ExportDrawerProps = {
  appearance: WallAppearance;
  onClose: () => void;
  opened: boolean;
  wall: WallState;
};

export const ExportDrawer = ({
  appearance,
  onClose,
  opened,
  wall,
}: ExportDrawerProps) => {
  const [format, setFormat] = useState<ExportFormat>("png");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setError(null);
    setIsExporting(true);

    try {
      await downloadWallImage(wall, appearance, format);
      onClose();
    } catch {
      setError("Couldn't export the album wall. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Drawer
      classNames={{
        body: "flex min-h-0 flex-1 flex-col gap-5",
        content: "flex flex-col",
      }}
      onClose={onClose}
      opened={opened}
      padding="lg"
      portalProps={{ target: ".album-wall-app" }}
      position="right"
      size="md"
      title="Export album wall"
      zIndex={400}
    >
      <WallPreview appearance={appearance} state={wall} />
      <Radio.Group
        label="Format"
        onChange={(value) => setFormat(value as ExportFormat)}
        value={format}
      >
        <Group mt="xs">
          <Radio label="PNG" value="png" />
          <Radio label="JPG" value="jpg" />
        </Group>
      </Radio.Group>
      {error ? (
        <p className="m-0 text-[0.8rem] leading-snug wall-text-error" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        autoContrast
        className="mt-auto"
        loading={isExporting}
        onClick={() => {
          void handleExport();
        }}
        type="button"
      >
        Export
      </Button>
    </Drawer>
  );
};
