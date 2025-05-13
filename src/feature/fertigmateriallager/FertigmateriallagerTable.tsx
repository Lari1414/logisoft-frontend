import { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { fertigmateriallagerApi } from "@/api/endpoints/fertigmateriallagerApi";

// Typ für transformierte Zeile
export interface TransformedData {
  id: string;
  lagerbestand_ID: number;
  material_ID: number;
  lager_ID: number;
  menge: number;
  category: string;
  farbe: string;
  typ: string;
  groesse: string;
  url: string;
}

interface FertigMateriallagerTableProps {
  onSelectionChange: (selectedRows: TransformedData[]) => void;
}

const FertigMateriallagerTable = ({ onSelectionChange }: FertigMateriallagerTableProps) => {
  const { data, isLoading, error } = fertigmateriallagerApi.useGetFertigmaterialQuery();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const transformedData = useMemo(() => {
    return (data || []).map((item) => ({
      id: item.lagerbestand_ID.toString(),
      lagerbestand_ID: item.lagerbestand_ID,
      material_ID: item.material_ID,
      lager_ID: item.lager_ID,
      menge: item.menge,
      category: item.material?.category ?? "",
      farbe: item.material?.farbe ?? "",
      typ: item.material?.typ ?? "",
      groesse: item.material?.groesse ?? "",
      url: item.material?.url ?? ""
    }));
  }, [data]);

  useEffect(() => {
    const selected = transformedData.filter(row => rowSelection[String(row.id)]);
    onSelectionChange(selected);
  }, [rowSelection, transformedData, onSelectionChange]);

  // ✅ Korrekt typisierte Handler-Funktion
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
    { accessorKey: "farbe", header: "Farbe" },
    { accessorKey: "typ", header: "Typ" },
    { accessorKey: "groesse", header: "Größe" },
    {
      accessorKey: "url",
      header: "URL",
      cell: ({ getValue }) => {
        const url = getValue() as string;
        return (
          <a href={url} target="_blank" rel="noopener noreferrer">
            Link
          </a>
        );
      },
    },
    { accessorKey: "menge", header: "Menge" },
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
