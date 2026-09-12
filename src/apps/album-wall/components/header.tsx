import { ActionIcon, AppShell, Tooltip } from "@mantine/core";
import { MdOutlineFileDownload } from "react-icons/md";

export const Header = () => (
  <AppShell.Header className="flex flex-row items-center justify-between px-4 py-2">
    <p className="wall-eyebrow">Album Wall</p>
    <Tooltip label="Export album wall">
      <ActionIcon
        aria-label="Export album wall"
        autoContrast
        size="lg"
        type="button"
      >
        <MdOutlineFileDownload />
      </ActionIcon>
    </Tooltip>
  </AppShell.Header>
);
