import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { Home } from "./home";
import { AlbumWall } from "../apps/album-wall/album-wall";

const routes: RouteObject[] = [
    {
        path: '/',
        element: <Home/>
    },
    {
        path: 'album-wall',
        element: <AlbumWall/>
    }
]

export const router = createBrowserRouter(routes);