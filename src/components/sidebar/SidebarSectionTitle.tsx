import { useSidebar } from "@/components/ui/sidebar.tsx";

export function SidebarSectionTitle({ title }: { title: string }) {
  const { state } = useSidebar();

  if (state === "collapsed") {
    return (
      <div className="flex justify-center px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">

      </div>
    );
  }

  return (
    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
      {title}
      <div className="mt-2 h-px w-full bg-gray-200" />
    </div>
  );
}
