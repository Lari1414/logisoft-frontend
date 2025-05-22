import { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { rohmateriallagerApi } from "@/api/endpoints/rohmateriallagerApi";

// Define the type for the transformed data
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
  viskositaet: number;
  ppml: number;
  saugfaehigkeit: number;
  weissgrad: number;
}

// Type for the onSelectionChange function prop
interface RohmateriallagerTableProps {
  onSelectionChange: (selectedRows: TransformedData[]) => void;
  onRefetch?: (refetchFn: () => void) => void;
}

const RohmateriallagerTable = ({ onSelectionChange, onRefetch }: RohmateriallagerTableProps) => {
  const { data, isLoading, error, refetch } = rohmateriallagerApi.useGetRohmaterialQuery();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Transform the data into the correct shape
  const transformedData = useMemo(() => (
    (data || []).map((item) => ({
      id: item.lagerbestand_ID.toString(),
      lagerbestand_ID: item.lagerbestand_ID,
      material_ID: item.material_ID,
      lager_ID: item.lager_ID,
      menge: item.menge,
      category: item.material?.category ?? "",
      farbe: item.material?.farbe ?? "",
      typ: item.material?.typ ?? "",
      groesse: item.material?.groesse ?? "",
      url: item.material?.url ?? "",
      viskositaet: item.qualitaet?.viskositaet ?? 0,
      ppml: item.qualitaet?.ppml ?? 0,
      saugfaehigkeit: item.qualitaet?.saugfaehigkeit ?? 0,
      weissgrad: item.qualitaet?.weissgrad ?? 0,
    }))
  ), [data]);

  useEffect(() => {
    if (onRefetch && refetch) {
      onRefetch(refetch);
    }
  }, [onRefetch, refetch]);
  // Monitor row selection state and filter selected rows
  useEffect(() => {
    const selected = transformedData.filter(row => rowSelection[String(row.id)]);
    onSelectionChange(selected);
  }, [rowSelection, transformedData, onSelectionChange]);

  // ✅ Korrigierte Funktion zur Unterstützung von Updater-Funktion oder Objekt
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
    { accessorKey: "viskositaet", header: "Viskosität" },
    { accessorKey: "ppml", header: "PPML" },
    { accessorKey: "saugfaehigkeit", header: "Saugfähigkeit" },
    { accessorKey: "weissgrad", header: "Weißgrad" },
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

export default RohmateriallagerTable;
