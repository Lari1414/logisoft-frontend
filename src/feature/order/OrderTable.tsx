import { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { orderApi } from "@/api/endpoints/orderApi.ts";
import { Order } from "@/models/order";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Select from "react-select";
import { Store, Send, Edit } from "lucide-react";
import { wareneingangApi } from "@/api/endpoints/wareneingangApi.ts";
import { lieferantApi } from "@/api/endpoints/lieferantApi.ts";
import { materialApi } from "@/api/endpoints/materialApi.ts";
import { components } from "react-select";


interface OrderTableProps {
  onSelectionChange?: (selectedRows: (Order & { id: string })[]) => void;
  setRefetch?: (fn: () => void) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ onSelectionChange, setRefetch }) => {
  const { data, isLoading, error, refetch } = orderApi.useGetOrdersQuery();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [, setSelectedOrders] = useState<(Order & { id: string })[]>([]);
  const { data: lieferanten = [] } = lieferantApi.useGetLieferantQuery();
  const { data: materialien = [] } = materialApi.useGetMaterialQuery();

  const materialOptions = materialien
    .filter((m) => m.lager_ID === 1)
    .map((m) => ({
      value: m.material_ID,
      label: `${m.typ} – ${m.farbe} – ${m.groesse}`,
      color: m.farbe?.toLowerCase() ?? "transparent",
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
  const transformedData = useMemo(() => {
    return (data || []).map((item) => ({
      ...item,
      id: item.materialbestellung_ID.toString(),
    }));
  }, [data]);

  const columns: ColumnDef<Order & { id: string }>[] = [
    {
      id: "select",
      header: () => null,
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={() => row.toggleSelected()}
        />
      ),
    },
    { accessorKey: "materialbestellung_ID", header: "Materialbestellung-ID" },
    { accessorKey: "lieferant.firmenname", header: "Lieferantname" },
    { accessorKey: "material.category", header: "Category" },
    {
      accessorKey: "material.farbe",
      header: "Farbe",
      cell: ({ getValue }) => {
        const color = getValue() as string;
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: color }}
            />
            <span>{color}</span>
          </div>
        );
      },
    },
    { accessorKey: "material.typ", header: "Typ" },
    { accessorKey: "material.groesse", header: "Größe" },
    { accessorKey: "menge", header: "Menge" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;

        let bgColor = "";
        let textColor = "text-white";

        if (status === "offen") {
          bgColor = "bg-yellow-500";
        } else if (status === "bestellt") {
          bgColor = "bg-green-600";
        } else {
          bgColor = "bg-gray-400";
        }

        return (
          <span className={`px-2 py-1 rounded ${bgColor} ${textColor}`}>
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Aktionen",
      cell: ({ row }) => {
        const order = row.original;

        const [openDialog, setOpenDialog] = useState(false);
        //Bearbeiten
        const [openEditDialog, setOpenEditDialog] = useState(false);
        const [lieferantId, setLieferantId] = useState(order.lieferant_ID);
        const [materialId, setMaterialId] = useState(order.material_ID);
        const [updateOrder] = orderApi.useUpdateOrderMutation();

        const [guterMenge, setGuterMenge] = useState<number>(0);
        const [gesperrtMenge, setGesperrtMenge] = useState<number>(0);
        const [reklamiertMenge, setReklamiertMenge] = useState<number>(0);
        const [menge, setMenge] = useState<number>(order.menge);

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

        useEffect(() => {
          const sum = guterMenge + gesperrtMenge + reklamiertMenge;
          setMenge(sum);
        }, [guterMenge, gesperrtMenge, reklamiertMenge]);

        const [updateStatus, { isLoading: isUpdating }] = orderApi.useUpdateMultipleOrdersStatusMutation();
        const [createWareneingang, { isLoading: isCreating }] = wareneingangApi.useCreateWareneingangMutation();

        const handleSingleAbsenden = async () => {
          try {
            const response = await updateStatus({ ids: [Number(order.materialbestellung_ID)] }).unwrap();
            console.log(`Erfolgreich aktualisiert: ${response.updatedCount} Bestellung`);
            if (typeof refetch === "function") {
              await refetch();
            }
          } catch (error) {
            console.error("Fehler beim Absenden:", error);
            alert(`Fehler beim Absenden der Bestellung ${order.materialbestellung_ID}!`);
          }
        };
        //bearbeiten
        useEffect(() => {
          if (openEditDialog) {
            setLieferantId(order.lieferant_ID);
            setMaterialId(order.material_ID);
            setMenge(order.menge);
          }
        }, [openEditDialog, order]);

        const handleSave = async () => {
          try {
            await updateOrder({
              id: order.materialbestellung_ID,
              data: {
                lieferant_ID: lieferantId,
                material_ID: materialId,
                menge: menge,
              },
            }).unwrap();
            setOpenEditDialog(false);

          } catch (error) {
            console.log({ lieferantId, materialId, menge });

          }
        };

        const handleWareneingang = async () => {
          try {
            await createWareneingang({
              materialbestellung_ID: order.materialbestellung_ID,
              lieferdatum: new Date().toISOString().split("T")[0],
              menge: menge,
              guterTeil: {
                menge: guterMenge,
                qualitaet: {
                  viskositaet: 0,
                  ppml: 0,
                  saugfaehigkeit: guterSaugfaehigkeit,
                  weissgrad: guterWeissgrad,
                  deltaE: 0
                },
              },
              gesperrterTeil: {
                menge: gesperrtMenge,
                qualitaet: {
                  viskositaet: 0,
                  ppml: 0,
                  saugfaehigkeit: gesperrtSaugfaehigkeit,
                  weissgrad: gesperrtWeissgrad,
                  deltaE: 0
                },
              },
              reklamierterTeil: {
                menge: reklamiertMenge,
              },
            });
            setOpenDialog(false);
            console.log("Wareneingang angelegt materialbestellung_ID: " + order.materialbestellung_ID);
            await refetch();
          } catch (error) {
            console.error("Fehler beim Anlegen:", error);
          }
        };

        return (
          <div className="flex gap-2">
            {row.original.status === "offen" && (
              <>
                <Button
                  onClick={handleSingleAbsenden}
                  disabled={isUpdating}
                  variant="ghost"
                  className="flex items-center hover:bg-green-100 gap-2"
                  title="Absenden"
                >
                  <Send size={18} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setOpenEditDialog(true)}
                  className="flex items-center hover:bg-blue-100 gap-2"
                  title="Bearbeiten"
                >
                  <Edit size={18} />
                </Button>
                {/** Bestellung bearbeiten */}
                <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
                  <DialogContent className="max-w-md w-full">
                    <DialogHeader>
                      <DialogTitle>Bestellung bearbeiten</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 mt-4">
                      {/* Lieferant Select */}
                      <div>
                        <label className="block mb-1 font-medium" htmlFor="lieferant_ID">Lieferant</label>
                        <select
                          id="lieferant_ID"
                          value={lieferantId}
                          onChange={(e) => setLieferantId(Number(e.target.value))}
                          className="w-full border rounded p-2"
                        >
                          <option value="">Bitte wählen</option>
                          {lieferanten.map((l) => (
                            <option key={l.lieferant_ID} value={l.lieferant_ID}>
                              {l.firmenname}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Material Select mit react-select */}
                      <div>
                        <label className="block mb-1 font-medium" htmlFor="material_ID">Material</label>
                        <Select
                          inputId="material_ID"
                          name="material_ID"
                          options={materialOptions}
                          value={materialOptions.find((m) => m.value.toString() === materialId.toString())}
                          onChange={(selected) =>
                            setMaterialId(selected ? Number(selected.value) : 0)
                          }
                          components={{ Option: ColourOption, SingleValue: ColourSingleValue }}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 font-medium">Menge</label>
                        <input
                          type="number"
                          value={menge}
                          onChange={(e) => setMenge(Number(e.target.value))}
                          className="w-full border rounded p-2"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => setOpenEditDialog(false)}>
                        Abbrechen
                      </Button>
                      <Button onClick={handleSave} disabled={isUpdating}>
                        {isUpdating ? "Speichern..." : "Speichern"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}


            {order.status === "bestellt" && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMenge(order.menge);
                    setOpenDialog(true);
                  }}
                  disabled={isCreating}
                  className="flex items-center hover:bg-yellow-100 gap-2"
                  title="Wareneingang anlegen"
                >
                  <Store className="h-5 w-5" />
                </Button>



                {/** Wareneingang Anlegen */}
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogContent className="max-h-[50vh] overflow-y-auto max-w-4xl w-full">
                    <DialogHeader>
                      <DialogTitle>Wareneingang anlegen</DialogTitle>
                    </DialogHeader>

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
                        onChange={(e) => setMenge(Number(e.target.value))}
                        className="w-full border rounded p-2"
                      />
                    </div>

                    {/* Drei Teile nebeneinander */}
                    <div className="flex flex-row gap-4">
                      {/* Guter Teil */}
                      <div className="flex-1 p-4 border rounded">
                        <h3 className="font-semibold mb-2">Guter Teil</h3>
                        <label className="block">Menge</label>
                        <input
                          type="number"
                          value={guterMenge}
                          onChange={(e) => setGuterMenge(Number(e.target.value))}
                          className="w-full mb-2 border rounded p-2"
                        />

                        {order.material.category.toLowerCase() === "t-shirt" ? (
                          <>
                            <label className="block">Saugfähigkeit</label>
                            <input
                              type="number"
                              value={guterSaugfaehigkeit}
                              onChange={(e) => setGuterSaugfaehigkeit(Number(e.target.value))}
                              className="w-full mb-2 border rounded p-2"
                            />
                            <label className="block">Weißgrad</label>
                            <input
                              type="number"
                              value={guterWeissgrad}
                              onChange={(e) => setGuterWeissgrad(Number(e.target.value))}
                              className="w-full border rounded p-2"
                            />
                          </>
                        ) : (
                          <>
                            <label className="block">Viskosität</label>
                            <input
                              type="number"
                              value={guterViskositaet}
                              onChange={(e) => setGuterViskositaet(Number(e.target.value))}
                              className="w-full mb-2 border rounded p-2"
                            />
                            <label className="block">Ppml</label>
                            <input
                              type="number"
                              value={guterPpml}
                              onChange={(e) => setGuterPpml(Number(e.target.value))}
                              className="w-full mb-2 border rounded p-2"
                            />
                            <label className="block">DeltaE</label>
                            <input
                              type="number"
                              value={guterDeltaE}
                              onChange={(e) => setGuterDeltaE(Number(e.target.value))}
                              className="w-full border rounded p-2"
                            />
                          </>
                        )}
                      </div>

                      {/* Gesperrter Teil */}
                      <div className="flex-1 p-4 border rounded">
                        <h3 className="font-semibold mb-2">Gesperrter Teil</h3>
                        <label className="block">Menge</label>
                        <input
                          type="number"
                          value={gesperrtMenge}
                          onChange={(e) => setGesperrtMenge(Number(e.target.value))}
                          className="w-full mb-2 border rounded p-2"
                        />

                        {order.material.category.toLowerCase() === "t-shirt" ? (
                          <>
                            <label className="block">Saugfähigkeit</label>
                            <input
                              type="number"
                              value={gesperrtSaugfaehigkeit}
                              onChange={(e) => setGesperrtSaugfaehigkeit(Number(e.target.value))}
                              className="w-full mb-2 border rounded p-2"
                            />
                            <label className="block">Weißgrad</label>
                            <input
                              type="number"
                              value={gesperrtWeissgrad}
                              onChange={(e) => setGesperrtWeissgrad(Number(e.target.value))}
                              className="w-full border rounded p-2"
                            />
                          </>
                        ) : (
                          <>
                            <label className="block">Viskosität</label>
                            <input
                              type="number"
                              value={gesperrtViskositaet}
                              onChange={(e) => setGesperrtViskositaet(Number(e.target.value))}
                              className="w-full mb-2 border rounded p-2"
                            />
                            <label className="block">Ppml</label>
                            <input
                              type="number"
                              value={gesperrtPpml}
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

                    <div className="mt-6">
                      <Button onClick={handleWareneingang}>Anlegen</Button>
                    </div>
                  </DialogContent>

                </Dialog>


              </>
            )}
          </div>
        );
      },
    },
  ];

  const handleRowSelectionChange = useCallback(
    (updater: Updater<RowSelectionState>) => {
      setRowSelection((prev) =>
        typeof updater === "function" ? updater(prev) : updater
      );
    },
    []
  );

  useEffect(() => {
    const selected = transformedData.filter((row) => rowSelection[row.id]);
    setSelectedOrders(selected);
    onSelectionChange?.(selected);
  }, [rowSelection, transformedData, onSelectionChange]);

  useEffect(() => {
    if (setRefetch) {
      setRefetch(() => refetch);
    }
  }, [refetch, setRefetch]);

  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Daten.</div>;

  return (
    <div className="space-y-4">
      <DataTable
        data={transformedData}
        columns={columns}
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
      />
    </div>
  );
};

export default OrderTable;
