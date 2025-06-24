import { useState, useMemo, useCallback } from "react";
import { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { rohmateriallagerApi } from "@/api/endpoints/rohmateriallagerApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "react-bootstrap-icons";


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
  deltaE: number;
}



const StandardRohmaterialTable = () => {
  const { data, isLoading, error} = rohmateriallagerApi.useGetRohmaterialQuery();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedQualitaet, setSelectedQualitaet] = useState<TransformedData | null>(null);
  const [isQualitaetDialogOpen, setIsQualitaetDialogOpen] = useState(false);
  const [searchTerm] = useState("");



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
        deltaE: item.qualitaet?.deltaE ?? 0
      };
    })
      .filter((item) => item.standardmaterial)
  ), [data]);

  const filteredData = useMemo(() => {
    return transformedData.filter((row) => {
      const term = searchTerm.toLowerCase();
      return (
        row.category.toLowerCase().includes(term) ||
        row.farbe.toLowerCase().includes(term) ||
        row.typ.toLowerCase().includes(term) ||
        (row.groesse?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [searchTerm, transformedData]);






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
    { accessorKey: "url", header: "Url" },
    { accessorKey: "menge", header: "Menge" },

    {
      id: "qualitaet-popup",
      header: "Qualitätswerte",
      cell: ({ row }) => (
        <button
          className="text-blue-600 underline"
          onClick={() => openQualitaetDialog(row.original)}
        >
          <Eye size={20} />
        </button>
      ),
    },

  ];

  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Daten.</div>;

  return (
    <>
      <div className="flex flex-col gap-4">


        <DataTable
          data={filteredData}
          columns={columns}
          rowSelection={rowSelection}
          onRowSelectionChange={handleRowSelectionChange}
        />
      </div>
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
              <li>deltaE: {selectedQualitaet.deltaE}</li>
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

export default StandardRohmaterialTable;
