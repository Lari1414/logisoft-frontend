import { Grid2x2Plus } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { rohmateriallagerApi } from "@/api/endpoints/rohmateriallagerApi.ts";
import { BaseContentLayout } from "@/common/BaseContentLayout.tsx";
import RohmateriallagerTable, { TransformedData } from "@/feature/rohmateriallager/RohmateriallagerTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const RohMateriallager = () => {
  const [outsourceRohmaterial, { isLoading }] = rohmateriallagerApi.useOutsourceRohmaterialMutation();
  
  const [selectedRows, setSelectedRows] = useState<TransformedData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mengenMap, setMengenMap] = useState<Record<number, string>>({});

  const [refetchTable, setRefetchTable] = useState<(() => void) | null>(null);

  const [einzelAuslagerung, setEinzelAuslagerung] = useState<TransformedData | null>(null);
  const [mengeEinzel, setMengeEinzel] = useState<string>("");
  useEffect(() => {
    // console.log("Selected Rows", selectedRows);
  }, [selectedRows]);

  const handleSetRefetch = useCallback((refetchFn: () => void) => {
    setRefetchTable(() => refetchFn);
  }, []);

  const handleAuslagernClick = () => {
    const initialMengen: Record<number, string> = {};
    selectedRows.forEach((item) => {
      initialMengen[item.lagerbestand_ID] = "";
    });
    setMengenMap(initialMengen);
    setIsModalOpen(true);
  };

  const handleSelectionChange = useCallback((rows: TransformedData[]) => {
    setSelectedRows(rows.filter((row) => row !== undefined));
  }, []);

  const handleMengeChange = (lagerbestand_ID: number, value: string) => {
    setMengenMap((prevMap) => ({
      ...prevMap,
      [lagerbestand_ID]: value,
    }));
  };

  const confirmAuslagerung = async () => {
    for (const item of selectedRows) {
      const mengeStr = mengenMap[item.lagerbestand_ID];
      const menge = parseFloat(mengeStr);

      if (!isNaN(menge) && menge > 0 && menge <= item.menge) {
        try {
          await outsourceRohmaterial({
            lagerbestand_ID: item.lagerbestand_ID,
            menge: menge,
          });
          console.log(`Material mit Lagerbestand-ID ${item.lagerbestand_ID} wurde ausgelagert.`);
        } catch (error) {
          console.error(`Fehler beim Auslagern von ${item.lagerbestand_ID}:`, error);
        }
      } else {
        console.warn(`Ungültige Menge für Lagerbestand-ID ${item.lagerbestand_ID}.`);
      }
    }

    setIsModalOpen(false);
    setMengenMap({});
    setSelectedRows([]);

    if (refetchTable) refetchTable();
  };

  const isConfirmDisabled = selectedRows.some((item) => {
    const menge = parseFloat(mengenMap[item.lagerbestand_ID]);
    return isNaN(menge) || menge <= 0 || menge > item.menge;
  });

  const handleEinzelAuslagernClick = (row: TransformedData) => {
    setEinzelAuslagerung(row);
    setMengeEinzel("");
    setIsModalOpen(true);
  };

  // Confirm für Einzel-Auslagerung
  const confirmEinzelAuslagerung = async () => {
    if (!einzelAuslagerung) return;
    const menge = parseFloat(mengeEinzel);
    if (isNaN(menge) || menge <= 0 || menge > einzelAuslagerung.menge) {
      alert("Ungültige Menge");
      return;
    }

    try {
      await outsourceRohmaterial({
        lagerbestand_ID: einzelAuslagerung.lagerbestand_ID,
        menge: menge,
      });
      if (refetchTable) refetchTable();
    } catch (error) {
      console.error("Fehler beim Auslagern:", error);
    }

    setIsModalOpen(false);
    setEinzelAuslagerung(null);
    setMengeEinzel("");
  };

  return (
    <BaseContentLayout
      title="Rohrmaterial Lager"
      primaryCallToActionButton={{
        text: "Auslagern",
        icon: Grid2x2Plus,
        onClick: handleAuslagernClick,
        isLoading,
      }}
    >
      <RohmateriallagerTable
        onSelectionChange={handleSelectionChange}
        onRefetch={handleSetRefetch}
        onAuslagernClick={handleEinzelAuslagernClick} // Prop übergeben
      />

      {/* Gemeinsamer Dialog für Mehrfach- und Einzel-Auslagerung */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {einzelAuslagerung ? "Material auslagern" : "Materialien auslagern"}
            </DialogTitle>
          </DialogHeader>

          {einzelAuslagerung ? (
            <div className="mb-4 p-4 border rounded">
              <div className="font-bold">
                {einzelAuslagerung.category} - {einzelAuslagerung.farbe} (Lagerbestand-ID: {einzelAuslagerung.lagerbestand_ID} / Material-ID: {einzelAuslagerung.material_ID})
              </div>
              <div className="my-2">
                <span className="font-semibold">Verfügbar:</span> {einzelAuslagerung.menge}
              </div>
              <Input
                type="number"
                placeholder={`Menge (max ${einzelAuslagerung.menge})`}
                value={mengeEinzel}
                onChange={(e) => setMengeEinzel(e.target.value)}
                min="1"
                max={einzelAuslagerung.menge}
                className="mt-2"
              />
              <Button
                onClick={confirmEinzelAuslagerung}
                disabled={
                  isNaN(parseFloat(mengeEinzel)) ||
                  parseFloat(mengeEinzel) <= 0 ||
                  parseFloat(mengeEinzel) > einzelAuslagerung.menge
                }
                className="mt-4"
              >
                Bestätigen
              </Button>
            </div>
          ) : (
            // Hier dein bestehender Multi-Auslagerungscode (wie gehabt)
            <>
              {selectedRows.map((item) => (
                <div key={item.lagerbestand_ID} className="mb-4 p-4 border rounded">
                  <div className="font-bold">
                    {item.category} - {item.farbe} (Lagerbestand-ID: {item.lagerbestand_ID} / Material-ID: {item.material_ID})
                  </div>
                  <div className="my-2">
                    <span className="font-semibold">Verfügbar:</span> {item.menge}
                  </div>
                  <Input
                    type="number"
                    placeholder={`Menge (max ${item.menge})`}
                    value={mengenMap[item.lagerbestand_ID] || ""}
                    onChange={(e) => handleMengeChange(item.lagerbestand_ID, e.target.value)}
                    min="1"
                    max={item.menge}
                    className="mt-2"
                  />
                </div>
              ))}

              <Button
                onClick={confirmAuslagerung}
                disabled={isConfirmDisabled}
                className="mt-4"
              >
                Bestätigen
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </BaseContentLayout>
  );
};

export default RohMateriallager;
