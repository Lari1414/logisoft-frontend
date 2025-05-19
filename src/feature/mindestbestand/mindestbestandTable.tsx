import { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { mindestbestandApi } from "@/api/endpoints/mindestbestandApi";
import { Mindestbestand } from "@/models/mindestbestand";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface TransformedMindestbestand extends Mindestbestand {
  id: string;
}

interface MindestbestandTableProps {
  onSelectionChange?: (selectedRows: TransformedMindestbestand[]) => void;
}

const MindestbestandTable = ({ onSelectionChange }: MindestbestandTableProps) => {
  // refetch korrekt eingebunden
  const { data, isLoading, error, refetch } = mindestbestandApi.useGetMindestbestaendeQuery();
  const [updateMindestbestand, { isLoading: isUpdating }] = mindestbestandApi.useUpdateMindestbestandMutation();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [editItem, setEditItem] = useState<TransformedMindestbestand | null>(null);
  const [newValue, setNewValue] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const transformedData = useMemo(() => {
    return (data || []).map((item) => ({
      ...item,
      id: item.mindestbestand_ID.toString(),
    }));
  }, [data]);

  useEffect(() => {
    const selected = transformedData.filter((row) => rowSelection[row.id]);
    onSelectionChange?.(selected);
  }, [rowSelection, transformedData, onSelectionChange]);

  const handleRowSelectionChange = useCallback(
    (updater: Updater<RowSelectionState>) => {
      setRowSelection((prev) =>
        typeof updater === "function" ? updater(prev) : updater
      );
    },
    []
  );

  const openEditDialog = (item: TransformedMindestbestand) => {
    setEditItem(item);
    setNewValue(item.mindestbestand.toString());
    setIsDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    const parsedValue = parseInt(newValue);
    if (isNaN(parsedValue)) return;

    try {
      await updateMindestbestand({
        id: parseInt(editItem.id),
        mindestbestand: parsedValue,
      });

      await refetch(); // 🔁 Tabelle nach Update neu laden

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Fehler beim Aktualisieren:", error);
    }
  };

  const columns: ColumnDef<TransformedMindestbestand>[] = [
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
    {
      accessorFn: row => row.mindestbestand_ID,
      id: "mindestbestand_ID",
      header: "ID",
    },
    {
      accessorFn: row => row.material_ID,
      id: "material_ID",
      header: "Material-ID",
    },
    {
      accessorFn: row => row.mindestbestand,
      id: "mindestbestand",
      header: "Mindestbestand",
    },
    {
      id: "aktionen",
      header: "Aktionen",
      cell: ({ row }) => (
        <Button variant="outline" onClick={() => openEditDialog(row.original)}>
          Bearbeiten
        </Button>
      ),
    },
  ];

  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Mindestbestände.</div>;

  return (
    <>
      <DataTable<TransformedMindestbestand>
        data={transformedData}
        columns={columns}
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mindestbestand bearbeiten</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                Neuer Mindestbestand für Material-ID {editItem?.material_ID}
              </label>
              <Input
                type="number"
                min={0}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              Speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MindestbestandTable;
