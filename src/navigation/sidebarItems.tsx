import { IconDashboard, IconDownload, IconTable } from "@tabler/icons-react";
import Dashboard from "@/feature/dashboard/Dashboard.tsx";
import Export from "@/feature/export/Export.tsx";
import Order from "@/feature/order/Order.tsx";

export const NAV_MAIN = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
    element: <Dashboard />,
  },
  {
    title: "Bestellung",
    url: "/bestellung",
    icon: IconTable,
    element: <Order />,
  },
  {
    title: "Export / Import",
    url: "/export",
    icon: IconDownload,
    element: <Export />,
  },
];
