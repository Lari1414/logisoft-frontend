import { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { orderApi } from "@/api/endpoints/orderApi.ts";
import { Order } from "@/models/order";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import { wareneingangApi } from "@/api/endpoints/wareneingangApi.ts";

interface OrderBestelltTableProps {
  onSelectionChange?: (selectedRows: (Order & { id: string })[]) => void;
  setRefetch?: (fn: () => void) => void;
}

const OrderBestelltTable: React.FC<OrderBestelltTableProps> = ({ onSelectionChange, setRefetch }) => {
  const { data, isLoading, error, refetch } = orderApi.useGetbestelltOrdersQuery();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [, setSelectedOrders] = useState<(Order & { id: string })[]>([]);

  const transformedData = useMemo(() => {
    return (data || []).map((item) => ({
      ...item,
      id: item.materialbestellung_ID.toString(),
    }));
  }, [data]);

  const columns: ColumnDef<Order & { id: string }>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
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

        const [guterMenge, setGuterMenge] = useState<number>(0);
        const [gesperrtMenge, setGesperrtMenge] = useState<number>(0);
        const [reklamiertMenge, setReklamiertMenge] = useState<number>(0);
        const [menge, setMenge] = useState<number>(order.menge);
        const [summeUngueltig, setSummeUngueltig] = useState(false);

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



        const [createWareneingang, { isLoading: isCreating }] = wareneingangApi.useCreateWareneingangMutation();

        useEffect(() => {
          const summe = guterMenge + gesperrtMenge + reklamiertMenge;
          setSummeUngueltig(summe > menge || summe < menge);
        }, [menge, guterMenge, gesperrtMenge, reklamiertMenge]);


        const handleWareneingang = async () => {
          console.count("handleWareneingang triggered");
          try {
            await createWareneingang({
              materialbestellung_ID: order.materialbestellung_ID,
              lieferdatum: new Date().toISOString().split("T")[0],
              menge: menge,
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
            setOpenDialog(false);
          } catch (error) {
            console.error("Fehler beim Anlegen:", error);
          }
        };

        return (
          <div className="flex gap-2">

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

                          onChange={(e) => setGuterMenge(Number(e.target.value))}
                          className="w-full mb-2 border rounded p-2"
                        />

                        {order.material.category.toLowerCase() === "t-shirt" ? (
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
                              className="w-full border rounded p-2"
                            />
                          </>
                        ) : (
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
                        <label className="block">Menge</label>
                        <input
                          type="number"

                          onChange={(e) => setGesperrtMenge(Number(e.target.value))}
                          className="w-full mb-2 border rounded p-2"
                        />

                        {order.material.category.toLowerCase() === "t-shirt" ? (
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

                              onChange={(e) => setGesperrtWeissgrad(Number(e.target.value))}
                              className="w-full border rounded p-2"
                            />
                          </>
                        ) : (
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

                          onChange={(e) => setReklamiertMenge(Number(e.target.value))}
                          className="w-full border rounded p-2"
                        />
                      </div>

                    </div>

                    <div className="mt-6">
                      {summeUngueltig && (
                        <div className="text-red-500 mt-2">
                          Die Summe aus gut, gesperrt und reklamiert muss der eingetroffenen Menge entsprechen
                        </div>
                      )}
                      <Button onClick={handleWareneingang} disabled={summeUngueltig}>Anlegen</Button>
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

export default OrderBestelltTable;
