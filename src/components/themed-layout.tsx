import { createTheme, MantineProvider } from "@mantine/core";
import { Outlet, useLocation } from "react-router-dom";

import { albumWallTheme } from "../apps/album-wall/theme";

const websiteTheme = createTheme({});

export const ThemedLayout = () => {
  const { pathname } = useLocation();
  const theme = pathname.startsWith("/album-wall")
    ? albumWallTheme
    : websiteTheme;

  return (
    <MantineProvider theme={theme}>
      <Outlet />
    </MantineProvider>
  );
};
