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
              <a href="/kennzahlen">
                {/*<Shirt className="!size-5" /> */}
                <img src="/src/assets/logo.png" alt="Logo" className="w-9 h-9 object-contain mb-1"></img>
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
        < SidebarFooterLinks />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
