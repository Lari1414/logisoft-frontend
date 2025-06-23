import { useSidebar } from "@/components/ui/sidebar.tsx";
import { Package, Factory } from "lucide-react"; // oder Tabler-Icons
import {

  SidebarFooter
} from "@/components/ui/sidebar.tsx";
import { IconBuildingWarehouse } from "@tabler/icons-react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";

export function SidebarFooterLinks() {
  const { state } = useSidebar(); // collapsed oder expanded
  const location = useLocation();
  const isMaterialwirtschaft = location.pathname === "/kennzahlen";

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
          <Link to="/" title="Materialwirtschaft">
            <IconBuildingWarehouse
              className={cn(
                "size-5",
                isMaterialwirtschaft && "text-primary"
              )}
            />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-1 text-sm w-full">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Abteilung
            <div className="mt-2 h-px w-full bg-gray-200" />
          </div>

          <a
            href="https://white-dune-0347c7a03.6.azurestaticapps.net"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-[--muted] text-[--sidebar-foreground]"
          >
            <Package className="size-5" />
            <span className="font-medium">Verkauf & Versand</span>
          </a>

          <a
            href="https://frontend-your-shirt-gmbh.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-[--muted] text-[--sidebar-foreground]"
          >
            <Factory className="size-5" />
            <span className="font-medium">Produktion</span>
          </a>

          <Link
            to="/"
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 transition-colors",
              isMaterialwirtschaft
                ? "bg-[--primary] text-[--primary-foreground] font-semibold"
                : "hover:bg-[--muted] text-[--sidebar-foreground]"
            )}
          >
            <IconBuildingWarehouse className="size-5" />
            <span className="font-medium">Materialwirtschaft</span>
          </Link>
        </div>

      )}
    </SidebarFooter>
  );
}
