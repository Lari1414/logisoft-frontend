import { useEffect, useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table.tsx";
import { materialApi } from "@/api/endpoints/materialApi.ts";
import { Trash } from "react-bootstrap-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Material {
  material_ID: number;
  lager_ID: number;
  category: string;
  farbe: string;
  typ: string;
  groesse: string;
  url: string;
}

interface MaterialTableProps {
  onRefetch?: (refetchFn: () => void) => void;
}

const MaterialTable = ({ onRefetch }: MaterialTableProps) => {
  const { data, isLoading, error, refetch } = materialApi.useGetMaterialQuery();
  const [deleteMaterial] = materialApi.useDeleteMaterialMutation();
  const [updateMaterial] = materialApi.useUpdateMaterialMutation();

  const [editItem, setEditItem] = useState<Material | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Material>>({});

  useEffect(() => {
    if (onRefetch && refetch) {
      onRefetch(refetch);
    }
  }, [onRefetch, refetch]);

  const handleDelete = async (id: number) => {
    try {
      await deleteMaterial(id).unwrap();
      refetch();
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
    }
  };

  const openEditDialog = (item: Material) => {
    setEditItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

const handleUpdate = async () => {
  if (!editItem) return;

  try {
    await updateMaterial({
      id: editItem.material_ID,
      data: {
        lager_ID: formData.lager_ID!,
        category: formData.category!,
        farbe: formData.farbe!,
        typ: formData.typ!,
        groesse: formData.groesse!,
        url: formData.url!,
      },
    }).unwrap();

    refetch();
    setIsDialogOpen(false);
  } catch (err) {
    console.error("Fehler beim Aktualisieren:", err);
  }
};
  const handleInputChange = (field: keyof Material, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const columns: ColumnDef<Material & { id: string }>[] = [
    { accessorKey: "material_ID", header: "ID" },
    { accessorKey: "lager_ID", header: "Lager" },
    { accessorKey: "category", header: "Kategorie" },
    { accessorKey: "farbe", header: "Farbe" },
    { accessorKey: "typ", header: "Typ" },
    { accessorKey: "groesse", header: "Größe" },
    {
      accessorKey: "url",
      header: "URL",
      cell: ({ getValue }) => {
        const url = getValue() as string;
        return (
          <a href={url} target="_blank" rel="noopener noreferrer">
            Link
          </a>
        );
      },
    },
    {
      id: "actions",
      header: "Aktionen",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openEditDialog(row.original)}>
            Bearbeiten
          </Button>
          <button onClick={() => handleDelete(row.original.material_ID)}>
            <Trash size={20} />
          </button>
        </div>
      ),
    },
  ];

  const transformedData = useMemo(() => {
    return (data || []).map((item) => ({
      ...item,
      id: item.material_ID.toString(),
    }));
  }, [data]);

  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Materialien.</div>;

  return (
    <>
      <DataTable data={transformedData} columns={columns} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Material bearbeiten</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {editItem && (
              <>
                <Input
                  placeholder="Kategorie"
                  value={formData.category || ""}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                />
                <Input
                  placeholder="Farbe"
                  value={formData.farbe || ""}
                  onChange={(e) => handleInputChange("farbe", e.target.value)}
                />
                <Input
                  placeholder="Typ"
                  value={formData.typ || ""}
                  onChange={(e) => handleInputChange("typ", e.target.value)}
                />
                <Input
                  placeholder="Größe"
                  value={formData.groesse || ""}
                  onChange={(e) => handleInputChange("groesse", e.target.value)}
                />
                <Input
                  placeholder="URL"
                  value={formData.url || ""}
                  onChange={(e) => handleInputChange("url", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Lager-ID"
                  value={formData.lager_ID || ""}
                  onChange={(e) => handleInputChange("lager_ID", Number(e.target.value))}
                />
                <Button onClick={handleUpdate}>Speichern</Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MaterialTable;
