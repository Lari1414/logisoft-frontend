import { IconClipboardList, IconDashboard, IconDatabase, IconPackage, IconShoppingCart} from "@tabler/icons-react";
import Dashboard from "@/feature/dashboard/Dashboard.tsx";
import Order from "@/feature/order/Order.tsx";
import Lieferant from "@/feature/stammdaten/Stammdaten.tsx";
import Fertigmateriallager from "@/feature/fertigmateriallager/Fertigmateriallager.tsx";
import Auftrag from "@/feature/auftrag/Auftrag.tsx";
import RohMateriallager from "@/feature/rohmateriallager/Rohmateriallager.tsx";
import Wareneingang from "@/feature/wareneingang/Wareneingang";

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
    title: "Wareneingang",
    url: "/wareneingang",
    icon: IconDatabase,
    element: <Wareneingang />,
  },
  {
   title: "Rohmateriallager",
    url: "/rohmateriallager",
    icon: IconPackage,
    element: <RohMateriallager />,
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
