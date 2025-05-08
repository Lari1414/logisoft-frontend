import React, { useState } from "react";
import { BaseContentLayout } from "@/common/BaseContentLayout.tsx"; 
import { Grid2x2Plus } from "lucide-react";
import { lieferantApi } from "@/api/endpoints/lieferantApi.ts";
import { materialApi } from "@/api/endpoints/materialApi.ts";
import { adresseApi } from "@/api/endpoints/adresseApi.ts";
import LieferantTable from "@/feature/Lieferant/LieferantTable.tsx";
import MaterialTable from "@/feature/material/MaterialTable.tsx";
import { useGetLagerQuery } from "@/api/endpoints/lagerApi.ts";
import { Modal, Box, Button, TextField, Typography, Tabs, Tab, MenuItem, Select, InputLabel, FormControl } from "@mui/material";

const Stammdaten = () => {
  const [activeTab, setActiveTab] = useState("lieferant");
  const [createLieferant, { isLoading }] = lieferantApi.useCreateLieferantMutation();
  const [createAdresse] = adresseApi.useCreateAdresseMutation();
  const [openModal, setOpenModal] = useState(false);

  const [formData, setFormData] = useState({
    firmenname: "",
    kontaktperson: "",
    strasse: "",
    ort: "",
    plz: "",
  });

  const { data: lagerList = [], isLoading: isLagerLoading } = useGetLagerQuery();
  const [createMaterial] = materialApi.useCreateMaterialMutation();

  const [materialForm, setMaterialForm] = useState({
    lager_ID: "",
    category: "",
    farbe: "",
    typ: "",
    groesse: "",
    url: "",
  });

  const handleMaterialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMaterialForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMaterialSubmit = async () => {
    try {
      await createMaterial({
        lager_ID: parseInt(materialForm.lager_ID),
        category: materialForm.category,
        farbe: materialForm.farbe,
        typ: materialForm.typ,
        groesse: materialForm.groesse,
        url: materialForm.url,
      });
      setOpenModal(false);
    } catch (error) {
      console.error("Fehler beim Erstellen des Materials:", error);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const adresseRes = await createAdresse({
        strasse: formData.strasse,
        ort: formData.ort,
        plz: parseInt(formData.plz),
      }).unwrap();

      await createLieferant({
        firmenname: formData.firmenname,
        kontaktperson: formData.kontaktperson,
        adresse_ID: adresseRes.adresse_ID,
      });

      setOpenModal(false);
    } catch (error) {
      console.error("Fehler beim Erstellen des Lieferanten:", error);
    }
  };

  return (
    <BaseContentLayout
      title="Stammdaten"
      primaryCallToActionButton={{
        text: activeTab === "lieferant" ? "Lieferanten anlegen" : "Material anlegen",
        icon: Grid2x2Plus,
        onClick: handleOpen,
        isLoading,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        {/* Tabs */}
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Stammdaten-Tabs">
          <Tab label="Lieferantenstammdaten" value="lieferant"   textColor="inherit"  TabIndicatorProps={{ style: { backgroundColor: 'black' } }}/>
          <Tab label="Materialstammdaten" value="material"   textColor="inherit"  TabIndicatorProps={{ style: { backgroundColor: 'black' } }}/>
        </Tabs>

        {/* Content je nach Tab */}
        <Box sx={{ marginTop: 2 }}>
          {activeTab === "lieferant" ? <LieferantTable /> : <MaterialTable />}
        </Box>

        {/* Modal nur für Lieferant – Material brauchst du ein eigenes ggf. */}
        {activeTab === "lieferant" && (
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
                type="number"
              />
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                  Speichern
                </Button>
              </Box>
            </Box>
          </Modal>
        )}

        {/* Modal für Material */}
        {activeTab === "material" && (
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
              <Typography variant="h6" gutterBottom>
                Material anlegen
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel id="lager-label">Lager ID</InputLabel>
                <Select
                  labelId="lager-label"
                  name="lager_ID"
                  value={materialForm.lager_ID}
                  onChange={handleMaterialChange}
                  label="Lager"
                >
                  {lagerList.map((lager) => (
                    <MenuItem key={lager.lager_ID} value={lager.lager_ID}>
                      {lager.name || `Lager #${lager.lager_ID}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Kategorie"
                name="category"
                value={materialForm.category}
                onChange={handleMaterialChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Farbe"
                name="farbe"
                value={materialForm.farbe}
                onChange={handleMaterialChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Typ"
                name="typ"
                value={materialForm.typ}
                onChange={handleMaterialChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Größe"
                name="groesse"
                value={materialForm.groesse}
                onChange={handleMaterialChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Bild-URL"
                name="url"
                value={materialForm.url}
                onChange={handleMaterialChange}
                fullWidth
                margin="normal"
              />
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" color="primary" onClick={handleMaterialSubmit}>
                  Speichern
                </Button>
              </Box>
            </Box>
          </Modal>
        )}
      </Box>
    </BaseContentLayout>
  );
};

export default Stammdaten;
