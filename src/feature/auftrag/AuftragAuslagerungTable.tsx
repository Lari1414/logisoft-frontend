import { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { auftragApi } from "@/api/endpoints/auftragApi";
import { Auftrag } from "@/models/auftrag";
import { materialApi } from "@/api/endpoints/materialApi";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

// Zusätzlicher Typ für die transformierten Daten
export interface TransformedAuftrag extends Auftrag {
  id: string;
  category: string;
  farbe: string;
  typ: string;
  groesse: string;
}

// Props für Übergabe der ausgewählten Zeilen
interface AuftragTableProps {
  onSelectionChange: (selectedRows: TransformedAuftrag[]) => void;
  onRefetch?: (refetchFn: () => void) => void;
  onExecuteSingle?: (auftrag: TransformedAuftrag) => void;
}

const AuftragAuslagerungTable = ({ onSelectionChange, onRefetch, onExecuteSingle }: AuftragTableProps) => {
  const { data, isLoading, error, refetch } = auftragApi.useGetAuslagerungsAuftraegeQuery();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { data: materialsData } = materialApi.useGetMaterialQuery();

  const transformedData: TransformedAuftrag[] = useMemo(() => {
    if (!data || !materialsData) return [];

    const seen = new Set<number>();

    return data
      .filter((item) => {
        if (seen.has(item.auftrag_ID)) return false;
        seen.add(item.auftrag_ID);
        return true;
      })
      .map((item: Auftrag) => {
        const material = materialsData.find((m) => m.material_ID === item.material_ID);

        return {
          ...item,
          id: item.auftrag_ID.toString(),
          category: material?.category ?? "",
          farbe: material?.farbe ?? "",
          typ: material?.typ ?? "",
          groesse: material?.groesse ?? "",
        };
      });
  }, [data, materialsData]);


  // Auswahländerungen weiterreichen
  useEffect(() => {
    const selected = transformedData.filter(row => rowSelection[row.id]);
    onSelectionChange(selected);
  }, [rowSelection, transformedData, onSelectionChange]);

  useEffect(() => {
    if (onRefetch && refetch) {
      onRefetch(refetch);
    }
  }, [onRefetch, refetch]);

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
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: "auftrag_ID", header: "Auftrag-ID" },
    { accessorKey: "material_ID", header: "Material-ID" },
    {
      accessorFn: (row) => row.category,
      id: "category",
      header: "Kategorie",
    },
    {
      accessorKey: "farbe",
      header: "Farbe",
      cell: ({ getValue }) => {
        const color = getValue() as string;
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: color }}
            />
            <span>{color}</span>
          </div>
        );
      },
    },
    {
      accessorFn: (row) => row.typ,
      id: "typ",
      header: "Typ",
    },
    {
      accessorFn: (row) => row.groesse,
      id: "groesse",
      header: "Größe",
    },
    { accessorKey: "menge", header: "Menge" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;

        let bgColor = "";
        let textColor = "text-white";

        if (status === "auslagerung angefordert") {
          bgColor = "bg-yellow-500";
        } else if (status === "einlagerung angefordert") {
          bgColor = "bg-blue-400";
        } else {
          bgColor = "bg-gray-400";
        }

        return (
          <span className={`px-2 py-1 rounded ${bgColor} ${textColor}`}>
            {status}
          </span>
        );
      },
    },
    { accessorKey: "lagerbestand_ID", header: "Lagerbestand-ID" },
    { accessorKey: "bestellposition", header: "Bestellposition" },
    { accessorKey: "angefordertVon", header: "Angefordert Von" },
    {
      id: "actions",
      header: "Aktion",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          title="Ausführen"
          className="flex items-center hover:bg-blue-100 gap-2"
          onClick={() => {
            if (onExecuteSingle) {
              onExecuteSingle(row.original);
            }
          }}
        >
          <Play className="w-4 h-4" />
        </Button>
      ),
    },
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

export default AuftragAuslagerungTable;




