import { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { rohmateriallagerApi } from "@/api/endpoints/rohmateriallagerApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye  } from "react-bootstrap-icons";
import { IoExit } from "react-icons/io5";

// Define the type for the transformed data
export interface TransformedData {
  id: string;
  lagerbestand_ID: number;
  material_ID: number;
  lager_ID: number;
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
  groesse: string | null;
  url: string | null;
  standardmaterial: boolean;
  viskositaet: number;
  ppml: number;
  saugfaehigkeit: number | null;
  weissgrad: number | null;
}

// Type for the onSelectionChange function prop
interface RohmateriallagerTableProps {
  onSelectionChange: (selectedRows: TransformedData[]) => void;
  onRefetch?: (refetchFn: () => void) => void;
  onAuslagernClick?: (row: TransformedData) => void; 
}

const RohmateriallagerTable = ({ onSelectionChange, onRefetch, onAuslagernClick  }: RohmateriallagerTableProps) => {
  const { data, isLoading, error, refetch } = rohmateriallagerApi.useGetRohmaterialQuery();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedQualitaet, setSelectedQualitaet] = useState<TransformedData | null>(null);
  const [isQualitaetDialogOpen, setIsQualitaetDialogOpen] = useState(false);

  // Transform the data into the correct shape
const transformedData = useMemo(() => (
  (data || []).map((item) => {
    // type assertion: material als erweitertes Objekt mit farbe_json
    const material = item.material as {
      material_ID: number;
      lager_ID: number;
      category: string;
      farbe: string;
      farbe_json?: {
        cyan: number;
        magenta: number;
        yellow: number;
        black: number;
      };
      typ: string;
      groesse: string | null;
      url: string | null;
      standardmaterial: boolean;
    };

    return {
      id: item.lagerbestand_ID.toString(),
      lagerbestand_ID: item.lagerbestand_ID,
      material_ID: item.material_ID,
      lager_ID: item.lager_ID,
      menge: item.menge,
      category: material.category ?? "",
      farbe: material.farbe ?? "",
      farbe_json: material.farbe_json ?? { cyan: 0, magenta: 0, yellow: 0, black: 0 },
      typ: material.typ ?? "",
      groesse: material.groesse ?? null,
      url: material.url ?? null,
      standardmaterial: material.standardmaterial ?? false,
      viskositaet: item.qualitaet?.viskositaet ?? 0,
      ppml: item.qualitaet?.ppml ?? 0,
      saugfaehigkeit: item.qualitaet?.saugfaehigkeit ?? null,
      weissgrad: item.qualitaet?.weissgrad ?? null,
    };
  })
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

  // Handle row selection change with support for Updater function or object
  const handleRowSelectionChange = useCallback(
    (updater: Updater<RowSelectionState>) => {
      setRowSelection((prev) =>
        typeof updater === "function" ? updater(prev) : updater
      );
    },
    []
  );

  const openQualitaetDialog = (qualitaet: TransformedData) => {
    setSelectedQualitaet(qualitaet);
    setIsQualitaetDialogOpen(true);
  };

  const closeQualitaetDialog = () => {
    setSelectedQualitaet(null);
    setIsQualitaetDialogOpen(false);
  };

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
                className="w-4 h-4 rounded-full border"
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
        return (
          <a href={url} target="_blank" rel="noopener noreferrer">
            Link
          </a>
        );
      },
    },
    { accessorKey: "menge", header: "Menge" },

    {
      id: "qualitaet-popup",
      header: "Qualitätswerte",
      cell: ({ row }) => (
        <button
          className="text-blue-600 underline"
          onClick={() => openQualitaetDialog(row.original)}
        >
          <Eye  size={20}  />
        </button>
      ),
    },
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
    <>
      <DataTable
        data={transformedData}
        columns={columns}
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
      />

      {/* Qualitätswerte Dialog */}
      <Dialog open={isQualitaetDialogOpen} onOpenChange={setIsQualitaetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Qualitätswerte</DialogTitle>
          </DialogHeader>

          {selectedQualitaet && (
            <ul>
              <li>Viskosität: {selectedQualitaet.viskositaet}</li>
              <li>PPML: {selectedQualitaet.ppml}</li>
              <li>Saugfähigkeit: {selectedQualitaet.saugfaehigkeit}</li>
              <li>Weißgrad: {selectedQualitaet.weissgrad}</li>
            </ul>
          )}

          <Button onClick={closeQualitaetDialog} className="mt-4">
            Schließen
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RohmateriallagerTable;
