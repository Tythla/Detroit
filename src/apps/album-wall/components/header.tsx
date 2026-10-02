import { ActionIcon, AppShell, Tooltip } from "@mantine/core";
import { MdOutlineFileDownload } from "react-icons/md";

type HeaderProps = {
  exportOpened?: boolean;
  onExportClick: () => void;
};

export const Header = ({ exportOpened = false, onExportClick }: HeaderProps) => (
  <AppShell.Header className="flex flex-row items-center justify-between px-4 py-2">
    <p className="wall-eyebrow">Album Wall</p>
    <Tooltip
      disabled={exportOpened}
      label="Export album wall"
    >
      <ActionIcon
        aria-label="Export album wall"
        autoContrast
        onClick={(event) => {
          event.currentTarget.blur();
          onExportClick();
        }}
        size="lg"
        type="button"
      >
        <MdOutlineFileDownload />
      </ActionIcon>
    </Tooltip>
  </AppShell.Header>
);
