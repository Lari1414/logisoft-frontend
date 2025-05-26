import { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { fertigmateriallagerApi } from "@/api/endpoints/fertigmateriallagerApi";
import { Button } from "@/components/ui/button";
import { IoExit } from "react-icons/io5";

// Typ für transformierte Zeile
export interface TransformedData {
  id: string;
  lagerbestand_ID: number;
  material_ID: number;
  lager_ID: number;
  qualitaet_ID: number;
  menge: number;
  category: string;
  farbe: string;
  farbe_json: {
    cyan: number;
    magenta: number;
    yellow: number;
    black: number;
  };
  typ: string;
  groesse: string;
  url: string;
}

interface FertigMateriallagerTableProps {
  onSelectionChange: (selectedRows: TransformedData[]) => void;
  onRefetch?: (refetchFn: () => void) => void;
  onAuslagernClick?: (row: TransformedData) => void; 
}

const FertigMateriallagerTable = ({ onSelectionChange, onRefetch, onAuslagernClick }: FertigMateriallagerTableProps) => {
  const { data, isLoading, error, refetch } = fertigmateriallagerApi.useGetFertigmaterialQuery();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

 const transformedData = useMemo(() => {
  return (data || []).map((item) => ({
    id: item.lagerbestand_ID.toString(),
    lagerbestand_ID: item.lagerbestand_ID,
    material_ID: item.material_ID,
    lager_ID: item.lager_ID,
    qualitaet_ID: item.qualitaet_ID,  // <-- hier hinzufügen
    menge: item.menge,
    category: item.material?.category ?? "",
    farbe: item.material?.farbe ?? "",
    farbe_json: (item.material as any)?.farbe_json ?? { cyan: 0, magenta: 0, yellow: 0, black: 0 },
    typ: item.material?.typ ?? "",
    groesse: item.material?.groesse ?? "",
    url: item.material?.url ?? ""
  }));
}, [data]);

  useEffect(() => {
    if (onRefetch && refetch) {
      onRefetch(refetch);
    }
  }, [onRefetch, refetch]);

  useEffect(() => {
    const selected = transformedData.filter(row => rowSelection[String(row.id)]);
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

  const columns: ColumnDef<TransformedData>[] = [
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
    { accessorKey: "lagerbestand_ID", header: "Lagerbestand-ID" },
    { accessorKey: "material_ID", header: "Material-ID" },
    { accessorKey: "category", header: "Kategorie" },
    {
      accessorKey: "farbe",
      header: "Farbe",
      cell: ({ getValue }) => {
        const color = getValue() as string;
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full border"
              style={{ backgroundColor: color }}
            />
            <span>{color}</span>
          </div>
        );
      },
    },
    { accessorKey: "typ", header: "Typ" },
    { accessorKey: "groesse", header: "Größe" },
    {
      accessorKey: "url",
      header: "URL",
      cell: ({ getValue }) => {
        const url = getValue() as string;
        return url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            Link
          </a>
        ) : (
          "-"
        );
      },
    },
    { accessorKey: "menge", header: "Menge" },
     {
      id: "auslagern",
      header: "Aktion",
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            if (onAuslagernClick) onAuslagernClick(row.original);
          }}
        >
         <IoExit className="h-5 w-5" />
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

export default FertigMateriallagerTable;
