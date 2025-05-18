import { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { auftragApi } from "@/api/endpoints/auftragApi";
import { Auftrag } from "@/models/auftrag";

// Zusätzlicher Typ für die transformierten Daten
export interface TransformedAuftrag extends Auftrag {
  id: string; // required by react-table
}

// Props für Übergabe der ausgewählten Zeilen
interface AuftragTableProps {
  onSelectionChange: (selectedRows: TransformedAuftrag[]) => void;
}

const AuftragTable = ({ onSelectionChange }: AuftragTableProps) => {
  const { data, isLoading, error } = auftragApi.useGetAuftragQuery();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const transformedData: TransformedAuftrag[] = useMemo(() => {
  const seen = new Set<number>();
  return (data || []).filter((item) => {
    if (seen.has(item.auftrag_ID)) return false;
    seen.add(item.auftrag_ID);
    return true;
  }).map((item: Auftrag) => ({
    ...item,
    id: item.auftrag_ID.toString(),
  }));
}, [data]);

  // Auswahländerungen weiterreichen
  useEffect(() => {
    const selected = transformedData.filter(row => rowSelection[row.id]);
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

  const columns: ColumnDef<TransformedAuftrag>[] = [
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
    { accessorKey: "auftrag_ID", header: "Auftrag-ID" },
    { accessorKey: "material_ID", header: "Material-ID" },
    { accessorKey: "menge", header: "Menge" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "lagerbestand_ID", header: "Lagerbestand-ID" },
    { accessorKey: "bestellposition", header: "Bestellposition" },
    { accessorKey: "angefordertVon", header: "Angefordert Von" },
  ];

  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Daten.</div>;

  return (
    <DataTable
      data={transformedData}
      columns={columns}
      rowSelection={rowSelection}
      onRowSelectionChange={handleRowSelectionChange}
    />
  );
};

export default AuftragTable;
