import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { mindestbestandApi } from "@/api/endpoints/mindestbestandApi";
import { materialApi } from "@/api/endpoints/materialApi";
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
import Select, { components } from "react-select";
import { Trash } from "react-bootstrap-icons";



export interface TransformedMindestbestand extends Mindestbestand {
  id: string;
  category?: string;
  farbe?: string;
  typ?: string;
  groesse?: string;

}

const MindestbestandTable = () => {
  const { data, isLoading, error, refetch } = mindestbestandApi.useGetMindestbestaendeQuery();
  const [updateMindestbestand, { isLoading: isUpdating }] = mindestbestandApi.useUpdateMindestbestandMutation();
  const [createMindestbestand, { isLoading: isCreating }] = mindestbestandApi.useCreateMindestbestandMutation();

  const { data: materialsData } = materialApi.useGetMaterialQuery();
  const [deleteMindestbestand] = mindestbestandApi.useDeleteMindestbestandMutation();

  const [editItem, setEditItem] = useState<TransformedMindestbestand | null>(null);
  const [newValue, setNewValue] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newMaterialId, setNewMaterialId] = useState("");
  const [newMindestbestand, setNewMindestbestand] = useState("");

  const transformedData = useMemo(() => {
    if (!data || !materialsData) return [];

    return data.map((item) => {
      const material = materialsData.find((m) => m.material_ID === item.material_ID);

      return {
        ...item,
        id: item.mindestbestand_ID.toString(),
        category: material?.category || "",
        farbe: material?.farbe || "",
        typ: material?.typ || "",
        groesse: material?.groesse || "",

      };
    });
  }, [data, materialsData]);


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

  const handleDelete = async (id: number) => {
    try {
      await deleteMindestbestand(id).unwrap();
      refetch();
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
    }
  };
  const materialOptions =
    materialsData?.map((m) => ({
      value: m.material_ID,
      label: `${m.typ ?? ""} – ${m.farbe ?? ""} – ${m.groesse ?? ""}`,
      color: m.farbe?.toLowerCase() ?? "transparent",
    })) || [];


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
      accessorFn: (row) => row.category,
      id: "category",
      header: "Kategorie",
    },
    {
      accessorKey: "farbe",
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
    {
      accessorFn: (row) => row.typ,
      id: "typ",
      header: "Typ",
    },
    {
      accessorFn: (row) => row.groesse,
      id: "groesse",
      header: "Größe",
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
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => openEditDialog(row.original)} className="hover:bg-blue-100 rounded" title="Bearbeiten">
            <Pencil size={18} />
          </Button>
          <button onClick={() => handleDelete(row.original.mindestbestand_ID)} className=" hover:bg-red-100 rounded" title="Löschen">
            <Trash size={20} color="red" />
          </button>
        </div>
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
              <label className="text-sm font-medium block mb-1">Material</label>
              <Select
                inputId="material"
                name="material_ID"
                options={materialOptions}
                value={materialOptions.find((m) => m.value.toString() === newMaterialId)}
                onChange={(selected) => {
                  const value = selected ? selected.value.toString() : "";
                  setNewMaterialId(value);
                }}
                components={{ Option: ColourOption, SingleValue: ColourSingleValue }}
                className="mb-4"
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
