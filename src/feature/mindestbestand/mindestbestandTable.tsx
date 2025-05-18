import { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { mindestbestandApi } from "@/api/endpoints/mindestbestandApi";
import { Mindestbestand } from "@/models/mindestbestand";

interface MindestbestandTableProps {
  onSelectionChange?: (selectedRows: (Mindestbestand & { id: string })[]) => void;
}

const MindestbestandTable: React.FC<MindestbestandTableProps> = ({ onSelectionChange }) => {
  const { data, isLoading, error } = mindestbestandApi.useGetMindestbestaendeQuery();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [, setSelectedRows] = useState<(Mindestbestand & { id: string })[]>([]);

  const transformedData = useMemo(() => {
    return (data || []).map((item) => ({
      ...item,
      id: item.mindestbestand_ID.toString(), // Für RowSelection erforderlich
    }));
  }, [data]);

  const columns: ColumnDef<Mindestbestand & { id: string }>[] = [
    /*{
      id: "select",
      header: () => null,
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={() => row.toggleSelected()}
        />
      ),
    },*/
    {
      accessorKey: "mindestbestand_ID",
      header: "ID",
    },
    {
      accessorKey: "material_ID",
      header: "Material-ID",
    },
    {
      accessorKey: "mindestbestand",
      header: "Mindestbestand",
    },
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
    setSelectedRows(selected);
    onSelectionChange?.(selected);
  }, [rowSelection, transformedData, onSelectionChange]);

  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Mindestbestände.</div>;

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

export default MindestbestandTable;
