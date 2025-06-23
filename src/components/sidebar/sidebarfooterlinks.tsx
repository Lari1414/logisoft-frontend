import { useSidebar } from "@/components/ui/sidebar.tsx";
import { Package, Factory } from "lucide-react"; // oder Tabler-Icons
import {

  SidebarFooter
} from "@/components/ui/sidebar.tsx";
import { IconBuildingWarehouse } from "@tabler/icons-react";

export function SidebarFooterLinks() {
  const { state } = useSidebar(); // collapsed oder expanded

  return (
    <SidebarFooter className="mt-auto w-full">
      {state === "collapsed" ? (
        <div className="flex flex-col items-center gap-4 p-4">
          <a href="https://white-dune-0347c7a03.6.azurestaticapps.net" title="Verkauf & Versand">
            <Package className="size-5" />
          </a>
          <a href="https://frontend-your-shirt-gmbh.vercel.app" title="Produktion">
            <Factory className="size-5" />
          </a>
          <a href="/" title="Materialwirtschaft">
            <IconBuildingWarehouse className="size-5" />
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-1 text-sm w-full">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Abteilung
            <div className="mt-2 h-px w-full bg-gray-200" />
          </div>

          <a
            href="https://white-dune-0347c7a03.6.azurestaticapps.net"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
          >
            <Package className="size-5" />
            <span className="text-gray-800 font-medium">Verkauf & Versand</span>
          </a>

          <a
            href="https://frontend-your-shirt-gmbh.vercel.app"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
          >
            <Factory className="size-5" />
            <span className="text-gray-800 font-medium">Produktion</span>
          </a>

          <a
            href="/"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
          >
            <IconBuildingWarehouse className="size-5" />
            <span className="text-gray-800 font-medium">Materialwirtschaft</span>
          </a>
        </div>

      )}
    </SidebarFooter>
  );
}
