import { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { orderApi } from "@/api/endpoints/orderApi.ts";
import { Order } from "@/models/order";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Store, Send } from "lucide-react";
import { wareneingangApi } from "@/api/endpoints/wareneingangApi.ts";

interface OrderTableProps {
  onSelectionChange?: (selectedRows: (Order & { id: string })[]) => void;
  setRefetch?: (fn: () => void) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ onSelectionChange, setRefetch }) => {
  const { data, isLoading, error, refetch } = orderApi.useGetOrdersQuery();
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

        const [guterMenge, setGuterMenge] = useState<number>(0);
        const [gesperrtMenge, setGesperrtMenge] = useState<number>(0);
        const [reklamiertMenge, setReklamiertMenge] = useState<number>(0);
        const [menge, setMenge] = useState<number>(order.menge);

        const [guterSaugfaehigkeit, setGuterSaugfaehigkeit] = useState<number>(0);
        const [guterWeissgrad, setGuterWeissgrad] = useState<number>(0);

        const [gesperrtSaugfaehigkeit, setGesperrtSaugfaehigkeit] = useState<number>(0);
        const [gesperrtWeissgrad, setGesperrtWeissgrad] = useState<number>(0);

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
                },
              },
              gesperrterTeil: {
                menge: gesperrtMenge,
                qualitaet: {
                  viskositaet: 0,
                  ppml: 0,
                  saugfaehigkeit: gesperrtSaugfaehigkeit,
                  weissgrad: gesperrtWeissgrad,
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
            {row.original.status === "offen" && (
            <Button onClick={handleSingleAbsenden} disabled={isUpdating} variant="ghost" className="flex items-center gap-2">
              <Send size={18} />
            </Button>
            )}

            {order.status === "bestellt" && (
              <>
              <Button
                variant="ghost"
                onClick={() => {
                  setMenge(order.menge);  // hier setzt du die Menge beim Öffnen zurück
                  setOpenDialog(true);
                }}
                disabled={isCreating}
              >
                <Store className="h-5 w-5" />
              </Button>
             <Dialog open={openDialog} onOpenChange={setOpenDialog}>
  <DialogContent className="max-w-5xl w-full">
    <DialogHeader>
      <DialogTitle>Wareneingang anlegen</DialogTitle>
    </DialogHeader>

    {/* Eingetroffene Menge */}
    <div className="mb-4">
      <label className="block mb-1">eingetroffene Menge</label>
      <input
        type="number"
        value={menge}
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
      </div>

      {/* Reklamierter Teil */}
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
