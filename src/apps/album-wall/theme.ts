import { createTheme, type MantineColorsTuple } from "@mantine/core";

const albumWallColors: MantineColorsTuple = [
  "#fff8e1",
  "#ffefcb",
  "#ffdd9a",
  "#ffca64",
  "#ffba38",
  "#ffb01b",
  "#ffa903",
  "#e39500",
  "#cb8400",
  "#b07100",
];

export const albumWallTheme = createTheme({
  autoContrast: true,
  colors: {
    albumWall: albumWallColors,
  },
  primaryColor: "albumWall",
  primaryShade: 6,
});
