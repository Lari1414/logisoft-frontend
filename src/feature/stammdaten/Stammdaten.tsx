import { Grid2x2Plus } from "lucide-react";
import { useState } from "react";
import { BaseContentLayout } from "@/common/BaseContentLayout.tsx";
import { lieferantApi } from "@/api/endpoints/lieferantApi.ts";
import { materialApi } from "@/api/endpoints/materialApi.ts";
import { adresseApi } from "@/api/endpoints/adresseApi.ts";
import LieferantTable from "../lieferant/LieferantTable";
import MaterialTable from "@/feature/material/MaterialTable.tsx";
import { useGetLagerQuery } from "@/api/endpoints/lagerApi.ts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, Tab } from "@mui/material";

const Stammdaten = () => {
  const [activeTab, setActiveTab] = useState("lieferant");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [createLieferant, { isLoading: isLieferantLoading }] =
    lieferantApi.useCreateLieferantMutation();
  const [createAdresse] = adresseApi.useCreateAdresseMutation();
  const [createMaterial, { isLoading: isMaterialLoading }] =
    materialApi.useCreateMaterialMutation();

  const { data: lagerList = [] } = useGetLagerQuery();
  const { refetch: refetchMaterials } = materialApi.useGetMaterialQuery();
  const { data: lieferanten = [], refetch: refetchLieferanten } =
    lieferantApi.useGetLieferantQuery();

  const [lieferantForm, setLieferantForm] = useState({
    firmenname: "",
    kontaktperson: "",
    strasse: "",
    ort: "",
    plz: "",
  });

  const [materialForm, setMaterialForm] = useState({
    lager_ID: "",
    category: "",
    cyan: 0,
    magenta: 0,
    yellow: 0,
    black: 0,
    typ: "",
    groesse: "",
    url: "",
    standardmaterial: false
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const resetForms = () => {
    setLieferantForm({
      firmenname: "",
      kontaktperson: "",
      strasse: "",
      ort: "",
      plz: "",
    });
    setMaterialForm({
      lager_ID: "",
      category: "",
      cyan: 0,
      magenta: 0,
      yellow: 0,
      black: 0,
      typ: "",
      groesse: "",
      url: "",
      standardmaterial: false
    });
  };

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => {
    resetForms();
    setIsModalOpen(false);
  };

  const handleLieferantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLieferantForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMaterialChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setMaterialForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitLieferant = async () => {
    try {
      const adresse = await createAdresse({
        strasse: lieferantForm.strasse,
        ort: lieferantForm.ort,
        plz: parseInt(lieferantForm.plz),
      }).unwrap();

      await createLieferant({
        firmenname: lieferantForm.firmenname,
        kontaktperson: lieferantForm.kontaktperson,
        adresse_ID: adresse.adresse_ID,
      }).unwrap();

      await refetchLieferanten();
      handleClose();
    } catch (err) {
      console.error("Fehler beim Anlegen des Lieferanten:", err);
    }
  };

 const handleSubmitMaterial = async () => {
  try {
    await createMaterial({
      lager_ID: parseInt(materialForm.lager_ID),
      category: materialForm.category,
      farbe_json: {
        cyan: parseFloat(materialForm.cyan.toString()),
        magenta: parseFloat(materialForm.magenta.toString()),
        yellow: parseFloat(materialForm.yellow.toString()),
        black: parseFloat(materialForm.black.toString()),
      },
      standardmaterial: materialForm.standardmaterial,
      typ: materialForm.typ,
      groesse: materialForm.groesse,
      url: materialForm.url,
    }).unwrap();

    await refetchMaterials();
    handleClose();
  } catch (err) {
    console.error("Fehler beim Anlegen des Materials:", err);
  }
};

  const isSaveDisabled =
    activeTab === "lieferant"
      ? !lieferantForm.firmenname || !lieferantForm.plz
      : !materialForm.lager_ID ||
        !materialForm.category ||
        !materialForm.cyan ||
        !materialForm.magenta ||
        !materialForm.yellow ||
        !materialForm.black;
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
      title="Stammdaten"
      primaryCallToActionButton={{
        text:
          activeTab === "lieferant" ? "Lieferant anlegen" : "Material anlegen",
        icon: Grid2x2Plus,
        onClick: handleOpen,
        isLoading: isLieferantLoading || isMaterialLoading,
      }}
    >
      <div className="flex flex-col space-y-4">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Lieferantenstammdaten" value="lieferant" />
          <Tab label="Materialstammdaten" value="material" />
        </Tabs>

        <div>
          {activeTab === "lieferant" ? (
            <>
              <LieferantTable lieferanten={lieferanten} />
            </>
          ) : (
            <>
              <MaterialTable />
            </>
          )}
        </div>
      </div>

 <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
  <DialogContent
    style={{ maxWidth: "800px", width: "90vw" }} // Breiter machen
    className="grid grid-cols-2 gap-4" // 2 Spalten Layout mit Abstand
  >
    <DialogHeader className="col-span-2">
      <DialogTitle>
        {activeTab === "lieferant" ? "Lieferant anlegen" : "Material anlegen"}
      </DialogTitle>
    </DialogHeader>

    {activeTab === "lieferant" ? (
      <>
        <div>
          <label className="block font-medium mb-1">Firmenname</label>
          <Input
            name="firmenname"
            placeholder="Firmenname"
            value={lieferantForm.firmenname}
            onChange={handleLieferantChange}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Kontaktperson</label>
          <Input
            name="kontaktperson"
            placeholder="Kontaktperson"
            value={lieferantForm.kontaktperson}
            onChange={handleLieferantChange}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Straße</label>
          <Input
            name="strasse"
            placeholder="Straße"
            value={lieferantForm.strasse}
            onChange={handleLieferantChange}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Ort</label>
          <Input
            name="ort"
            placeholder="Ort"
            value={lieferantForm.ort}
            onChange={handleLieferantChange}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">PLZ</label>
          <Input
            name="plz"
            placeholder="PLZ"
            value={lieferantForm.plz}
            onChange={handleLieferantChange}
          />
        </div>

        <div className="col-span-2 flex justify-end">
          <Button onClick={handleSubmitLieferant} disabled={isSaveDisabled}>
            Speichern
          </Button>
        </div>
      </>
    ) : (
      <>
        <div className="col-span-2">
          <label className="block font-medium mb-1">Lager</label>
          <select
            name="lager_ID"
            value={materialForm.lager_ID}
            onChange={(e) => handleMaterialChange(e as any)}
            className="w-full border rounded px-2 py-2"
          >
            <option value="">Lager auswählen</option>
            {lagerList.map((lager) => (
              <option key={lager.lager_ID} value={lager.lager_ID}>
                {lager.bezeichnung}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Kategorie</label>
          <Input
            name="category"
            placeholder="Kategorie"
            value={materialForm.category}
            onChange={handleMaterialChange}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Typ</label>
          <Input
            name="typ"
            placeholder="Typ"
            value={materialForm.typ}
            onChange={handleMaterialChange}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Größe</label>
          <Input
            name="groesse"
            placeholder="Größe"
            value={materialForm.groesse}
            onChange={handleMaterialChange}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Bild-URL</label>
          <Input
            name="url"
            placeholder="Bild-URL"
            value={materialForm.url}
            onChange={handleMaterialChange}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Standardmaterial</label>
          <select
            name="standardmaterial"
            value={materialForm.standardmaterial ? "true" : "false"}
            onChange={(e) =>
              setMaterialForm((prev) => ({
                ...prev,
                standardmaterial: e.target.value === "true",
              }))
            }
            className="w-full border rounded px-2 py-2"
          >
            <option value="false">Nein</option>
            <option value="true">Ja</option>
          </select>
        </div>

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
        <div className="flex flex-col w-1/4">
          <label htmlFor="cyan" className="mb-1 text-sm font-medium">
            Cyan
          </label>
          <Input
            id="cyan"
            name="cyan"
            placeholder="Cyan"
            value={materialForm.cyan}
            onChange={handleMaterialChange}
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-1/4">
          <label htmlFor="magenta" className="mb-1 text-sm font-medium">
            Magenta
          </label>
          <Input
            id="magenta"
            name="magenta"
            placeholder="Magenta"
            value={materialForm.magenta}
            onChange={handleMaterialChange}
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-1/4">
          <label htmlFor="yellow" className="mb-1 text-sm font-medium">
            Yellow
          </label>
          <Input
            id="yellow"
            name="yellow"
            placeholder="Yellow"
            value={materialForm.yellow}
            onChange={handleMaterialChange}
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-1/4">
          <label htmlFor="black" className="mb-1 text-sm font-medium">
            Black
          </label>
          <Input
            id="black"
            name="black"
            placeholder="Black"
            value={materialForm.black}
            onChange={handleMaterialChange}
            className="w-full"
          />
        </div>
      </div>
    </div>

        <div className="col-span-2 flex justify-end">
          <Button onClick={handleSubmitMaterial} disabled={isSaveDisabled}>
            Speichern
          </Button>
        </div>
      </>
    )}
  </DialogContent>
</Dialog>

    </BaseContentLayout>
  );
};

export default Stammdaten;
