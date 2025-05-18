import { useState, useCallback } from "react";
import { BaseContentLayout } from "@/common/BaseContentLayout";
import { Grid2x2Plus } from "lucide-react";
import { orderApi } from "@/api/endpoints/orderApi";
import { lieferantApi } from "@/api/endpoints/lieferantApi.ts";
import { materialApi } from "@/api/endpoints/materialApi.ts";
import OrderTable from "@/feature/order/OrderTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order as OrderModel } from "@/models/order";

const Order = () => {
  const [createOrder, { isLoading }] = orderApi.useCreateOrderMutation();
  const [selectedOrders, setSelectedOrders] = useState<(OrderModel & { id: string })[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [absendenDialogOpen, setAbsendenDialogOpen] = useState(false);
  const [updateMultipleOrdersStatus] = orderApi.useUpdateMultipleOrdersStatusMutation();

  const [formData, setFormData] = useState({
    lieferant_ID: "",
    material_ID: "",
    menge: "",
  });

  const { data: lieferanten = [] } = lieferantApi.useGetLieferantQuery();
  const { data: materialien = [] } = materialApi.useGetMaterialQuery();

  const handleSelectionChange = useCallback(
    (rows: (OrderModel & { id: string })[]) => {
      setSelectedOrders(rows);
    },
    []
  );

  const handleOpenModal = () => setModalOpen(true);

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({
      lieferant_ID: "",
      material_ID: "",
      menge: "",
    });
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const lieferantID = parseInt(formData.lieferant_ID, 10);
    const materialID = parseInt(formData.material_ID, 10);
    const menge = parseInt(formData.menge, 10);

    if (isNaN(lieferantID) || isNaN(materialID) || isNaN(menge) || menge <= 0) {
      alert("Bitte gültige Werte eingeben.");
      return;
    }

    try {
      await createOrder({
        lieferant_ID: lieferantID,
        material_ID: materialID,
        menge: menge,
      }).unwrap();
      handleCloseModal();
    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
      alert("Fehler beim Speichern!");
    }
  };

  const handleAbsenden = () => {
    if (selectedOrders.length === 0) return;
    setAbsendenDialogOpen(true);
  };

  const confirmAbsenden = async () => {
    if (selectedOrders.length === 0) return;

    const ids = selectedOrders.map((order) => Number(order.materialbestellung_ID));

    try {
      const response = await updateMultipleOrdersStatus({ ids }).unwrap();
      console.log(`Erfolgreich aktualisiert: ${response.updatedCount} Bestellungen`);

      setAbsendenDialogOpen(false);
      setSelectedOrders([]);
    } catch (error) {
      console.error("Fehler beim Absenden:", error);
      alert("Fehler beim Absenden der Bestellungen!");
    }
  };

  return (
    <BaseContentLayout title="Bestellungen">
      <OrderTable onSelectionChange={handleSelectionChange} />

      <div className="flex gap-4 mb-4">
        <Button onClick={handleOpenModal} disabled={isLoading}>
          <Grid2x2Plus className="mr-2 h-4 w-4" />
          Bestellung anlegen
        </Button>
        <Button onClick={handleAbsenden} disabled={selectedOrders.length === 0}>
          Absenden
        </Button>
      </div>

      {/* Modal zur Bestellungserstellung */}
      <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Bestellung anlegen</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="block mb-1 font-medium">Lieferant auswählen</label>
              <select
                name="lieferant_ID"
                value={formData.lieferant_ID}
                onChange={handleFormChange}
                className="w-full border rounded px-2 py-2"
              >
                <option value="">Bitte wählen</option>
                {lieferanten.map((l) => (
                  <option key={l.lieferant_ID} value={l.lieferant_ID}>
                    {l.firmenname}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Material auswählen</label>
              <select
                name="material_ID"
                value={formData.material_ID}
                onChange={handleFormChange}
                className="w-full border rounded px-2 py-2"
              >
                <option value="">Bitte wählen</option>
                {materialien.map((m) => (
                  <option key={m.material_ID} value={m.material_ID}>
                    {m.typ} – {m.farbe} – {m.groesse}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Menge</label>
              <input
                type="number"
                name="menge"
                value={formData.menge}
                onChange={handleFormChange}
                className="w-full border rounded px-2 py-2"
                min="1"
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="mt-2"
              disabled={!formData.lieferant_ID || !formData.material_ID || !formData.menge}
            >
              Speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Absenden Dialog */}
      <Dialog open={absendenDialogOpen} onOpenChange={() => setAbsendenDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bestellungen absenden</DialogTitle>
          </DialogHeader>

          {selectedOrders.map((item) => (
            <div key={item.materialbestellung_ID} className="mb-4 p-4 border rounded space-y-1 text-sm">
              <div className="font-bold">Materialbestellung-ID: {item.materialbestellung_ID}</div>
              <div>Material-ID: {item.material_ID}</div>
              <div>Lieferant-ID: {item.lieferant_ID}</div>
              <div>Status: {item.status ?? "–"}</div>
            </div>
          ))}

          <Button onClick={confirmAbsenden} className="mt-4" disabled={selectedOrders.length === 0}>
            Bestätigen
          </Button>
        </DialogContent>
      </Dialog>
    </BaseContentLayout>
  );
};

export default Order;
