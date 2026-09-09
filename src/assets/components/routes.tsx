import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { Home } from "./home";

const routes: RouteObject[] = [
    {
        path: '/',
        element: <Home/>
    }
]

export const router = createBrowserRouter(routes);