import * as React from "react";
import { NavMain } from "@/components/sidebar/nav-main.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar.tsx";
import { NAV_MAIN } from "@/navigation/sidebarItems.tsx";
import { Shirt } from "lucide-react";
//import { NavUser } from "@/components/sidebar/nav-user.tsx";
//import {
  //IconPackage,
 //IconWarehouse ,
//  IconShoppingCart,
 // IconBuildingFactory 
//} from "@tabler/icons-react";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <Shirt className="!size-5" />
                <span className="text-base font-semibold">YourShirt GmbH</span>
              
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={NAV_MAIN} />
        {/*<NavDocuments items={data.documents} />*/}
        {/*<NavSecondary items={data.navSecondary} className="mt-auto" />*/}
      </SidebarContent>
      

<SidebarFooter>
  <div className="flex flex-col gap-1 p-4 text-sm">

    <a
      href="/Verkauf&Versand"
      className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
    >

      <span className="text-gray-800 font-medium">Verkauf & Versand</span>
    </a>
    <a
      href="/Produktion"
      className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
    >
   
      <span className="text-gray-800 font-medium">Produktion</span>
    </a>
        <a
      href="/kennzahlen"
      className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
    >
      
      <span className="text-gray-800 font-medium">Materialwirtschaft</span>
    </a>
  </div>
</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
