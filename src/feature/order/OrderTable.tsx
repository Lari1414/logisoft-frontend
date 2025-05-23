import { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { orderApi } from "@/api/endpoints/orderApi";
import { Order } from "@/models/order";

interface OrderTableProps {
  onSelectionChange?: (selectedRows: (Order & { id: string })[]) => void;
  setRefetch?: (fn: () => void) => void; // NEU: Funktion zum Weitergeben von refetch
}

const OrderTable: React.FC<OrderTableProps> = ({ onSelectionChange, setRefetch }) => {
  const { data, isLoading, error, refetch } = orderApi.useGetOrdersQuery();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [, setSelectedOrders] = useState<(Order & { id: string })[]>([]);

  const transformedData = useMemo(() => {
    return (data || []).map((item) => ({
      ...item,
      id: item.materialbestellung_ID.toString(),
    }));
  }, [data]);

  const columns: ColumnDef<Order & { id: string }>[] = [
    {
      id: "select",
      header: () => null,
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={() => row.toggleSelected()}
        />
      ),
    },
    { accessorKey: "materialbestellung_ID", header: "Materialbestellung-ID" },
    { accessorKey: "material.material_ID", header: "Materialnummer" },
    { accessorKey: "lieferant.lieferant_ID", header: "Lieferantennummer" },
    { accessorKey: "menge", header: "Menge" },
    { accessorKey: "status", header: "Status" },
  ];

  const handleRowSelectionChange = useCallback(
    (updater: Updater<RowSelectionState>) => {
      setRowSelection((prev) =>
        typeof updater === "function" ? updater(prev) : updater
      );
    },
    []
  );

  useEffect(() => {
    const selected = transformedData.filter((row) => rowSelection[row.id]);
    setSelectedOrders(selected);
    onSelectionChange?.(selected);
  }, [rowSelection, transformedData, onSelectionChange]);

  // NEU: refetch-Funktion an Parent weitergeben
  useEffect(() => {
    if (setRefetch) {
      setRefetch(() => refetch);
    }
  }, [refetch, setRefetch]);

  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Daten.</div>;

  return (
    <div className="space-y-4">
      <DataTable
        data={transformedData}
        columns={columns}
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
      />
    </div>
  );
};

export default OrderTable;
