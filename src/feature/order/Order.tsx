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
import { wareneingangApi } from "@/api/endpoints/wareneingangApi.ts";
import Select from "react-select";

const Order = () => {
  const [createOrder, { isLoading }] = orderApi.useCreateOrderMutation();
  const [selectedOrders, setSelectedOrders] = useState<(OrderModel & { id: string })[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [absendenDialogOpen, setAbsendenDialogOpen] = useState(false);
  const [updateMultipleOrdersStatus] = orderApi.useUpdateMultipleOrdersStatusMutation();
  const [createWareneingang, { isLoading: isCreatingWareneingang }] = wareneingangApi.useCreateWareneingangMutation();
  const [wareneingangDialogOpen, setWareneingangDialogOpen] = useState(false);

  const [refetchOrdersFn, setRefetchOrdersFn] = useState<() => void>(() => () => {});

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
    setFormData({ lieferant_ID: "", material_ID: "", menge: "" });
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const lieferantID = parseInt(formData.lieferant_ID, 10);
    const materialID = parseInt(formData.material_ID, 10);
    const menge = parseInt(formData.menge, 10);

    if (isNaN(lieferantID) || isNaN(materialID) || isNaN(menge) || menge <= 0) return;

    try {
      await createOrder({ lieferant_ID: lieferantID, material_ID: materialID, menge }).unwrap();
      await refetchOrdersFn();
      handleCloseModal();
    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
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
      await updateMultipleOrdersStatus({ ids }).unwrap();
      await refetchOrdersFn();
      setAbsendenDialogOpen(false);
      setSelectedOrders([]);
    } catch (error) {
      console.error("Fehler beim Absenden:", error);
    }
  };

  const [lieferdatum, setLieferdatum] = useState(new Date().toISOString().slice(0, 10));
  const [eingaben, setEingaben] = useState<Record<string, {
    guterMenge: number;
    guterSaugfaehigkeit: number;
    guterWeissgrad: number;
    gesperrtMenge: number;
    gesperrtSaugfaehigkeit: number;
    gesperrtWeissgrad: number;
    reklamiertMenge: number;
  }>>({});

  const openWareneingangDialog = () => {
    const initial: typeof eingaben = {};
    selectedOrders.forEach((order) => {
      initial[order.materialbestellung_ID] = {
        guterMenge: 0,
        guterSaugfaehigkeit: 0,
        guterWeissgrad: 0,
        gesperrtMenge: 0,
        gesperrtSaugfaehigkeit: 0,
        gesperrtWeissgrad: 0,
        reklamiertMenge: 0,
      };
    });
    setEingaben(initial);
    setWareneingangDialogOpen(true);
  };

  const handleInputChange = (id: string, field: string, value: number) => {
    setEingaben((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleMultiWareneingang = async () => {
    try {
      for (const order of selectedOrders) {
        const e = eingaben[order.materialbestellung_ID];
        const menge = e.guterMenge + e.gesperrtMenge + e.reklamiertMenge;

        if (menge <= 0) {
          console.warn(`Menge für Bestellung ${order.materialbestellung_ID} ist ungültig`);
          continue;
        }
        await createWareneingang({
          materialbestellung_ID: order.materialbestellung_ID,
          lieferdatum,
          menge,
          guterTeil: {
            menge: e.guterMenge,
            qualitaet: {
              viskositaet: 0,
              ppml: 0,
              saugfaehigkeit: e.guterSaugfaehigkeit,
              weissgrad: e.guterWeissgrad,
            },
          },
          gesperrterTeil: {
            menge: e.gesperrtMenge,
            qualitaet: {
              viskositaet: 0,
              ppml: 0,
              saugfaehigkeit: e.gesperrtSaugfaehigkeit,
              weissgrad: e.gesperrtWeissgrad,
            },
          },
          reklamierterTeil: {
            menge: e.reklamiertMenge,
          },
        });
      }
      await refetchOrdersFn();
      setSelectedOrders([]);
      setWareneingangDialogOpen(false);
    } catch (error) {
      console.error("Fehler beim Anlegen der Wareneingänge:", error);
    }
  };

 const materialOptions = materialien
  .filter((m) => m.lager_ID === 1)
  .map((m) => ({
    value: m.material_ID,
    label: `${m.typ} – ${m.farbe} – ${m.groesse}`,
    color: m.farbe?.toLowerCase() ?? "transparent",
  }));

  return (
    <BaseContentLayout title="Bestellungen">
      <OrderTable onSelectionChange={handleSelectionChange} setRefetch={setRefetchOrdersFn} />

      <div className="flex gap-4 mb-4">
        <Button onClick={handleOpenModal} disabled={isLoading}>
          <Grid2x2Plus className="mr-2 h-4 w-4" />
          Bestellung anlegen
        </Button>
        <Button onClick={handleAbsenden} disabled={selectedOrders.length === 0}>
          Absenden
        </Button>
        <Button onClick={openWareneingangDialog} disabled={selectedOrders.length === 0 || isCreatingWareneingang}>
          Wareneingang anlegen
        </Button>
      </div>

   <Dialog open={wareneingangDialogOpen} onOpenChange={setWareneingangDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Wareneingang für ausgewählte Bestellungen</DialogTitle>
    </DialogHeader>

    <label>Lieferdatum</label>
    <input
      type="date"
      value={lieferdatum}
      onChange={(e) => setLieferdatum(e.target.value)}
      className="mb-4 w-full"
    />

    <div className="flex flex-wrap gap-4">
      {selectedOrders.map((order) => (
        <div
          key={order.materialbestellung_ID}
          className="p-4 border rounded w-full sm:w-[48%] md:w-[30%] flex-grow"
        >
          <h3 className="font-semibold mb-2">Bestellung {order.materialbestellung_ID}</h3>

          <div className="mb-2">
            <span className="font-semibold">Guter Teil</span>
            <label className="block text-sm mt-1">Menge</label>
            <input
              type="number"
              value={eingaben[order.materialbestellung_ID]?.guterMenge || 0}
              onChange={(e) =>
                handleInputChange(order.materialbestellung_ID.toString(), "guterMenge", Number(e.target.value))
              }
              className="mb-2 w-full"
            />
            <label className="block text-sm">Saugfähigkeit</label>
            <input
              type="number"
              value={eingaben[order.materialbestellung_ID]?.guterSaugfaehigkeit || 0}
              onChange={(e) =>
                handleInputChange(order.materialbestellung_ID.toString(), "guterSaugfaehigkeit", Number(e.target.value))
              }
              className="mb-2 w-full"
            />
            <label className="block text-sm">Weißgrad</label>
            <input
              type="number"
              value={eingaben[order.materialbestellung_ID]?.guterWeissgrad || 0}
              onChange={(e) =>
                handleInputChange(order.materialbestellung_ID.toString(), "guterWeissgrad", Number(e.target.value))
              }
              className="mb-2 w-full"
            />
          </div>

          <div className="mb-2 border-t pt-2">
            <span className="font-semibold">Gesperrter Teil</span>
            <label className="block text-sm mt-1">Menge</label>
            <input
              type="number"
              value={eingaben[order.materialbestellung_ID]?.gesperrtMenge || 0}
              onChange={(e) =>
                handleInputChange(order.materialbestellung_ID.toString(), "gesperrtMenge", Number(e.target.value))
              }
              className="mb-2 w-full"
            />
            <label className="block text-sm">Saugfähigkeit</label>
            <input
              type="number"
              value={eingaben[order.materialbestellung_ID]?.gesperrtSaugfaehigkeit || 0}
              onChange={(e) =>
                handleInputChange(order.materialbestellung_ID.toString(), "gesperrtSaugfaehigkeit", Number(e.target.value))
              }
              className="mb-2 w-full"
            />
            <label className="block text-sm">Weißgrad</label>
            <input
              type="number"
              value={eingaben[order.materialbestellung_ID]?.gesperrtWeissgrad || 0}
              onChange={(e) =>
                handleInputChange(order.materialbestellung_ID.toString(), "gesperrtWeissgrad", Number(e.target.value))
              }
              className="mb-2 w-full"
            />
          </div>

          <div className="border-t pt-2">
            <span className="font-semibold">Reklamierter Teil</span>
            <label className="block text-sm mt-1">Menge</label>
            <input
              type="number"
              value={eingaben[order.materialbestellung_ID]?.reklamiertMenge || 0}
              onChange={(e) =>
                handleInputChange(order.materialbestellung_ID.toString(), "reklamiertMenge", Number(e.target.value))
              }
              className="mb-2 w-full"
            />
          </div>
        </div>
      ))}
    </div>

    <Button onClick={handleMultiWareneingang}>Anlegen</Button>
  </DialogContent>
</Dialog>
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
            <Select
              options={materialOptions}
              value={materialOptions.find(opt => opt.value === Number(formData.material_ID)) || null}
              onChange={(selectedOption) => {
                setFormData((prev) => ({
                  ...prev,
                  material_ID: selectedOption ? selectedOption.value.toString() : "",
                }));
              }}
              formatOptionLabel={({ label, color }) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      backgroundColor: color,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: "1px solid #ccc",
                    }}
                  />
                  <span>{label}</span>
                </div>
              )}
              isClearable
            />
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
