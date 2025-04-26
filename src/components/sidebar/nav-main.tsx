import { type Icon } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar.tsx";
import { Link, useLocation } from "react-router";
import { Row } from "@/common/flex/Flex.tsx";
import { useIsMobile } from "@/hooks/use-mobile.ts";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { toggleSidebar, state } = useSidebar();

  return (
    <SidebarGroup className={"p-0"}>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className={"gap-2"}>
          {items.map((item) => {
            const isActive = location.pathname.startsWith(item.url);
            return (
              <SidebarMenuItem
                key={item.title}
                className={cn(state === "collapsed" && "mx-auto")}
              >
                <Link
                  to={item.url}
                  onClick={() => {
                    if (isMobile) toggleSidebar();
                  }}
                >
                  <SidebarMenuButton
                    tooltip={item.title}
                    variant={isActive ? "outline" : "default"}
                    className={cn(
                      "text-muted-foreground w-full justify-start " + "",
                      isActive && "text-primary",
                    )}
                  >
                    {state === "collapsed" ? (
                      item.icon && <item.icon />
                    ) : (
                      <Row gap={2}>
                        {item.icon && <item.icon className={"!size-5"} />}
                        <AnimatePresence initial={false} mode="wait">
                          {state === "expanded" && (
                            <motion.span
                              key="title"
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -8 }}
                              transition={{ duration: 0.2 }}
                            >
                              {item.title}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Row>
                    )}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
