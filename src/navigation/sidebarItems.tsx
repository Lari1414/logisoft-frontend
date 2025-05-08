import { IconBox, IconClipboardList, IconDashboard, IconDatabase, IconPackage, IconShoppingCart} from "@tabler/icons-react";
import Dashboard from "@/feature/dashboard/Dashboard.tsx";
//import Export from "@/feature/export/Export.tsx";
import Order from "@/feature/order/Order.tsx";
import Lieferant from "@/feature/stammdaten/stammdaten.tsx";
import Rohmateriallager from "@/feature/rohmateriallager/Rohmateriallager.tsx";
import Fertigmateriallager from "@/feature/fertigmateriallager/Fertigmateriallager.tsx";
import Auftrag from "@/feature/auftrag/Auftrag.tsx";


export const NAV_MAIN = [
  {
    title: "Stammdaten",
    url: "/stammdaten",
    icon: IconDatabase,
    element: <Lieferant />,
  },
  {
    title: "Bestellwesen",
    url: "/bestellung",
    icon: IconShoppingCart,
    element: <Order />,
  },
  {
    title: "Rohmateriallager",
    url: "/rohmateriallager",
    icon: IconBox,
    element: <Rohmateriallager />,
  },
  {
    title: "Fertigmateriallager",
    url: "/fertigmateriallager",
    icon: IconPackage,
    element: <Fertigmateriallager />,
  },
  {
    title: "Aufträge",
    url: "/auftraege",
    icon: IconClipboardList,
    element: <Auftrag />,
  },
  {
    title: "Kennzahlen",
    url: "/kennzahlen",
    icon: IconDashboard,
    element: <Dashboard />,
  },
];
