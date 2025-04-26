import { SidebarProvider } from "@/components/ui/sidebar.tsx";
import { ThemeProvider } from "@/components/dark/theme-provider.tsx";
import React from "react";
import { useScreenDimensions } from "@/hooks/screenWidth.ts";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [w] = useScreenDimensions();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider defaultOpen={w < 1024}>{children}</SidebarProvider>
    </ThemeProvider>
  );
};

export default Providers;
