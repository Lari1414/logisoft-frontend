import React, { useState } from "react";
import { BaseContentLayout } from "@/common/BaseContentLayout.tsx";
import { Grid2x2Plus } from "lucide-react";
import { lieferantApi } from "@/api/endpoints/lieferantApi.ts";
import { materialApi } from "@/api/endpoints/materialApi.ts";
import { adresseApi } from "@/api/endpoints/adresseApi.ts";
import LieferantTable from "../lieferant/LieferantTable";
import MaterialTable from "@/feature/material/MaterialTable.tsx";
import { useGetLagerQuery } from "@/api/endpoints/lagerApi.ts";
import {
  Modal,
  Box,
  Button,
  TextField,
  Typography,
  Tabs,
  Tab,
  MenuItem,
  Select,
  SelectChangeEvent,
  InputLabel,
  FormControl,
} from "@mui/material";

const Stammdaten = () => {
  const [activeTab, setActiveTab] = useState("lieferant");
  const [openModal, setOpenModal] = useState(false);
  const [createLieferant, { isLoading: isLieferantLoading }] = lieferantApi.useCreateLieferantMutation();
  const [createAdresse] = adresseApi.useCreateAdresseMutation();
  const [createMaterial, { isLoading: isMaterialLoading }] = materialApi.useCreateMaterialMutation();
  const { data: lagerList = [] } = useGetLagerQuery();
  
  // Daten und Refetch-Funktionen für beide Tabellen
  const { refetch: refetchMaterials } = materialApi.useGetMaterialQuery();
  const { data: lieferanten = [], refetch: refetchLieferanten } = lieferantApi.useGetLieferantQuery();
  
  const [formData, setFormData] = useState({
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

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => {
    setOpenModal(false);
    // Formulare zurücksetzen beim Schließen
    setMaterialForm({
      lager_ID: "",
      category: "",
      farbe: "",
      typ: "",
      groesse: "",
      url: "",
    });
    setFormData({
      firmenname: "",
      kontaktperson: "",
      strasse: "",
      ort: "",
      plz: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMaterialTextFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setMaterialForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMaterialSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setMaterialForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Funktion zum Erstellen des Materials
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

      setMaterialForm({
        lager_ID: "",
        category: "",
        farbe: "",
        typ: "",
        groesse: "",
        url: "",
      });
      
      setOpenModal(false);
      await refetchMaterials();
    } catch (error) {
      console.error("Fehler beim Erstellen des Materials:", error);
    }
  };

  // Funktion zum Erstellen eines Lieferanten
const handleSubmitLieferant = async () => {
  console.log("Versuche Lieferant zu erstellen mit Daten:", formData);

  try {
    // Schritt 1: Adresse anlegen
    const adresseRes = await createAdresse({
      strasse: formData.strasse,
      ort: formData.ort,
      plz: parseInt(formData.plz, 10),
    }).unwrap();

    console.log("Adresse erfolgreich angelegt. ID:", adresseRes.adresse_ID);

    // Schritt 2: Lieferant mit referenzierter adresse_ID anlegen
    const res = await createLieferant({
      firmenname: formData.firmenname,
      kontaktperson: formData.kontaktperson,
      adresse_ID: adresseRes.adresse_ID,
    }).unwrap();

    console.log("Lieferant erfolgreich erstellt:", res);

    // Reset + Close
    setFormData({
      firmenname: "",
      kontaktperson: "",
      strasse: "",
      ort: "",
      plz: "",
    });

    setOpenModal(false);
    await refetchLieferanten();
  } catch (error) {
    console.error("Fehler beim Erstellen des Lieferanten:", error);
    alert("Fehler beim Speichern! Siehe Konsole für Details.");
  }
};
  return (
    <BaseContentLayout
      title="Stammdaten"
      primaryCallToActionButton={{
        text: activeTab === "lieferant" ? "Lieferanten anlegen" : "Material anlegen",
        icon: Grid2x2Plus,
        onClick: handleOpen,
        isLoading: isLieferantLoading || isMaterialLoading,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Stammdaten-Tabs"
          textColor="inherit"
          TabIndicatorProps={{ style: { backgroundColor: "black" } }}
        >
          <Tab label="Lieferantenstammdaten" value="lieferant" />
          <Tab label="Materialstammdaten" value="material" />
        </Tabs>

        <Box sx={{ marginTop: 2 }}>
          {activeTab === "lieferant" ? (
            <LieferantTable lieferanten={lieferanten} />
          ) : (
           <MaterialTable />
          )}
        </Box>

        {/* Modals für beide Tabs */}
        <Modal open={openModal} onClose={handleClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              width: 400,
              borderRadius: 2,
            }}
          >
 {activeTab === "lieferant" ? (
  <>
    {console.log("Rendering Lieferant Modal")}
    <Typography variant="h6" gutterBottom>
      Lieferant anlegen
    </Typography>
    <TextField
      label="Firmenname"
      name="firmenname"
      value={formData.firmenname}
      onChange={handleChange}
      fullWidth
      margin="normal"
    />
    <TextField
      label="Kontaktperson"
      name="kontaktperson"
      value={formData.kontaktperson}
      onChange={handleChange}
      fullWidth
      margin="normal"
    />
    <TextField
      label="Straße"
      name="strasse"
      value={formData.strasse}
      onChange={handleChange}
      fullWidth
      margin="normal"
    />
    <TextField
      label="Ort"
      name="ort"
      value={formData.ort}
      onChange={handleChange}
      fullWidth
      margin="normal"
    />
    <TextField
      label="PLZ"
      name="plz"
      value={formData.plz}
      onChange={handleChange}
      fullWidth
      margin="normal"
    />
    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
      <Button variant="contained" color="primary" onClick={handleSubmitLieferant}>
        Speichern
      </Button>
    </Box>
  </>
) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Material anlegen
                </Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="lager-label">Lager</InputLabel>
                  <Select
                    labelId="lager-label"
                    name="lager_ID"
                    value={materialForm.lager_ID}
                    onChange={handleMaterialSelectChange}
                    label="Lager"
                  >
                    {lagerList.map((lager) => (
                      <MenuItem key={lager.lager_ID} value={lager.lager_ID}>
                        {`${lager.bezeichnung}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Kategorie"
                  name="category"
                  value={materialForm.category}
                  onChange={handleMaterialTextFieldChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Farbe"
                  name="farbe"
                  value={materialForm.farbe}
                  onChange={handleMaterialTextFieldChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Typ"
                  name="typ"
                  value={materialForm.typ}
                  onChange={handleMaterialTextFieldChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Größe"
                  name="groesse"
                  value={materialForm.groesse}
                  onChange={handleMaterialTextFieldChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Bild-URL"
                  name="url"
                  value={materialForm.url}
                  onChange={handleMaterialTextFieldChange}
                  fullWidth
                  margin="normal"
                />
                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="contained" color="primary" onClick={handleSubmitMaterial}>
                    Speichern
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>
      </Box>
    </BaseContentLayout>
  );
};

export default Stammdaten;