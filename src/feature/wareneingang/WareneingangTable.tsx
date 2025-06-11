import { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { wareneingangApi } from "@/api/endpoints/wareneingangApi.ts";
import { qualitaetApi } from "@/api/endpoints/qualitaetApi.ts";
import { Archive, Lock, Unlock } from "lucide-react";
import { Eye } from "react-bootstrap-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const { data: qualitaeten, isLoading: isQualitaetLoading } = qualitaetApi.useGetQualitaetQuery();
  const [selectedQualitaet, setSelectedQualitaet] = useState<any | null>(null);
  const [isQualitaetDialogOpen, setIsQualitaetDialogOpen] = useState(false);
  const [createReklamation] = wareneingangApi.useCreateReklamationMutation();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [, setSelectedRows] = useState<TransformedWareneingang[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const transformedData = useMemo(() => {
    return (data || []).map((item) => ({
      ...item,
      id: item.eingang_ID.toString(),
    })) as TransformedWareneingang[];
  }, [data]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return transformedData.filter((row) =>
      row.material?.category?.toLowerCase().includes(term) ||
      row.material?.farbe?.toLowerCase().includes(term) ||
      row.material?.typ?.toLowerCase().includes(term) ||
      row.material?.groesse?.toLowerCase().includes(term) ||
      row.eingang_ID.toString().includes(term) ||
      row.materialbestellung_ID.toString().includes(term)
    );
  }, [searchTerm, transformedData]);


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
            <>
              <button
                onClick={() => onEinlagernRow?.(row.original)}
                className="p-2 text-green-600 hover:bg-green-100 rounded"
                title="Einlagern"
              >
                <Archive className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSperrenRow?.(row.original)}
                className="p-2 text-yellow-600 hover:bg-yellow-100 rounded"
                title="Sperren"
              >
                <Lock className="w-4 h-4" />
              </button>
            </>
          )}

          {row.original.status === "gesperrt" && (
            <>
              <button
                onClick={() => onEntsperrenRow?.(row.original)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                title="Entsperren"
              >
                <Unlock className="w-4 h-4" />
              </button>
              <button
                onClick={async () => {
                  try {
                    await createReklamation({
                      wareneingang_ID: row.original.eingang_ID,
                      menge: row.original.menge,
                    }).unwrap(); // unwrap gibt dir Zugriff auf das Ergebnis oder wirft im Fehlerfall

                    refetch(); // Tabelle neu laden
                  } catch (error) {
                    console.error("Reklamation fehlgeschlagen:", error);
                    // Optional: Zeige eine Fehlermeldung
                  }
                }}
                className="p-2 text-red-600 hover:bg-red-100 rounded"
                title="Reklamieren"
              >
                ❗
              </button>
            </>
          )}
        </div>
      ),
    }

  ];

  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Daten.</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-40 focus:w-72 transition-all duration-300 ease-in-out px-2 py-1 text-sm focus:shadow-md"
        />

        <DataTable<TransformedWareneingang>
          data={filteredData}
          columns={columns}
          rowSelection={rowSelection}
          onRowSelectionChange={handleRowSelectionChange}
        />
      </div>
      <Dialog open={isQualitaetDialogOpen} onOpenChange={setIsQualitaetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Qualitätswerte</DialogTitle>
          </DialogHeader>

          {isQualitaetLoading ? (
            <p>Lädt Qualitätsdaten...</p>
          ) : selectedQualitaet ? (
            <ul className="space-y-1">
              <li><strong>Viskosität:</strong> {selectedQualitaet.viskositaet}</li>
              <li><strong>PPML:</strong> {selectedQualitaet.ppml}</li>
              <li><strong>Saugfähigkeit:</strong> {selectedQualitaet.saugfaehigkeit}</li>
              <li><strong>Weißgrad:</strong> {selectedQualitaet.weissgrad}</li>
              <li><strong>DeltaE:</strong> {selectedQualitaet.deltaE}</li>
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
