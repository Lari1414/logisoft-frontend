import { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { wareneingangApi } from "@/api/endpoints/wareneingangApi";

export interface WareneingangData {
  eingang_ID: number; 
  material_ID: number;
  lager_ID: number;
  materialbestellung_ID: number;
  menge: number;
  qualitaet_ID: number;
  category: string;
  farbe: string;
  typ: string;
  groesse: string;
  url: string;
  status?: string;
  lieferdatum?: string;
}

export interface TransformedWareneingang extends WareneingangData {
  id: string;
}

interface WareneingangTableProps {
  onSelectionChange?: (selectedRows: TransformedWareneingang[]) => void;
  setRefetch?: (fn: () => void) => void; // Refetch Funktion an Parent weitergeben
}

const WareneingangTable: React.FC<WareneingangTableProps> = ({ onSelectionChange, setRefetch }) => {
  const { data, isLoading, error, refetch } = wareneingangApi.useGetWareneingangQuery();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [, setSelectedRows] = useState<TransformedWareneingang[]>([]);

  const transformedData = useMemo(() => {
    return (data || []).map((item) => ({
      ...item,
      id: item.eingang_ID.toString(),
    }));
  }, [data]);

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
    setSelectedRows(selected);
    onSelectionChange?.(selected);
  }, [rowSelection, transformedData, onSelectionChange]);

  useEffect(() => {
    if (setRefetch) {
      setRefetch(() => refetch);
    }
  }, [refetch, setRefetch]);

  const columns: ColumnDef<TransformedWareneingang>[] = [
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
    {
      accessorFn: (row) => row.eingang_ID,
      id: "eingang_ID",
      header: "Eingang-ID",
    },
    {
      accessorFn: (row) => row.material_ID,
      id: "material_ID",
      header: "Material-ID",
    },
    {
      accessorFn: (row) => row.materialbestellung_ID,
      id: "materialbestellung_ID",
      header: "Bestell-ID",
    },
    {
      accessorFn: (row) => row.menge,
      id: "menge",
      header: "Menge",
    },
    {
      accessorFn: (row) => row.status ?? "",
      id: "status",
      header: "Status",
    },
    {
      accessorFn: (row) => row.lieferdatum ?? "",
      id: "lieferdatum",
      header: "Lieferdatum",
    },
  ];

  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Daten.</div>;

  return (
    <div className="space-y-4">
      <DataTable<TransformedWareneingang>
        data={transformedData}
        columns={columns}
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
      />
    </div>
  );
};

export default WareneingangTable;
