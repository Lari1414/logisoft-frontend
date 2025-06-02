import { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { wareneingangApi } from "@/api/endpoints/wareneingangApi.ts";
import { qualitaetApi } from "@/api/endpoints/qualitaetApi.ts";
import { Archive, Lock, Unlock  } from "lucide-react";
import { Eye  } from "react-bootstrap-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface WareneingangData {
 eingang_ID: number; 
  material_ID: number;
  lager_ID: number;
  materialbestellung_ID: number;
  menge: number;
  qualitaet_ID: number;
  status?: string;
  lieferdatum?: string;
  material?: {
    material_ID: number;
    lager_ID: number;
    category: string;
    farbe: string;
    farbe_json?: Record<string, number>;
    typ: string;
    groesse: string;
    url: string | null;
    standardmaterial: boolean;
  };
}

export interface TransformedWareneingang extends WareneingangData {
  id: string;
}

interface WareneingangTableProps {
  onSelectionChange?: (selectedRows: TransformedWareneingang[]) => void;
  setRefetch?: (fn: () => void) => void; // Refetch Funktion an Parent weitergeben
  onEinlagernRow?: (row: TransformedWareneingang) => void;
  onSperrenRow?: (row: TransformedWareneingang) => void;
  onEntsperrenRow?: (row: TransformedWareneingang) => void;
}

const WareneingangTable: React.FC<WareneingangTableProps> = ({ onSelectionChange, setRefetch, onEinlagernRow, onSperrenRow, onEntsperrenRow }) => {
  const { data, isLoading, error, refetch } = wareneingangApi.useGetWareneingangQuery();
  const { data: qualitaeten } = qualitaetApi.useGetQualitaetQuery();
  const [selectedQualitaet, setSelectedQualitaet] = useState<any | null>(null);
  const [isQualitaetDialogOpen, setIsQualitaetDialogOpen] = useState(false);

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
      accessorFn: (row) => row.materialbestellung_ID,
      id: "materialbestellung_ID",
      header: "Bestell-ID",
    },
    {
      accessorFn: (row) => row.material?.category ?? "",
      id: "category",
      header: "Kategorie",
    },
    {
       accessorFn: (row) => row.material?.farbe ?? "",
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
      accessorFn: (row) => row.material?.typ ?? "",
      id: "typ",
      header: "Typ",
    }, 
    {
      accessorFn: (row) => row.material?.groesse ?? "",
      id: "groesse",
      header: "Größe",
    }, 
    {
      accessorFn: (row) => row.menge,
      id: "menge",
      header: "Menge",
    },
    {
      id: "qualitaet",
      header: "Qualität",
      cell: ({ row }) => {
        const qualitaetID = row.original.qualitaet_ID;
        const qualitaet = qualitaeten?.find((q) => q.qualitaet_ID === qualitaetID);

        return (
          <button
            onClick={() => {
              setSelectedQualitaet(qualitaet);
              setIsQualitaetDialogOpen(true);
            }}
            className="text-blue-600 hover:underline"
            title="Qualitätswerte anzeigen"
          >
            <Eye size={18} />
          </button>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;

        let bgColor = "";
        let textColor = "text-white";

        if (status === "gesperrt") {
          bgColor = "bg-red-500";
        } else if (status === "eingetroffen") {
          bgColor = "bg-green-600";
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
    {
      accessorFn: (row) => row.lieferdatum ?? "",
      id: "lieferdatum",
      header: "Lieferdatum",
      cell: ({ row }) => {
        const rawDate = row.original.lieferdatum;
        if (!rawDate) return "";
        const date = new Date(rawDate);
        return date.toLocaleDateString("de-DE");
      },
    },
    {
      id: "aktionen",
      header: "Aktionen",
      cell: ({ row }) => (
        <div className="flex gap-2">
            {row.original.status === "eingetroffen" && (
          <button
            onClick={() => onEinlagernRow?.(row.original)}
            className="p-2 text-green-600 hover:bg-green-100 rounded"
            title="Einlagern"
          >
            <Archive className="w-4 h-4" />
          </button>
            )}
            {row.original.status === "eingetroffen" && (
          <button
            onClick={() => onSperrenRow?.(row.original)}
            className="p-2 text-yellow-600 hover:bg-yellow-100 rounded"
            title="Sperren"
          >
            <Lock className="w-4 h-4" />
          </button>
          )}
          {row.original.status === "gesperrt" && (
        <button
          onClick={() => onEntsperrenRow?.(row.original)}
          className="p-2 text-blue-600 hover:bg-blue-100 rounded"
          title="Entsperren"
        >
        <Unlock className="w-4 h-4" />
        </button>
      )}
        </div>
      ),
    }
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
      <Dialog open={isQualitaetDialogOpen} onOpenChange={setIsQualitaetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Qualitätswerte</DialogTitle>
          </DialogHeader>

          {selectedQualitaet ? (
            <ul className="space-y-1">
              <li><strong>Viskosität:</strong> {selectedQualitaet.viskositaet}</li>
              <li><strong>PPML:</strong> {selectedQualitaet.ppml}</li>
              <li><strong>Saugfähigkeit:</strong> {selectedQualitaet.saugfaehigkeit}</li>
              <li><strong>Weißgrad:</strong> {selectedQualitaet.weissgrad}</li>
            </ul>
          ) : (
            <p>Keine Qualitätsdaten gefunden.</p>
          )}

          <Button onClick={() => setIsQualitaetDialogOpen(false)} className="mt-4">
            Schließen
          </Button>
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default WareneingangTable;
