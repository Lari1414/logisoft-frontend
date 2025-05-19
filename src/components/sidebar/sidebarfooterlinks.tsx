import { useSidebar } from "@/components/ui/sidebar.tsx";
import { Package, Factory, Boxes } from "lucide-react"; // oder Tabler-Icons
import {

  SidebarFooter
} from "@/components/ui/sidebar.tsx";

export function SidebarFooterLinks() {
  const { state } = useSidebar(); // collapsed oder expanded

  return (
    <SidebarFooter className="mt-auto">
      {state === "collapsed" ? (
        <div className="flex flex-col items-center gap-4 p-4">
          <a href="/Verkauf&Versand" title="Verkauf & Versand">
            <Package className="size-5" />
          </a>
          <a href="/Produktion" title="Produktion">
            <Factory className="size-5" />
          </a>
          <a href="/kennzahlen" title="Materialwirtschaft">
            <Boxes className="size-5" />
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-1 p-4 text-sm">
          
          <a
            href="/Verkauf&Versand"
            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
          >
               <Package className="size-5" />
            <span className="text-gray-800 font-medium">Verkauf & Versand</span>
          </a>
          <a
            href="/Produktion"
            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
          >
            <Factory className="size-5" />
            <span className="text-gray-800 font-medium">Produktion</span>
          </a>

           <a
            href="/kennzahlen"
            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
          >
                 <Boxes className="size-5" />
            <span className="text-gray-800 font-medium">Materialwirtschaft</span>
          </a>
       
        </div>
      )}
    </SidebarFooter>
  );
}
