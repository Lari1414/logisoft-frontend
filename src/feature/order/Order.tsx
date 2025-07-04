import { useState, useCallback } from "react";
import { BaseContentLayout } from "@/common/BaseContentLayout";
import { Grid2x2Plus } from "lucide-react";
import { orderApi } from "@/api/endpoints/orderApi";
import { lieferantApi } from "@/api/endpoints/lieferantApi.ts";
import { materialApi } from "@/api/endpoints/materialApi.ts";
import OrderTable from "@/feature/order/OrderTable.tsx";
import OrderOffenTable from "@/feature/order/OrderOffenTable.tsx";
import OrderBestelltTable from "@/feature/order/OrderBestelltTable.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order as OrderModel } from "@/models/order";
import { wareneingangApi } from "@/api/endpoints/wareneingangApi.ts";
import Select from "react-select";
import { Tabs, Tab } from "@mui/material";
import { components } from "react-select";
import { useTheme } from "@/components/dark/theme-provider";


const Order = () => {
  const [createOrder, { isLoading }] = orderApi.useCreateOrderMutation();
  const [selectedOrders, setSelectedOrders] = useState<(OrderModel & { id: string })[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [absendenDialogOpen, setAbsendenDialogOpen] = useState(false);
  const [updateMultipleOrdersStatus] = orderApi.useUpdateMultipleOrdersStatusMutation();
  const [createWareneingang, { isLoading: isCreatingWareneingang }] = wareneingangApi.useCreateWareneingangMutation();
  const [wareneingangDialogOpen, setWareneingangDialogOpen] = useState(false);

  const [refetchOrdersFn, setRefetchOrdersFn] = useState<() => void>(() => () => { });
  const [activeTab, setActiveTab] = useState("alle");

  const [formData, setFormData] = useState({
    lieferant_ID: "",
    material_ID: "",
    menge: "",
  });

  const { data: lieferanten = [] } = lieferantApi.useGetLieferantQuery();
  const { data: materialien = [] } = materialApi.useGetMaterialQuery();


  const [ungueltigeSummen, setUngueltigeSummen] = useState<Record<string, boolean>>({});

  const { isDarkMode } = useTheme();



  const handleSelectionChange = useCallback(
    (rows: (OrderModel & { id: string })[]) => {
      setSelectedOrders(rows);
    },
    []
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    setSelectedOrders([]); // Auswahl beim Tabwechsel zurücksetzen
  };

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
    guterViskositaet: number;
    guterPpml: number;
    guterDeltaE: number;
    gesperrtMenge: number;
    gesperrtSaugfaehigkeit: number;
    gesperrtWeissgrad: number;
    gesperrtViskositaet: number;
    gesperrtPpml: number;
    gesperrtDeltaE: number;
    reklamiertMenge: number;
    eingetroffeneMenge?: number;
  }>>({});

  const openWareneingangDialog = () => {
    const initial: typeof eingaben = {};
    selectedOrders.forEach((order) => {
      initial[order.materialbestellung_ID] = {
        guterMenge: 0,
        guterSaugfaehigkeit: 0,
        guterWeissgrad: 0,
        guterViskositaet: 0,
        guterPpml: 0,
        guterDeltaE: 0,
        gesperrtMenge: 0,
        gesperrtSaugfaehigkeit: 0,
        gesperrtWeissgrad: 0,
        gesperrtViskositaet: 0,
        gesperrtPpml: 0,
        gesperrtDeltaE: 0,
        reklamiertMenge: 0,
      };
    });
    setEingaben(initial);
    setWareneingangDialogOpen(true);
  };

  const handleInputChange = (id: string, field: string, value: number) => {
    setEingaben((prev) => {
      const updated = {
        ...prev,
        [id]: { ...prev[id], [field]: value },
      };

      const guter = updated[id]?.guterMenge || 0;
      const gesperrt = updated[id]?.gesperrtMenge || 0;
      const reklamiert = updated[id]?.reklamiertMenge || 0;
      const summe = guter + gesperrt + reklamiert;

      const eingetroffeneMenge = updated[id]?.eingetroffeneMenge || 0;
      const istUngueltig = summe > eingetroffeneMenge || summe < eingetroffeneMenge;

      setUngueltigeSummen((prevFehler) => ({
        ...prevFehler,
        [id]: istUngueltig,
      }));

      return updated;
    });
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
              viskositaet: e.guterViskositaet,
              ppml: e.guterPpml,
              saugfaehigkeit: e.guterSaugfaehigkeit,
              weissgrad: e.guterWeissgrad,
              deltaE: e.guterDeltaE
            },
          },
          gesperrterTeil: {
            menge: e.gesperrtMenge,
            qualitaet: {
              viskositaet: e.gesperrtViskositaet,
              ppml: e.gesperrtPpml,
              saugfaehigkeit: e.gesperrtSaugfaehigkeit,
              weissgrad: e.gesperrtWeissgrad,
              deltaE: e.gesperrtDeltaE
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
      label: `${m.typ ?? ""} – ${m.farbe ?? ""} – ${m.groesse ?? ""}`,
      color: (m.farbe ?? "transparent").toLowerCase(),
    }));


  const ColourOption = (props: any) => (
    <components.Option {...props}>
      <div className="flex items-center space-x-2">
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: props.data.color || "#ccc",
            border: "1px solid #999",
          }}
        />
        <span>{props.label}</span>
      </div>
    </components.Option>
  );

  const ColourSingleValue = (props: any) => (
    <components.SingleValue {...props}>
      <div className="flex items-center space-x-2">
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: props.data.color || "#ccc",
            border: "1px solid #999",
          }}
        />
        <span>{props.data.label}</span>
      </div>
    </components.SingleValue>
  );


  return (
    <BaseContentLayout
      title="Bestellungen"
      primaryCallToActionButton={{
        text: "Bestellung anlegen",
        icon: Grid2x2Plus,
        onClick: handleOpenModal,
        isLoading: isLoading,
      }}
      secondaryActions={
        <div className="flex gap-2">
          <Button onClick={handleAbsenden} disabled={selectedOrders.length === 0}>
            Absenden
          </Button>
          <Button
            onClick={openWareneingangDialog}
            disabled={selectedOrders.length === 0 || isCreatingWareneingang}
          >
            Wareneingang anlegen
          </Button>
        </div>
      }
    >
      <div className="flex flex-col space-y-4">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="primary"
          className="mb-4"
          sx={{
            color: isDarkMode ? "#fff" : "#000",
            "& .MuiTab-root": {
              color: isDarkMode ? "#ccc" : "#333",
            },
            "& .Mui-selected": {
              color: isDarkMode ? "#fff" : "#1976d2", // blau im Light Mode
            },
            "& .MuiTabs-indicator": {
              backgroundColor: isDarkMode ? "#fff" : "#1976d2", // blau im Light Mode
            },
          }}
        >
          <Tab label="Alle Bestellungen" value="alle" />
          <Tab label="Offene Bestellungen" value="offen" />
          <Tab label="Bestellte Bestellungen" value="bestellt" />
        </Tabs>

        <div>
          {activeTab === "alle" && (
            <OrderTable
              onSelectionChange={handleSelectionChange}
              setRefetch={setRefetchOrdersFn}
            />
          )}
          {activeTab === "offen" && (
            <OrderOffenTable
              onSelectionChange={handleSelectionChange}
              setRefetch={setRefetchOrdersFn}
            />
          )}
          {activeTab === "bestellt" && (
            <OrderBestelltTable
              onSelectionChange={handleSelectionChange}
              setRefetch={setRefetchOrdersFn}
            />
          )}
        </div>
      </div>

      {/* Wareneingang Dialog */}
      <Dialog open={wareneingangDialogOpen} onOpenChange={setWareneingangDialogOpen}>
        <DialogContent className="max-h-[60vh] overflow-y-auto max-w-4xl w-full">
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
            {selectedOrders
              .filter((order) => order.status.toLowerCase() === "bestellt")
              .map((order) => {
                const category = order.material.category.toLowerCase();
                const isTShirt = category === "t-shirt";
                const id = order.materialbestellung_ID.toString();


                // const eingabe = eingaben[id] ?? defaultEingabe;
                const summeUngueltig = ungueltigeSummen[id];

                return (
                  <div
                    key={id}
                    className="p-4 border rounded w-full sm:w-[48%] md:w-[30%] flex-grow"
                  >
                    <h3 className="font-semibold mb-2">Bestellung {id}</h3>
                    {/* bestellte Menge */}
                    <div className="mb-4">
                      <label className="block mb-1 font-medium">Die bestellte Menge</label>
                      <div className="w-full border rounded p-2 bg-gray-100">
                        {order.menge}
                      </div>
                    </div>
                    {/* Eingetroffene Menge */}
                    <div className="mb-4">
                      <label className="block mb-1">eingetroffene Menge</label>
                      <input
                        type="number"
                        value={eingaben[id]?.eingetroffeneMenge ?? ''}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setEingaben(prev => ({
                            ...prev,
                            [id]: {
                              ...prev[id],
                              eingetroffeneMenge: value,
                            }
                          }));
                        }}
                        className="w-full border rounded p-2"
                      />
                    </div>

                    {/* Guter Teil */}
                    <div className="mb-2">
                      <span className="font-semibold">Guter Teil</span>
                      <label className="block text-sm mt-1">Menge</label>
                      <input
                        type="number"

                        onChange={(e) => handleInputChange(id, "guterMenge", Number(e.target.value))}
                        className="mb-2 w-full"
                      />

                      {isTShirt ? (
                        <>
                          <label className="block text-sm">Saugfähigkeit</label>
                          <input
                            type="number"

                            onChange={(e) => handleInputChange(id, "guterSaugfaehigkeit", Number(e.target.value))}
                            className="mb-2 w-full"
                          />
                          <label className="block text-sm">Weißgrad</label>
                          <input
                            type="number"

                            onChange={(e) => handleInputChange(id, "guterWeissgrad", Number(e.target.value))}
                            className="w-full"
                          />
                        </>
                      ) : (
                        <>
                          <label className="block text-sm">Viskosität</label>
                          <input
                            type="number"

                            onChange={(e) => handleInputChange(id, "guterViskositaet", Number(e.target.value))}
                            className="mb-2 w-full"
                          />
                          <label className="block text-sm">Ppml</label>
                          <input
                            type="number"

                            onChange={(e) => handleInputChange(id, "guterPpml", Number(e.target.value))}
                            className="mb-2 w-full"
                          />
                          <label className="block text-sm">DeltaE</label>
                          <input
                            type="number"

                            onChange={(e) => handleInputChange(id, "guterDeltaE", Number(e.target.value))}
                            className="w-full"
                          />
                        </>
                      )}
                    </div>

                    {/* Gesperrter Teil */}
                    <div className="mb-2">
                      <span className="font-semibold">Gesperrter Teil</span>
                      <label className="block text-sm mt-1">Menge</label>
                      <input
                        type="number"

                        onChange={(e) => handleInputChange(id, "gesperrtMenge", Number(e.target.value))}
                        className="mb-2 w-full"
                      />

                      {isTShirt ? (
                        <>
                          <label className="block text-sm">Saugfähigkeit</label>
                          <input
                            type="number"

                            onChange={(e) => handleInputChange(id, "gesperrtSaugfaehigkeit", Number(e.target.value))}
                            className="mb-2 w-full"
                          />
                          <label className="block text-sm">Weißgrad</label>
                          <input
                            type="number"

                            onChange={(e) => handleInputChange(id, "gesperrtWeissgrad", Number(e.target.value))}
                            className="w-full"
                          />
                        </>
                      ) : (
                        <>
                          <label className="block text-sm">Viskosität</label>
                          <input
                            type="number"

                            onChange={(e) => handleInputChange(id, "gesperrtViskositaet", Number(e.target.value))}
                            className="mb-2 w-full"
                          />
                          <label className="block text-sm">Ppml</label>
                          <input
                            type="number"

                            onChange={(e) => handleInputChange(id, "gesperrtPpml", Number(e.target.value))}
                            className="mb-2 w-full"
                          />
                          <label className="block text-sm">DeltaE</label>
                          <input
                            type="number"

                            onChange={(e) => handleInputChange(id, "gesperrtDeltaE", Number(e.target.value))}
                            className="w-full"
                          />
                        </>
                      )}
                    </div>

                    {/* Reklamierter Teil */}
                    <div>
                      <span className="font-semibold">Reklamierter Teil</span>
                      <label className="block text-sm mt-1">Menge</label>
                      <input
                        type="number"

                        onChange={(e) => handleInputChange(id, "reklamiertMenge", Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    {
                      summeUngueltig && (
                        <div className="text-red-500 mt-2">
                          Die Summe aus gut, gesperrt und reklamiert muss der eingetroffenen Menge entsprechen
                        </div>
                      )
                    }
                  </div>

                );

              })}
          </div>

          <div className="flex justify-end mt-6 gap-4">
            <Button variant="outline" onClick={() => setWareneingangDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleMultiWareneingang} disabled={Object.values(ungueltigeSummen).some(value => value === true)}>
              Wareneingang anlegen
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Bestellung anlegen Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bestellung anlegen</DialogTitle>
          </DialogHeader>

          <label htmlFor="lieferant">Lieferant</label>
          <select
            id="lieferant"
            name="lieferant_ID"
            value={formData.lieferant_ID}
            onChange={handleFormChange}
            className="mb-4 w-full"
          >
            <option value="">Bitte wählen</option>
            {lieferanten.map((l) => (
              <option key={l.lieferant_ID} value={l.lieferant_ID}>
                {l.firmenname}
              </option>
            ))}
          </select>

          <label htmlFor="material">Material</label>
          <Select
            inputId="material"
            name="material_ID"
            options={materialOptions}
            value={materialOptions.find((m) => m.value.toString() === formData.material_ID)}
            onChange={(selected) =>
              setFormData((prev) => ({ ...prev, material_ID: selected ? selected.value.toString() : "" }))
            }
            components={{ Option: ColourOption, SingleValue: ColourSingleValue }}
            className="mb-4"
          />


          <label htmlFor="menge">Menge</label>
          <input
            type="number"
            id="menge"
            name="menge"
            value={formData.menge}
            onChange={handleFormChange}
            className="mb-6 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={1}
          />

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleCloseModal}>
              Abbrechen
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              Anlegen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Absenden Dialog */}
      <Dialog open={absendenDialogOpen} onOpenChange={setAbsendenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bestellungen absenden</DialogTitle>
          </DialogHeader>
          <p>Sollen die ausgewählten Bestellungen als „Bestellt“ markiert werden?</p>
          <div className="flex justify-end mt-6 gap-4">
            <Button variant="outline" onClick={() => setAbsendenDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={confirmAbsenden}>Ja, absenden</Button>
          </div>
        </DialogContent>
      </Dialog>
    </BaseContentLayout>

  );
};

export default Order;
