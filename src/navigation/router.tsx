import DefaultLayout from "@/components/layout/DefaultLayout";
import { NAV_MAIN } from "@/navigation/sidebarItems.tsx";
import { createBrowserRouter, Navigate } from "react-router";

export const router = createBrowserRouter([
  {
    element: <DefaultLayout />,
    path: "/",
    children: [
      ...NAV_MAIN.map((item) => ({
        path: item.url,
        element: item.element,
      })),
      {
        path: "/",
        element: <Navigate to={"/kennzahlen"} />,
      },
      {
        path: "*",
        element: <>Not found</>,
      },
    ],
  },
]);
