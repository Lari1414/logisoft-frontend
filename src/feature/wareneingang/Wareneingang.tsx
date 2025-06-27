import { Grid2x2Plus } from "lucide-react";
import { useState, useCallback } from "react";
import { wareneingangApi } from "@/api/endpoints/wareneingangApi.ts";
import { orderApi } from "@/api/endpoints/orderApi.ts"; // Hier deinen Order-API-Slice importieren
import { BaseContentLayout } from "@/common/BaseContentLayout.tsx";
import WareneingangTable, { WareneingangData } from "@/feature/wareneingang/WareneingangTable";
import ReklamationTable, { ReklamationData } from "@/feature/wareneingang/ReklamationTable.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, Tab } from "@mui/material";
import { useTheme } from "@/components/dark/theme-provider";


const Wareneingang = () => {
  const [activeTab, setActiveTab] = useState("wareneingang");
  const [storeRohmaterial] = wareneingangApi.useStoreRohmaterialMutation();
  const [deleteWareneingang] = wareneingangApi.useDeleteWareneingangMutation();
  const [createWareneingang] = wareneingangApi.useCreateWareneingangMutation();
  const [sperreWareneingaenge] = wareneingangApi.useSperreWareneingaengeMutation();
  const [entsperreWareneingang] = wareneingangApi.useEntsperreWareneingangMutation();


  const [selectedRows, setSelectedRows] = useState<WareneingangData[]>([]);
  const [modalType, setModalType] = useState<"einlagern" | "sperren" | "entsperren" | "anlegen" | null>(null);
  const { isDarkMode } = useTheme();

  const [refetchTable, setRefetchTable] = useState<(() => void) | null>(null);
  const einlagerbareRows = selectedRows.filter(row => row.status === "eingetroffen");
  const entsperrbareRows = selectedRows.filter(row => row.status === "gesperrt");

  const { data: bestelltOrders, isLoading, error } = orderApi.useGetbestelltOrdersQuery();

  const [neuerWareneingang, setNeuerWareneingang] = useState({
    materialbestellung_ID: 0,
    menge: 0,
    lieferdatum: "",
    materialDetails: {
      category: "",
      farbe: "",
      typ: "",
      groesse: ""
    },
    qualitaet: {
      viskositaet: 0,
      ppml: 0,
      saugfaehigkeit: 0,
      weissgrad: 0,
      deltaE: 0
    }
  });

  type MaterialKey = keyof typeof neuerWareneingang.materialDetails;


  const [guterMenge, setGuterMenge] = useState<number>(0);
  const [gesperrtMenge, setGesperrtMenge] = useState<number>(0);
  const [reklamiertMenge, setReklamiertMenge] = useState<number>(0);
  const [guterSaugfaehigkeit, setGuterSaugfaehigkeit] = useState<number>(0);
  const [guterWeissgrad, setGuterWeissgrad] = useState<number>(0);
  const [guterViskositaet, setGuterViskositaet] = useState<number>(0);
  const [guterPpml, setGuterPpml] = useState<number>(0);
  const [guterDeltaE, setGuterDeltaE] = useState<number>(0);

  const [gesperrtSaugfaehigkeit, setGesperrtSaugfaehigkeit] = useState<number>(0);
  const [gesperrtWeissgrad, setGesperrtWeissgrad] = useState<number>(0);
  const [gesperrtViskositaet, setGesperrtViskositaet] = useState<number>(0);
  const [gesperrtPpml, setGesperrtPpml] = useState<number>(0);
  const [gesperrtDeltaE, setGesperrtDeltaE] = useState<number>(0);


  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };
  const handleEinlagernClick = () => setModalType("einlagern");
  const handleSperrenClick = () => setModalType("sperren");

  const handleSelectionChange = useCallback((rows: WareneingangData[]) => {
    setSelectedRows(rows.filter(Boolean));
  }, []);
  const handleReklamationSelection = useCallback((rows: ReklamationData[]) => {
    // z.B. separat behandeln oder ignorieren
    console.log("Reklamation selected", rows);
  }, []);

  const confirmEinlagerung = async () => {
    const gefilterteRows = selectedRows.filter(row => row.status === "eingetroffen");

    if (gefilterteRows.length === 0) {
      alert("die gesperrten Materialen können nicht einlagert werden");
      return;
    }

    const ids = gefilterteRows.map(item => item.eingang_ID);

    try {
      await storeRohmaterial({ ids });
      for (const id of ids) {
        await deleteWareneingang(id);
      }
      if (refetchTable) refetchTable();
    } catch (error) {
      console.error("Fehler beim Einlagern:", error);
    }

    setModalType(null);
    setSelectedRows([]);

  };

  const confirmSperre = async () => {
    try {
      const ids = selectedRows.map(item => item.eingang_ID);
      console.log("selectedRows", selectedRows);
      await sperreWareneingaenge({ ids }).unwrap();
      if (refetchTable) refetchTable();
    } catch (error) {
      console.error(error);
    }
    setModalType(null);
    setSelectedRows([]);
  };

  const handleEntsperrenClick = () => setModalType("entsperren");

  const confirmEntsperren = async () => {
    const ids = selectedRows.map(item => item.eingang_ID);
    console.log("Entsperren:", ids);
    try {
      const result = await entsperreWareneingang({ ids }).unwrap();
      console.log("Entsperren erfolgreich:", result);
      if (refetchTable) refetchTable();
    } catch (error) {
      console.error("Fehler beim Entsperren:", error);
    }
    setModalType(null);
    setSelectedRows([]);
  };

  const handleEntsperrenRow = async (row: WareneingangData) => {
    try {
      await entsperreWareneingang({ ids: [row.eingang_ID] }).unwrap();
      if (refetchTable) refetchTable();

    } catch (error) {
      console.error("Fehler beim Entsperren:", error);
    }
  };


  const handleEinlagernRow = async (row: WareneingangData) => {
    try {
      await storeRohmaterial({ ids: [row.eingang_ID] });
      await deleteWareneingang(row.eingang_ID);
      if (refetchTable) refetchTable();
    } catch (error) {
      console.error("Fehler beim Einlagern:", error);
    }
  };

  const handleCreateWareneingang = async () => {
    try {
      await createWareneingang({
        materialbestellung_ID: neuerWareneingang.materialbestellung_ID,
        lieferdatum: new Date().toISOString().split("T")[0],
        menge: neuerWareneingang.menge,
        guterTeil: {
          menge: guterMenge,
          qualitaet: {
            viskositaet: guterViskositaet,
            ppml: guterPpml,
            saugfaehigkeit: guterSaugfaehigkeit,
            weissgrad: guterWeissgrad,
            deltaE: guterDeltaE
          },
        },
        gesperrterTeil: {
          menge: gesperrtMenge,
          qualitaet: {
            viskositaet: gesperrtViskositaet,
            ppml: gesperrtPpml,
            saugfaehigkeit: gesperrtSaugfaehigkeit,
            weissgrad: gesperrtWeissgrad,
            deltaE: gesperrtDeltaE
          },
        },
        reklamierterTeil: {
          menge: reklamiertMenge,
        },
      });

      setModalType(null);
      if (refetchTable) refetchTable();

      // Eingabefelder zurücksetzen
      setNeuerWareneingang({
        materialbestellung_ID: 0,
        menge: 0,
        lieferdatum: "",
        materialDetails: { category: "", farbe: "", typ: "", groesse: "" },
        qualitaet: { viskositaet: 0, ppml: 0, saugfaehigkeit: 0, weissgrad: 0, deltaE: 0 }
      });
      setGuterMenge(0);
      setGesperrtMenge(0);
      setReklamiertMenge(0);
      setGuterSaugfaehigkeit(0);
      setGuterWeissgrad(0);
      setGesperrtSaugfaehigkeit(0);
      setGesperrtWeissgrad(0);

    } catch (error) {
      console.error("Fehler beim Anlegen:", error);
    }
  };


  const handleSperrenRow = async (row: WareneingangData) => {
    try {
      await sperreWareneingaenge({ ids: [row.eingang_ID] }).unwrap();
      if (refetchTable) refetchTable();
    } catch (error) {
      console.error("Fehler beim Sperren:", error);
    }
  };

  return (


    <BaseContentLayout
      title="Wareneingang"
      primaryCallToActionButton={
        activeTab === "wareneingang"
          ? {
            text: "Wareneingang anlegen",
            icon: Grid2x2Plus,
            onClick: () => setModalType("anlegen"),
            isLoading: false,
          }
          : undefined
      }
      secondaryActions={
        activeTab === "wareneingang" ? (
          <div className="flex gap-2">
            <Button onClick={handleEinlagernClick} disabled={einlagerbareRows.length === 0}>
              <Grid2x2Plus className="mr-2 h-4 w-4" />
              Einlagern
            </Button>
            <Button onClick={handleSperrenClick} disabled={entsperrbareRows.length === 0}>
              Sperren
            </Button>
            <Button onClick={handleEntsperrenClick} disabled={entsperrbareRows.length === 0}>
              Entsperren
            </Button>
          </div>
        ) : undefined
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
          <Tab label="Wareneingang" value="wareneingang" />
          <Tab label="Reklamation" value="reklamation" />
        </Tabs>

        {activeTab === "wareneingang" ? (
          <WareneingangTable
            onSelectionChange={handleSelectionChange}
            setRefetch={setRefetchTable}
            onEinlagernRow={handleEinlagernRow}
            onSperrenRow={handleSperrenRow}
            onEntsperrenRow={handleEntsperrenRow}
          />
        ) : (
          <ReklamationTable
            onSelectionChange={handleReklamationSelection}
            setRefetch={setRefetchTable}
          />
        )}
      </div>



      {/* Einlagern Dialog */}
      <Dialog open={modalType === "einlagern"} onOpenChange={() => setModalType(null)}>
        <DialogContent className="max-h-[60vh] overflow-y-auto max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Waren einlagern</DialogTitle>
          </DialogHeader>

          {selectedRows.filter(row => row.status === "eingetroffen").map((item) => (
            <div key={item.material_ID} className="mb-4 p-4 border rounded space-y-1 text-sm">
              <div className="font-bold">Material-ID: {item.material_ID}</div>
              <div>Menge: {item.menge}</div>
              <div>Farbe: {item.material?.farbe ?? ""}</div>
              <div>Typ: {item.material?.typ ?? ""}</div>
              <div>Größe: {item.material?.groesse ?? ""}</div>
              <div>Kategorie: {item.material?.category ?? ""}</div>
              <div>Qualität-ID: {item.qualitaet_ID}</div>
              <div>
                Bild: <a href={item.material?.url ?? ""} target="_blank" rel="noreferrer" className="text-blue-600 underline">Link</a>
              </div>
            </div>
          ))}
          <Button onClick={confirmEinlagerung} className="mt-4" disabled={selectedRows.length === 0}>
            Bestätigen
          </Button>
        </DialogContent>
      </Dialog>

      {/* Sperren Dialog */}
      <Dialog open={modalType === "sperren"} onOpenChange={() => setModalType(null)}>
        <DialogContent className="max-h-[60vh] overflow-y-auto max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Waren sperren</DialogTitle>
          </DialogHeader>
          {selectedRows.filter(row => row.status === "eingetroffen").map((item) => (
            <div key={item.material_ID} className="mb-4 p-4 border rounded space-y-1 text-sm">
              <div className="font-bold">Material-ID: {item.material_ID}</div>
              <div>Menge: {item.menge}</div>
              <div>Farbe: {item.material?.farbe ?? ""}</div>
              <div>Typ: {item.material?.typ ?? ""}</div>
              <div>Größe: {item.material?.groesse ?? ""}</div>
              <div>Kategorie: {item.material?.category ?? ""}</div>
              <div>Qualität-ID: {item.qualitaet_ID}</div>
              <div>
                Bild: <a href={item.material?.url ?? ""} target="_blank" rel="noreferrer" className="text-blue-600 underline">Link</a>
              </div>
            </div>
          ))}
          <Button onClick={confirmSperre} className="mt-4" disabled={selectedRows.length === 0}>
            Sperren bestätigen
          </Button>
        </DialogContent>
      </Dialog>

      {/* Entsperren Dialog */}
      <Dialog open={modalType === "entsperren"} onOpenChange={() => setModalType(null)}>
        <DialogContent className="max-h-[60vh] overflow-y-auto max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Waren entsperren</DialogTitle>
          </DialogHeader>
          {selectedRows.filter(row => row.status === "gesperrt").map((item) => (
            <div key={item.material_ID} className="mb-4 p-4 border rounded space-y-1 text-sm">
              <div className="font-bold">Material-ID: {item.material_ID}</div>
              <div>Menge: {item.menge}</div>
              <div>Farbe: {item.material?.farbe ?? ""}</div>
              <div>Typ: {item.material?.typ ?? ""}</div>
              <div>Größe: {item.material?.groesse ?? ""}</div>
              <div>Kategorie: {item.material?.category ?? ""}</div>
              <div>Qualität-ID: {item.qualitaet_ID}</div>
              <div>
                Bild: <a href={item.material?.url ?? ""} target="_blank" rel="noreferrer" className="text-blue-600 underline">Link</a>
              </div>
            </div>
          ))}
          <Button onClick={confirmEntsperren} className="mt-4" disabled={selectedRows.length === 0}>
            Entsperren bestätigen
          </Button>
        </DialogContent>
      </Dialog>

      {/* Wareneingang anlegen Dialog */}
      <Dialog open={modalType === "anlegen"} onOpenChange={() => setModalType(null)}>
        <DialogContent className="max-h-[60vh] overflow-y-auto max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Neuen Wareneingang anlegen</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Materialbestellung ID</label>

              {isLoading ? (
                <div>Lade Bestellungen...</div>
              ) : error ? (
                <div className="text-red-600">Fehler beim Laden der Bestellungen</div>
              ) : (
                <select
                  value={neuerWareneingang.materialbestellung_ID}
                  onChange={(e) => {
                    const selectedId = Number(e.target.value);
                    const selectedOrder = bestelltOrders?.find(order => order.materialbestellung_ID === selectedId);

                    const category = bestelltOrders?.find(order => order.materialbestellung_ID === selectedId)?.material?.category;
                    setNeuerWareneingang({
                      ...neuerWareneingang,
                      materialbestellung_ID: selectedId,
                      materialDetails: {
                        category: category ?? "",
                        farbe: selectedOrder?.material?.farbe ?? "",
                        typ: selectedOrder?.material?.typ ?? "",
                        groesse: selectedOrder?.material?.groesse ?? "",
                      }
                    });
                  }}
                  className="w-full border rounded p-2"
                >
                  <option value={0} disabled>
                    Bitte Bestellung auswählen
                  </option>
                  {bestelltOrders?.map((order) => (
                    <option key={order.materialbestellung_ID} value={order.materialbestellung_ID}>
                      Bestellung ID {order.materialbestellung_ID} {/* Optional weitere Infos, z.B. order.beschreibung */}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {/* bestellte Menge */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Die bestellte Menge</label>
              <div className="w-full border rounded p-2 bg-gray-100">
                {
                  bestelltOrders?.find(order => order.materialbestellung_ID === neuerWareneingang.materialbestellung_ID)?.menge ?? "—"
                }
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Menge</label>
              <input
                type="number"
                value={neuerWareneingang.menge}
                onChange={(e) =>
                  setNeuerWareneingang({ ...neuerWareneingang, menge: Number(e.target.value) })
                }
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Lieferdatum</label>
              <input
                type="datetime-local"
                value={neuerWareneingang.lieferdatum}
                onChange={(e) =>
                  setNeuerWareneingang({ ...neuerWareneingang, lieferdatum: e.target.value })
                }
                className="w-full border rounded p-2"
              />
            </div>
            <h4 className="font-bold mt-4">Materialdetails</h4>

            {(Object.keys(neuerWareneingang.materialDetails) as MaterialKey[]).map((key) => {
              const value = neuerWareneingang.materialDetails[key];

              if (key === "farbe") {
                // Hier wird angenommen, dass value eine hex- oder rgb-Farbe ist (z. B. "#ff0000" oder "rgb(255,0,0)")
                return (
                  <div key={key}>
                    <div className="flex items-center space-x-3 mb-1">
                      <label className="block font-medium">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: "1px solid #ccc",
                          backgroundColor: value, // Direkt die Farbe als CSS-Wert
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      value={value}
                      disabled
                      className="w-full border rounded p-2 bg-gray-100 text-gray-500"
                    />
                  </div>
                );
              }

              // Standardfall für andere Felder
              return (
                <div key={key}>
                  <label className="block font-medium mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <input
                    type="text"
                    value={value}
                    disabled
                    className="w-full border rounded p-2 bg-gray-100 text-gray-500"
                  />
                </div>
              );
            })}

            <h4 className="font-bold mt-4">Qualität</h4>

            <div className="flex flex-row gap-4">
              {/* Guter Teil */}
              <div className="flex-1 p-4 border rounded">
                <h3 className="font-semibold mb-2">Guter Teil</h3>


                <>
                  <label className="block">Menge</label>
                  <input
                    type="number"

                    onChange={(e) => setGuterMenge(Number(e.target.value))}
                    className="w-full mb-2 border rounded p-2"
                  />
                </>


                {/* Saugfähigkeit und Weißgrad nur bei T-Shirt */}
                {neuerWareneingang.materialDetails.category.toLowerCase() === "t-shirt" && (
                  <>
                    <label className="block">Saugfähigkeit</label>
                    <input
                      type="number"

                      onChange={(e) => setGuterSaugfaehigkeit(Number(e.target.value))}
                      className="w-full mb-2 border rounded p-2"
                    />

                    <label className="block">Weißgrad</label>
                    <input
                      type="number"

                      onChange={(e) => setGuterWeissgrad(Number(e.target.value))}
                      className="w-full mb-2 border rounded p-2"
                    />
                  </>
                )}

                {/* Viskosität, Ppml, DeltaE nur bei Nicht-T-Shirt */}
                {neuerWareneingang.materialDetails.category.toLowerCase() !== "t-shirt" && (
                  <>
                    <label className="block">Viskosität</label>
                    <input
                      type="number"

                      onChange={(e) => setGuterViskositaet(Number(e.target.value))}
                      className="w-full mb-2 border rounded p-2"
                    />
                    <label className="block">Ppml</label>
                    <input
                      type="number"

                      onChange={(e) => setGuterPpml(Number(e.target.value))}
                      className="w-full mb-2 border rounded p-2"
                    />
                    <label className="block">DeltaE</label>
                    <input
                      type="number"

                      onChange={(e) => setGuterDeltaE(Number(e.target.value))}
                      className="w-full border rounded p-2"
                    />
                  </>
                )}
              </div>

              {/* Gesperrter Teil */}
              <div className="flex-1 p-4 border rounded">
                <h3 className="font-semibold mb-2">Gesperrter Teil</h3>

                {neuerWareneingang.materialDetails.category.toLowerCase() !== "t-shirt" && (
                  <>
                    <label className="block">Menge</label>
                    <input
                      type="number"

                      onChange={(e) => setGesperrtMenge(Number(e.target.value))}
                      className="w-full mb-2 border rounded p-2"
                    />
                  </>
                )}

                {/* Saugfähigkeit und Weißgrad nur bei T-Shirt */}
                {neuerWareneingang.materialDetails.category.toLowerCase() === "t-shirt" && (
                  <>
                    <label className="block">Saugfähigkeit</label>
                    <input
                      type="number"

                      onChange={(e) => setGesperrtSaugfaehigkeit(Number(e.target.value))}
                      className="w-full mb-2 border rounded p-2"
                    />

                    <label className="block">Weißgrad</label>
                    <input
                      type="number"
                      value={gesperrtWeissgrad}
                      onChange={(e) => setGesperrtWeissgrad(Number(e.target.value))}
                      className="w-full mb-2 border rounded p-2"
                    />
                  </>
                )}

                {/* Viskosität, Ppml, DeltaE nur bei Nicht-T-Shirt */}
                {neuerWareneingang.materialDetails.category.toLowerCase() !== "t-shirt" && (
                  <>
                    <label className="block">Viskosität</label>
                    <input
                      type="number"

                      onChange={(e) => setGesperrtViskositaet(Number(e.target.value))}
                      className="w-full mb-2 border rounded p-2"
                    />
                    <label className="block">Ppml</label>
                    <input
                      type="number"

                      onChange={(e) => setGesperrtPpml(Number(e.target.value))}
                      className="w-full mb-2 border rounded p-2"
                    />
                    <label className="block">DeltaE</label>
                    <input
                      type="number"
                      value={gesperrtDeltaE}
                      onChange={(e) => setGesperrtDeltaE(Number(e.target.value))}
                      className="w-full border rounded p-2"
                    />
                  </>
                )}
              </div>

              {/* Reklamierter Teil nur bei Nicht-T-Shirt */}

              <div className="flex-1 p-4 border rounded">
                <h3 className="font-semibold mb-2">Reklamierter Teil</h3>
                <label className="block">Menge</label>
                <input
                  type="number"
                  value={reklamiertMenge}
                  onChange={(e) => setReklamiertMenge(Number(e.target.value))}
                  className="w-full border rounded p-2"
                />
              </div>

            </div>

          </div>

          <Button
            onClick={handleCreateWareneingang}
            className="mt-4"
            disabled={neuerWareneingang.materialbestellung_ID === 0 || neuerWareneingang.menge <= 0}
          >
            Anlegen
          </Button>
        </DialogContent>
      </Dialog>
    </BaseContentLayout>
  );
};

export default Wareneingang;