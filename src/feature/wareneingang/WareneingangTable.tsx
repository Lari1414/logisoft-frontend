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
  onSelectionChange: (selectedRows: TransformedWareneingang[]) => void;
}

const WareneingangTable = ({ onSelectionChange }: WareneingangTableProps) => {
  const { data, isLoading, error } = wareneingangApi.useGetWareneingangQuery();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const transformedData = useMemo(
    () =>
      (data || []).map((item) => ({
        ...item,
        id: item.eingang_ID.toString(),
      })),
    [data]
  );

  useEffect(() => {
    const selected = transformedData.filter((row) => rowSelection[row.id]);
    onSelectionChange(selected);
  }, [rowSelection, transformedData, onSelectionChange]);

  const handleRowSelectionChange = useCallback(
    (updater: Updater<RowSelectionState>) => {
      setRowSelection((prev) =>
        typeof updater === "function" ? updater(prev) : updater
      );
    },
    []
  );

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
      accessorFn: row => row.material_ID,
      id: "material_ID",
      header: "Material-ID",
    },
    {
      accessorFn: row => row.materialbestellung_ID,
      id: "materialbestellung_ID",
      header: "Bestell-ID",
    },
    {
      accessorFn: row => row.menge,
      id: "menge",
      header: "Menge",
    },
    {
      accessorFn: row => row.status ?? "",
      id: "status",
      header: "Status",
    },
    {
      accessorFn: row => row.lieferdatum ?? "",
      id: "lieferdatum",
      header: "Lieferdatum",
    },
  ];

  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Daten.</div>;

  return (
    <DataTable<TransformedWareneingang>
      data={transformedData}
      columns={columns}
      rowSelection={rowSelection}
      onRowSelectionChange={handleRowSelectionChange}
    />
  );
};

export default WareneingangTable;
