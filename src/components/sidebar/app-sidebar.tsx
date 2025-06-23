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
//import { Shirt } from "lucide-react";
import { SidebarFooterLinks } from "@/components/sidebar/sidebarfooterlinks.tsx";
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
              <a href="/">
                {/*<Shirt className="!size-5" /> */}
                <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain mb-1"></img>
                <span className="text-base font-semibold">YourShirt GmbH</span>

              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Funktionen
          <div className="mt-2 h-px w-full bg-gray-200" />
        </div>
        <NavMain items={NAV_MAIN} />
        {/*<NavDocuments items={data.documents} />*/}
        {/*<NavSecondary items={data.navSecondary} className="mt-auto" />*/}
      </SidebarContent>

      <SidebarFooter>
        < SidebarFooterLinks />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
