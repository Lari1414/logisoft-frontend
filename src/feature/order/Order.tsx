import React, { useState } from "react";
import { BaseContentLayout } from "@/common/BaseContentLayout.tsx";
import { Grid2x2Plus } from "lucide-react";
import { orderApi } from "@/api/endpoints/orderApi.ts";
import OrderTable from "@/feature/order/OrderTable.tsx";

import {
  Modal,
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";

const Order = () => {
  const [openModal, setOpenModal] = useState(false);
  const [createOrder, { isLoading }] = orderApi.useCreateOrderMutation();

  const [formData, setFormData] = useState({
    lieferant_ID: "",
    material_ID: "",
    status: "bestellt",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => {
    setOpenModal(false);
    setFormData({
      lieferant_ID: "",
      material_ID: "",
      status: "bestellt",
    });
  };

 const handleSubmit = async () => {
  const lieferantID = parseInt(formData.lieferant_ID, 10);
  const materialID = parseInt(formData.material_ID, 10);

  if (isNaN(lieferantID) || isNaN(materialID)) {
    alert("Bitte geben Sie gültige Lieferant-ID und Material-ID ein.");
    return;
  }

  try {
    await createOrder({
      lieferant_ID: lieferantID,
      material_ID: materialID,
      status: formData.status,
    }).unwrap();

    handleClose();
  } catch (error) {
    console.error("Fehler beim Erstellen der Bestellung:", error);
    alert("Fehler beim Speichern! Siehe Konsole.");
  }
};

  return (
    <BaseContentLayout
      title="Bestellungen"
      primaryCallToActionButton={{
        text: "Bestellung anlegen",
        icon: Grid2x2Plus,
        onClick: handleOpen,
        isLoading,
      }}
    >
      <OrderTable />

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
            Neue Bestellung anlegen
          </Typography>

          <TextField
            label="Lieferant ID"
            name="lieferant_ID"
            value={formData.lieferant_ID}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="number"
          />

          <TextField
            label="Material ID"
            name="material_ID"
            value={formData.material_ID}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="number"
          />

          <TextField
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Speichern
            </Button>
          </Box>
        </Box>
      </Modal>
    </BaseContentLayout>
  );
};

export default Order;