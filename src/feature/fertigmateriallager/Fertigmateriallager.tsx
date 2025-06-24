import { Grid2x2Plus } from "lucide-react";
import { useState, useCallback } from "react";
import { fertigmateriallagerApi, storeMaterialRequest } from "@/api/endpoints/fertigmateriallagerApi.ts";
import { BaseContentLayout } from "@/common/BaseContentLayout.tsx";
import FertigMateriallagerTable, { TransformedData } from "@/feature/fertigmateriallager/FertigmateriallagerTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FertigMateriallager = () => {
  const [outsourceFertigmaterial] = fertigmateriallagerApi.useOutsourceFertigmaterialMutation();
  const [storeMaterial, { isLoading: isStoring }] = fertigmateriallagerApi.useStoreFertigmaterialMutation();

  const [selectedRows, setSelectedRows] = useState<TransformedData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEinlagernModalOpen, setIsEinlagernModalOpen] = useState(false);

  const [refetchTable, setRefetchTable] = useState<(() => void) | null>(null);
  const [mengenMap, setMengenMap] = useState<Record<number, string>>({});


  const [materialForm, setMaterialForm] = useState<Record<string, any>>({
    cyan: 0,
    magenta: 0,
    yellow: 0,
    black: 0,
    menge: 0,
    standardmaterial: false,
    typ: "",
    groesse: "",
    url: "",
    category: "",
  });

  const handleMaterialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMaterialForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [einzelAuslagerung, setEinzelAuslagerung] = useState<TransformedData | null>(null);
  const [mengeEinzel, setMengeEinzel] = useState<string>("");

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

    if (refetchTable) refetchTable();
  };

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
      await outsourceFertigmaterial({
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

  /* const handleNewMaterialChange = (field: keyof storeMaterialRequest, value: string | number) => {
     setNewMaterial((prev) => ({
       ...prev,
       [field]: typeof prev[field] === "number" ? Number(value) : value,
     }));
   }; */

  const handleStoreMaterial = async () => {
    const newMaterial: storeMaterialRequest = {
      lager_ID: 2,
      menge: Number(materialForm.menge),
      farbe_json: {
        cyan: Number(materialForm.cyan),
        magenta: Number(materialForm.magenta),
        yellow: Number(materialForm.yellow),
        black: Number(materialForm.black),
      },
      standardmaterial: materialForm.standardmaterial,
      typ: materialForm.typ,
      groesse: materialForm.groesse,
      url: materialForm.url,
      category: materialForm.category
    };

    try {
      await storeMaterial(newMaterial);
      setIsEinlagernModalOpen(false);
      setMaterialForm({
        cyan: 0,
        magenta: 0,
        yellow: 0,
        black: 0,
        menge: 0,
        standardmaterial: false,
        typ: "",
        groesse: "",
        url: "",
        category: ""
      });

      if (refetchTable) refetchTable();
    } catch (error) {
      console.error("Fehler beim Einlagern:", error);
    }
  };

  const isConfirmDisabled = selectedRows.some((item) => {
    const menge = parseFloat(mengenMap[item.lagerbestand_ID]);
    return isNaN(menge) || menge <= 0 || menge > item.menge;
  });

  function cmykToRgb(c: number, m: number, y: number, k: number) {

    c /= 100;
    m /= 100;
    y /= 100;
    k /= 100;

    const r = 255 * (1 - c) * (1 - k);
    const g = 255 * (1 - m) * (1 - k);
    const b = 255 * (1 - y) * (1 - k);

    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
  }

  return (
    <BaseContentLayout
      title="Fertigmaterial Lager"
      primaryCallToActionButton={{
        text: "Auslagern",
        icon: Grid2x2Plus,
        onClick: handleAuslagernClick,
        isLoading: false,
        disabled: selectedRows.length === 0,
      }}
      secondaryActions={
        <Button onClick={() => setIsEinlagernModalOpen(true)} disabled={isStoring}>
          <Grid2x2Plus className="mr-2 h-4 w-4" />
          Einlagern
        </Button>
      }
    >
      <FertigMateriallagerTable onSelectionChange={handleSelectionChange} onRefetch={handleSetRefetch} onAuslagernClick={handleEinzelAuslagernClick} />


      {/* Auslagern Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
         <DialogContent className="max-h-[60vh] overflow-y-auto max-w-4xl w-full">
          <DialogHeader>
            {einzelAuslagerung ? "Material auslagern" : "Materialien auslagern"}
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

      {/* Einlagern Dialog */}
      <Dialog open={isEinlagernModalOpen} onOpenChange={setIsEinlagernModalOpen}>
      <DialogContent className="max-h-[60vh] overflow-y-auto max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Material einlagern</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Menge */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="menge" className="text-sm font-medium text-gray-700">
                Menge
              </label>
              <Input
                name="menge"
                type="number"
                placeholder="Menge"
                value={materialForm.menge}
                onChange={handleMaterialChange}
              />
            </div>

            {/* Farbe */}
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-2">
                <label className="block font-medium">Farbe</label>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: "1px solid #ccc",
                    backgroundColor: (() => {
                      const { r, g, b } = cmykToRgb(
                        Number(materialForm.cyan),
                        Number(materialForm.magenta),
                        Number(materialForm.yellow),
                        Number(materialForm.black)
                      );
                      return `rgb(${r}, ${g}, ${b})`;
                    })(),
                    transition: "background-color 0.3s ease",
                  }}
                />
              </div>

              <div className="flex space-x-4">
                {[
                  { label: "Cyan", name: "cyan" },
                  { label: "Magenta", name: "magenta" },
                  { label: "Yellow", name: "yellow" },
                  { label: "Black", name: "black" },
                ].map(({ label, name }) => (
                  <div key={name} className="flex flex-col w-1/4">
                    <label htmlFor={name} className="mb-1 text-sm font-medium">
                      {label}
                    </label>
                    <Input
                      id={name}
                      name={name}
                      value={materialForm[name]}
                      onChange={handleMaterialChange}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>



            {/* Typ, Größe, URL */}
            {[
              ["typ", "Typ"],
              ["groesse", "Größe"],
              ["url", "Bild-URL"],
              ["category", "Kategorie"],
            ].map(([field, label]) => (
              <div key={field} className="flex flex-col space-y-1">
                <label htmlFor={field} className="text-sm font-medium text-gray-700">
                  {label}
                </label>
                <Input
                  name={field}
                  type="text"
                  placeholder={label}
                  value={materialForm[field]}
                  onChange={handleMaterialChange}
                />
              </div>
            ))}

            {/* Standard Material */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="standardmaterial" className="text-sm font-medium text-gray-700">
                Standard Material
              </label>
              <select
                name="standardmaterial"
                value={materialForm.standardmaterial ? "true" : "false"}
                onChange={(e) =>
                  setMaterialForm((prev) => ({
                    ...prev,
                    standardmaterial: e.target.value === "true",
                  }))
                }
                className="border rounded px-2 py-1"
              >
                <option value="false">Nein</option>
                <option value="true">Ja</option>
              </select>
            </div>
          </div>

          <Button onClick={handleStoreMaterial} disabled={isStoring} className="mt-6">
            Einlagern
          </Button>
        </DialogContent>
      </Dialog>


    </BaseContentLayout>
  );
};

export default FertigMateriallager;
