import { AppShell } from "@mantine/core";
import { MdOutlineFileDownload } from "react-icons/md";

export const Header = () => {
  return (
    <AppShell.Header className="flex flex-row justify-between px-4 py-2">
      <p className="wall-eyebrow">Album Wall</p>
      <div>
        <button className="wall-btn-accent">
          <MdOutlineFileDownload/>
        </button>
      </div>
    </AppShell.Header>
  )
}