import { useLocation } from "react-router";

export function useActiveRoute() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  return "/" + segments.join("/");
}
