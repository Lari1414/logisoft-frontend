import { Grid2x2Plus } from "lucide-react";
import { useState, useCallback } from "react";
import { wareneingangApi } from "@/api/endpoints/wareneingangApi.ts";
import { BaseContentLayout } from "@/common/BaseContentLayout.tsx";
import WareneingangTable, { WareneingangData } from "@/feature/wareneingang/WareneingangTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Wareneingang = () => {
  const [storeRohmaterial] = wareneingangApi.useStoreRohmaterialMutation();
  const [deleteWareneingang] = wareneingangApi.useDeleteWareneingangMutation();
  const [selectedRows, setSelectedRows] = useState<WareneingangData[]>([]);
  const [modalType, setModalType] = useState<"einlagern" | "sperren" | null>(null);

  const handleEinlagernClick = () => setModalType("einlagern");
  const handleSperrenClick = () => setModalType("sperren");

  const handleSelectionChange = useCallback((rows: WareneingangData[]) => {
    setSelectedRows(rows.filter(Boolean));
  }, []);

  const confirmEinlagerung = async () => {
    for (const item of selectedRows) {
      try {
        await storeRohmaterial({
          eingang_ID: item.eingang_ID,
          material_ID: item.material_ID,
          lager_ID: 1,
          menge: item.menge,
          qualitaet_ID: item.qualitaet_ID,
          category: item.category,
          farbe: item.farbe,
          typ: item.typ,
          groesse: item.groesse,
          url: item.url,
        });
        console.log(`Material-ID ${item.material_ID} eingelagert`);

        await deleteWareneingang(item.eingang_ID);
      } catch (error) {
        console.error(`Fehler beim Einlagern von ${item.material_ID}:`, error);
      }
    }

    setModalType(null);
    setSelectedRows([]);
  };

  const confirmSperre = async () => {
    for (const item of selectedRows) {
      console.log(`Material-ID ${item.material_ID} gesperrt`);
    }

    setModalType(null);
    setSelectedRows([]);
  };

  return (
    <BaseContentLayout title="Wareneingang">
      {/* Tabelle */}
      <WareneingangTable onSelectionChange={handleSelectionChange} />

      {/* Buttons unter der Tabelle, linksbündig */}
      <div className="flex gap-4 mt-4">
        <Button onClick={handleEinlagernClick} disabled={selectedRows.length === 0}>
          <Grid2x2Plus className="mr-2 h-4 w-4" />
          Einlagern
        </Button>
        <Button onClick={handleSperrenClick} disabled={selectedRows.length === 0} >
          Sperren
        </Button>
      </div>

      {/* Einlagern Dialog */}
      <Dialog open={modalType === "einlagern"} onOpenChange={() => setModalType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Waren einlagern</DialogTitle>
          </DialogHeader>

          {selectedRows.map((item) => (
            <div key={item.material_ID} className="mb-4 p-4 border rounded space-y-1 text-sm">
              <div className="font-bold">Material-ID: {item.material_ID}</div>
              <div>Menge: {item.menge}</div>
              <div>Farbe: {item.farbe}</div>
              <div>Typ: {item.typ}</div>
              <div>Größe: {item.groesse}</div>
              <div>Kategorie: {item.category}</div>
              <div>Qualität-ID: {item.qualitaet_ID}</div>
              <div>
                Bild: <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Link</a>
              </div>
            </div>
          ))}

          <Button onClick={confirmEinlagerung} className="mt-4" disabled={selectedRows.length === 0}>
            Bestätigen
          </Button>
        </DialogContent>
      </Dialog>

      {/* Sperren Dialog */}
      <Dialog open={modalType === "sperren"} onOpenChange={() => setModalType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Waren sperren</DialogTitle>
          </DialogHeader>

          {selectedRows.map((item) => (
            <div key={item.material_ID} className="mb-4 p-4 border rounded space-y-1 text-sm">
              <div className="font-bold">Material-ID: {item.material_ID}</div>
              <div>Menge: {item.menge}</div>
              <div>Farbe: {item.farbe}</div>
              <div>Typ: {item.typ}</div>
              <div>Größe: {item.groesse}</div>
              <div>Kategorie: {item.category}</div>
              <div>Qualität-ID: {item.qualitaet_ID}</div>
              <div>
                Bild: <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Link</a>
              </div>
            </div>
          ))}

          <Button onClick={confirmSperre} className="mt-4" disabled={selectedRows.length === 0}>
            Sperren bestätigen
          </Button>
        </DialogContent>
      </Dialog>
    </BaseContentLayout>
  );
};

export default Wareneingang;
