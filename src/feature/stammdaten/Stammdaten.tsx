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

  const [createLieferant, { isLoading: isLieferantLoading }] = lieferantApi.useCreateLieferantMutation();
  const [createAdresse] = adresseApi.useCreateAdresseMutation();
  const [createMaterial, { isLoading: isMaterialLoading }] = materialApi.useCreateMaterialMutation();

  const { data: lagerList = [] } = useGetLagerQuery();
  const { refetch: refetchMaterials } = materialApi.useGetMaterialQuery();
  const { data: lieferanten = [], refetch: refetchLieferanten } = lieferantApi.useGetLieferantQuery();

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
    farbe: "",
    typ: "",
    groesse: "",
    url: "",
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
      farbe: "",
      typ: "",
      groesse: "",
      url: "",
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
        farbe: materialForm.farbe,
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
      : !materialForm.lager_ID || !materialForm.category;

  return (
    <BaseContentLayout
      title="Stammdaten"
      primaryCallToActionButton={{
        text: activeTab === "lieferant" ? "Lieferant anlegen" : "Material anlegen",
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
              <h2 className="text-xl font-semibold mb-2"></h2>
              <LieferantTable lieferanten={lieferanten} />
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2"></h2>
              <MaterialTable />
            </>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activeTab === "lieferant" ? "Lieferant anlegen" : "Material anlegen"}
            </DialogTitle>
          </DialogHeader>

          {activeTab === "lieferant" ? (
            <>
              <Input
                name="firmenname"
                placeholder="Firmenname"
                value={lieferantForm.firmenname}
                onChange={handleLieferantChange}
                className="mt-2"
              />
              <Input
                name="kontaktperson"
                placeholder="Kontaktperson"
                value={lieferantForm.kontaktperson}
                onChange={handleLieferantChange}
                className="mt-2"
              />
              <Input
                name="strasse"
                placeholder="Straße"
                value={lieferantForm.strasse}
                onChange={handleLieferantChange}
                className="mt-2"
              />
              <Input
                name="ort"
                placeholder="Ort"
                value={lieferantForm.ort}
                onChange={handleLieferantChange}
                className="mt-2"
              />
              <Input
                name="plz"
                placeholder="PLZ"
                value={lieferantForm.plz}
                onChange={handleLieferantChange}
                className="mt-2"
              />
              <Button
                onClick={handleSubmitLieferant}
                disabled={isSaveDisabled}
                className="mt-4"
              >
                Speichern
              </Button>
            </>
          ) : (
            <>
              <select
                name="lager_ID"
                value={materialForm.lager_ID}
                onChange={(e) => handleMaterialChange(e as any)}
                className="w-full border rounded px-2 py-2 mt-2"
              >
                <option value="">Lager auswählen</option>
                {lagerList.map((lager) => (
                  <option key={lager.lager_ID} value={lager.lager_ID}>
                    {lager.bezeichnung}
                  </option>
                ))}
              </select>
              <Input
                name="category"
                placeholder="Kategorie"
                value={materialForm.category}
                onChange={handleMaterialChange}
                className="mt-2"
              />
              <Input
                name="farbe"
                placeholder="Farbe"
                value={materialForm.farbe}
                onChange={handleMaterialChange}
                className="mt-2"
              />
              <Input
                name="typ"
                placeholder="Typ"
                value={materialForm.typ}
                onChange={handleMaterialChange}
                className="mt-2"
              />
              <Input
                name="groesse"
                placeholder="Größe"
                value={materialForm.groesse}
                onChange={handleMaterialChange}
                className="mt-2"
              />
              <Input
                name="url"
                placeholder="Bild-URL"
                value={materialForm.url}
                onChange={handleMaterialChange}
                className="mt-2"
              />
              <Button
                onClick={handleSubmitMaterial}
                disabled={isSaveDisabled}
                className="mt-4"
              >
                Speichern
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </BaseContentLayout>
  );
};



export default Stammdaten;