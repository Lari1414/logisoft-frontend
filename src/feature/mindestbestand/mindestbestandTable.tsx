import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { mindestbestandApi } from "@/api/endpoints/mindestbestandApi";
import { Mindestbestand } from "@/models/mindestbestand";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "react-bootstrap-icons";

export interface TransformedMindestbestand extends Mindestbestand {
  id: string;
}

const MindestbestandTable = () => {
  const { data, isLoading, error, refetch } = mindestbestandApi.useGetMindestbestaendeQuery();
  const [updateMindestbestand, { isLoading: isUpdating }] = mindestbestandApi.useUpdateMindestbestandMutation();
  const [createMindestbestand, { isLoading: isCreating }] = mindestbestandApi.useCreateMindestbestandMutation();

  const [editItem, setEditItem] = useState<TransformedMindestbestand | null>(null);
  const [newValue, setNewValue] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newMaterialId, setNewMaterialId] = useState("");
  const [newMindestbestand, setNewMindestbestand] = useState("");

  const transformedData = useMemo(() => {
    return (data || []).map((item) => ({
      ...item,
      id: item.mindestbestand_ID.toString(),
    }));
  }, [data]);

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
      await refetch();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Fehler beim Aktualisieren:", error);
    }
  };

  const handleCreate = async () => {
    const materialIdNum = parseInt(newMaterialId);
    const mindestbestandNum = parseInt(newMindestbestand);

    if (isNaN(materialIdNum) || isNaN(mindestbestandNum) || mindestbestandNum < 0) return;

    try {
      await createMindestbestand({
        material_ID: materialIdNum,
        mindestbestand: mindestbestandNum,
      });
      await refetch();
      setIsCreateDialogOpen(false);
      setNewMaterialId("");
      setNewMindestbestand("");
    } catch (error) {
      console.error("Fehler beim Anlegen:", error);
    }
  };

  const columns: ColumnDef<TransformedMindestbestand>[] = [
    {
      accessorFn: (row) => row.mindestbestand_ID,
      id: "mindestbestand_ID",
      header: "ID",
    },
    {
      accessorFn: (row) => row.material_ID,
      id: "material_ID",
      header: "Material-ID",
    },
    {
      accessorFn: (row) => row.mindestbestand,
      id: "mindestbestand",
      header: "Mindestbestand",
    },
    {
      id: "aktionen",
      header: "Aktionen",
      cell: ({ row }) => (
        <Button variant="ghost" onClick={() => openEditDialog(row.original)} className="hover:bg-blue-100 rounded" title="Bearbeiten">
            <Pencil size={18} />
        </Button>
      ),
    },
  ];

  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Mindestbestände.</div>;

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          + Neuer Mindestbestand
        </Button>
      </div>

      <DataTable<TransformedMindestbestand> data={transformedData} columns={columns} />

      {/* Bearbeiten Dialog */}
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

      {/* Neuer Eintrag Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Mindestbestand anlegen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Material-ID</label>
              <Input
                type="number"
                min={1}
                value={newMaterialId}
                onChange={(e) => setNewMaterialId(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Mindestbestand</label>
              <Input
                type="number"
                min={0}
                value={newMindestbestand}
                onChange={(e) => setNewMindestbestand(e.target.value)}
              />
            </div>
            <Button onClick={handleCreate} disabled={isCreating}>
              Anlegen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MindestbestandTable;
