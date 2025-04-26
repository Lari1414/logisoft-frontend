import { AppSidebar } from "@/components/sidebar/app-sidebar.tsx";
import { SidebarInset } from "@/components/ui/sidebar.tsx";
import { SiteHeader } from "@/components/sidebar/site-header.tsx";
import Providers from "@/common/Providers.tsx";
import { Outlet } from "react-router";

const DefaultLayout = () => {
  return (
    <Providers>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </Providers>
  );
};

export default DefaultLayout;
