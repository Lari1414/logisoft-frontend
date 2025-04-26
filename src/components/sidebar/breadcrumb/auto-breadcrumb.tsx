import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { Link, useLocation } from "react-router";
import { ChevronRight } from "lucide-react";
import { Row } from "@/common/flex/Flex";
import { useActiveRoute } from "@/navigation/useActiveRoute.ts";

export function AutoBreadcrumb() {
  const location = useLocation();
  const activePath = useActiveRoute();

  const segments = location.pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, idx) => {
    const path = "/" + segments.slice(0, idx + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { label, path };
  });

  return (
    <Breadcrumb>
      <Row gap={1}>
        {breadcrumbs.map((crumb, idx) => {
          const isActive = crumb.path === activePath;
          return (
            <BreadcrumbItem key={crumb.path}>
              <BreadcrumbLink asChild>
                <Link
                  to={crumb.path}
                  className={isActive ? "" : "text-muted-foreground"}
                >
                  {crumb.label}
                </Link>
              </BreadcrumbLink>
              {idx < breadcrumbs.length - 1 && (
                <ChevronRight size={14} className="text-muted-foreground" />
              )}
            </BreadcrumbItem>
          );
        })}
      </Row>
    </Breadcrumb>
  );
}
