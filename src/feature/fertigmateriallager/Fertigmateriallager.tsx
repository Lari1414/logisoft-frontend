import { Grid2x2Plus } from "lucide-react";
import { useState, useCallback } from "react";
import { fertigmateriallagerApi, storeMaterialRequest } from "@/api/endpoints/fertigmateriallagerApi.ts";
import { BaseContentLayout } from "@/common/BaseContentLayout.tsx";
import FertigMateriallagerTable, { TransformedData } from "@/feature/fertigmateriallager/FertigmateriallagerTable"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


const FertigMateriallager = () => {
  const [outsourceFertigmaterial, { isLoading }] = fertigmateriallagerApi.useOutsourceFertigmaterialMutation();
  const [storeMaterial, { isLoading: isStoring }] = fertigmateriallagerApi.useStoreFertigmaterialMutation();

  const [selectedRows, setSelectedRows] = useState<TransformedData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEinlagernModalOpen, setIsEinlagernModalOpen] = useState(false);

  const [mengenMap, setMengenMap] = useState<Record<number, string>>({});
  const [newMaterial, setNewMaterial] = useState<storeMaterialRequest>({
    lager_ID: 0,
    menge: 0,
    farbe: "",
    typ: "",
    groesse: "",
    url: "",
  });

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
          await outsourceFertigmaterial({
            lagerbestand_ID: item.lagerbestand_ID,
            menge: menge,
          });
          console.log(`Material mit Lagerbestand-ID ${item.lagerbestand_ID} wurde ausgelagert.`);
        } catch (error) {
          console.error(`Fehler beim Auslagern des Materials mit Lagerbestand-ID ${item.lagerbestand_ID}:`, error);
        }
      } else {
        console.log(`Ungültige Menge für Material mit Lagerbestand-ID ${item.lagerbestand_ID}.`);
      }
    }

    setIsModalOpen(false);
    setMengenMap({});
    setSelectedRows([]);
  };

  const handleNewMaterialChange = (field: keyof storeMaterialRequest, value: string | number) => {
    setNewMaterial((prev) => ({
      ...prev,
      [field]: typeof prev[field] === "number" ? Number(value) : value,
    }));
  };

  const handleStoreMaterial = async () => {
    try {
      await storeMaterial(newMaterial);
      setIsEinlagernModalOpen(false);
      setNewMaterial({
        lager_ID: 0,
        menge: 0,
        farbe: "",
        typ: "",
        groesse: "",
        url: "",
      });
    } catch (error) {
      console.error("Fehler beim Einlagern:", error);
    }
  };

  const isConfirmDisabled = selectedRows.some((item) => {
    const menge = parseFloat(mengenMap[item.lagerbestand_ID]);
    return isNaN(menge) || menge <= 0 || menge > item.menge;
  });

  return (
<BaseContentLayout title="Fertigmaterial Lager">
 

  <FertigMateriallagerTable onSelectionChange={handleSelectionChange} />
   <div className="flex gap-4 mb-4">
    <Button onClick={() => setIsEinlagernModalOpen(true)} disabled={isStoring}>
           <Grid2x2Plus className="mr-2 h-4 w-4" />
       Einlagern
    </Button>
    <Button onClick={handleAuslagernClick} disabled={isLoading}>
      <Grid2x2Plus className="mr-2 h-4 w-4" />
      Auslagern
    </Button>
   
  </div>
      {/* Auslagern Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Materialien auslagern</DialogTitle>
          </DialogHeader>

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
            Auslagern
          </Button>
        </DialogContent>
      </Dialog>

      {/* Einlagern Dialog */}
      <Dialog open={isEinlagernModalOpen} onOpenChange={setIsEinlagernModalOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Material einlagern</DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      {[
        ["lager_ID", "Lager-ID", "number"],
        ["menge", "Menge", "number"],
        ["farbe", "Farbe", "text"],
        ["typ", "Typ", "text"],
        ["groesse", "Größe", "text"],
        ["url", "Bild-URL", "text"],
      ].map(([field, label, type]) => (
        <div key={field} className="flex flex-col space-y-1">
          <label htmlFor={field} className="text-sm font-medium text-gray-700">
            {label}
          </label>
          <Input
            id={field}
            type={type}
            placeholder={label as string}
            value={newMaterial[field as keyof storeMaterialRequest] as string | number}
            onChange={(e) =>
              handleNewMaterialChange(field as keyof storeMaterialRequest, e.target.value)
            }
          />
        </div>
      ))}
    </div>

    <Button
      onClick={handleStoreMaterial}
      disabled={isStoring}
      className="mt-6"
    >
      Einlagern
    </Button>
  </DialogContent>
</Dialog>
    </BaseContentLayout>
  );
};

export default FertigMateriallager;
