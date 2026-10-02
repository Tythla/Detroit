import { createBrowserRouter, type RouteObject } from "react-router-dom";

import { Home } from "./home";
import { ThemedLayout } from "./themed-layout";
import { AlbumWall } from "../apps/album-wall/album-wall";

const routes: RouteObject[] = [
  {
    children: [
      {
        element: <Home />,
        index: true,
      },
      {
        element: <AlbumWall />,
        path: "album-wall",
      },
    ],
    element: <ThemedLayout />,
  },
];

export const router = createBrowserRouter(routes);
