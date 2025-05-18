import { Grid2x2Plus } from "lucide-react";
import { useState, useCallback } from "react";
import { wareneingangApi } from "@/api/endpoints/wareneingangApi.ts";
import { orderApi } from "@/api/endpoints/orderApi.ts"; // Hier deinen Order-API-Slice importieren
import { BaseContentLayout } from "@/common/BaseContentLayout.tsx";
import WareneingangTable, { WareneingangData } from "@/feature/wareneingang/WareneingangTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Wareneingang = () => {
  const [storeRohmaterial] = wareneingangApi.useStoreRohmaterialMutation();
  const [deleteWareneingang] = wareneingangApi.useDeleteWareneingangMutation();
  const [createWareneingang] = wareneingangApi.useCreateWareneingangMutation();
  const [sperreWareneingaenge] = wareneingangApi.useSperreWareneingaengeMutation();

  const [selectedRows, setSelectedRows] = useState<WareneingangData[]>([]);
  const [modalType, setModalType] = useState<"einlagern" | "sperren" | "anlegen" | null>(null);

  // Hier: bestellte Bestellungen aus der API laden
  const { data: bestelltOrders, isLoading, error } = orderApi.useGetbestelltOrdersQuery();

  const [neuerWareneingang, setNeuerWareneingang] = useState({
    materialbestellung_ID: 0,
    menge: 0,
    lieferdatum: "",
    materialDetails: {
      category: "",
      farbe: "",
      typ: "",
      groesse: ""
    },
    qualitaet: {
      viskositaet: 0,
      ppml: 0,
      deltaE: 0,
      saugfaehigkeit: 0,
      weissgrad: 0
    }
  });

  type MaterialKey = keyof typeof neuerWareneingang.materialDetails;
  type QualitaetKey = keyof typeof neuerWareneingang.qualitaet;

  const handleEinlagernClick = () => setModalType("einlagern");
  const handleSperrenClick = () => setModalType("sperren");

  const handleSelectionChange = useCallback((rows: WareneingangData[]) => {
    setSelectedRows(rows.filter(Boolean));
  }, []);

  const confirmEinlagerung = async () => {
  const ids = selectedRows.map((item) => item.eingang_ID);

  try {
    await storeRohmaterial({ ids });
    console.log(`Materialien eingelagert: ${ids.join(", ")}`);

    // Jetzt lokale Einträge löschen
    for (const id of ids) {
      await deleteWareneingang(id);
    }
  } catch (error) {
    console.error("Fehler beim Einlagern:", error);
  }

  setModalType(null);
  setSelectedRows([]);
};
  const confirmSperre = async () => {
    try {
      const ids = selectedRows.map((item) => item.eingang_ID);
      const response = await sperreWareneingaenge({ ids }).unwrap();
      console.log(`${response.updatedCount} Einträge gesperrt.`);
    } catch (error) {
      console.error("Fehler beim Sperren:", error);
    }

    setModalType(null);
    setSelectedRows([]);
  };

  return (
    <BaseContentLayout title="Wareneingang">
      <WareneingangTable onSelectionChange={handleSelectionChange} />

      <div className="flex gap-4 mt-4">
        <Button onClick={handleEinlagernClick} disabled={selectedRows.length === 0}>
          <Grid2x2Plus className="mr-2 h-4 w-4" />
          Einlagern
        </Button>
        <Button onClick={handleSperrenClick} disabled={selectedRows.length === 0}>
          Sperren
        </Button>
        <Button onClick={() => setModalType("anlegen")}>
          Wareneingang anlegen
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

      {/* Wareneingang anlegen Dialog */}
      <Dialog open={modalType === "anlegen"} onOpenChange={() => setModalType(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neuen Wareneingang anlegen</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Materialbestellung ID</label>

              {isLoading ? (
                <div>Lade Bestellungen...</div>
              ) : error ? (
                <div className="text-red-600">Fehler beim Laden der Bestellungen</div>
              ) : (
                <select
                  value={neuerWareneingang.materialbestellung_ID}
                  onChange={(e) =>
                    setNeuerWareneingang({
                      ...neuerWareneingang,
                      materialbestellung_ID: Number(e.target.value),
                    })
                  }
                  className="w-full border rounded p-2"
                >
                  <option value={0} disabled>
                    Bitte Bestellung auswählen
                  </option>
                  {bestelltOrders?.map((order) => (
                    <option key={order.materialbestellung_ID} value={order.materialbestellung_ID}>
                      Bestellung ID {order.materialbestellung_ID} {/* Optional weitere Infos, z.B. order.beschreibung */}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1">Menge</label>
              <input
                type="number"
                value={neuerWareneingang.menge}
                onChange={(e) =>
                  setNeuerWareneingang({ ...neuerWareneingang, menge: Number(e.target.value) })
                }
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Lieferdatum</label>
              <input
                type="datetime-local"
                value={neuerWareneingang.lieferdatum}
                onChange={(e) =>
                  setNeuerWareneingang({ ...neuerWareneingang, lieferdatum: e.target.value })
                }
                className="w-full border rounded p-2"
              />
            </div>

            <h4 className="font-bold mt-4">Materialdetails</h4>

            {(Object.keys(neuerWareneingang.materialDetails) as MaterialKey[]).map((key) => (
              <div key={key}>
                <label className="block font-medium mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input
                  type="text"
                  value={neuerWareneingang.materialDetails[key]}
                  onChange={(e) =>
                    setNeuerWareneingang({
                      ...neuerWareneingang,
                      materialDetails: { ...neuerWareneingang.materialDetails, [key]: e.target.value },
                    })
                  }
                  className="w-full border rounded p-2"
                />
              </div>
            ))}

            <h4 className="font-bold mt-4">Qualität</h4>

            {(Object.keys(neuerWareneingang.qualitaet) as QualitaetKey[]).map((key) => (
              <div key={key}>
                <label className="block font-medium mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input
                  type="number"
                  step="any"
                  value={neuerWareneingang.qualitaet[key]}
                  onChange={(e) =>
                    setNeuerWareneingang({
                      ...neuerWareneingang,
                      qualitaet: { ...neuerWareneingang.qualitaet, [key]: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full border rounded p-2"
                />
              </div>
            ))}
          </div>

          <Button
            className="mt-4"
            onClick={async () => {
              try {
                await createWareneingang(neuerWareneingang);
                setModalType(null);
                console.log("Wareneingang erfolgreich angelegt.");
              } catch (error) {
                console.error("Fehler beim Anlegen:", error);
              }
            }}
            disabled={neuerWareneingang.materialbestellung_ID === 0}
          >
            Anlegen
          </Button>
        </DialogContent>
      </Dialog>
    </BaseContentLayout>
  );
};

export default Wareneingang;
