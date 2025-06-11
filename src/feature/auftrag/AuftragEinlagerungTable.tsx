import { useEffect, useState, useCallback } from "react";
import { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { auftragApi } from "@/api/endpoints/auftragApi";
import { Auftrag } from "@/models/auftrag";
import {TransformedAuftrag} from "./AuftragTable.tsx";


type Props = {
  onSelectionChange?: (rows: TransformedAuftrag[]) => void;
  onRefetch?: (fn: () => void) => void;
};

const AuftragEinlagerungTable = ({ onSelectionChange, onRefetch }: Props) => {
  const { data, isLoading, error, refetch } = auftragApi.useGetEinlagerungsAuftraegeQuery();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  /*const transformedData: TransformedAuftrag[] = (data || []).map((item: Auftrag) => ({
    ...item,
    id: item.auftrag_ID.toString(),
  }));*/
  const transformedData: TransformedAuftrag[] = (data || []).map((item: Auftrag) => ({
    ...item,
    id: item.auftrag_ID.toString(),
    category: "",  // oder passende Daten, wenn du Material-Infos dort auch hast
    farbe: "",
    typ: "",
    groesse: "",
  }));


  useEffect(() => {
    if (onRefetch) {
      onRefetch(refetch);
    }
  }, [refetch, onRefetch]);

  const handleRowSelectionChange = useCallback(
    (updater: Updater<RowSelectionState>) => {
      setRowSelection((prev) => {
        const newState = typeof updater === "function" ? updater(prev) : updater;

        if (onSelectionChange) {
          const selectedRows = Object.keys(newState)
            .filter((key) => newState[key])
            .map((key) => transformedData.find((row) => row.id === key))
            .filter(Boolean) as TransformedAuftrag[];

          onSelectionChange(selectedRows);
        }

        return newState;
      });
    },
    [transformedData, onSelectionChange]
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
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => (
        <span className="px-2 py-1 rounded bg-yellow-400 text-black">
          {getValue() as string}
        </span>
      ),
    },
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

export default AuftragEinlagerungTable;
