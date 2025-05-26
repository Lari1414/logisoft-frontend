import { useEffect, useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table.tsx";
import { materialApi } from "@/api/endpoints/materialApi.ts";
import { lagerApi } from "@/api/endpoints/lagerApi.ts";
import { Trash } from "react-bootstrap-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "react-bootstrap-icons";

interface Material {
  material_ID: number;          
  lager_ID: number;
  category: string;
  farbe: string;
  farbe_json: {
    cyan: number;
    magenta: number;
    yellow: number;
    black: number;
  };       
  standardmaterial: boolean;
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
  const { data: lagerData } = lagerApi.useGetLagerQuery();

  const [editItem, setEditItem] = useState<Material | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Material>>({});

  useEffect(() => {
    if (onRefetch && refetch) {
      onRefetch(refetch);
    }
  }, [onRefetch, refetch]);


  const lagerMap = useMemo(() => {
  const map: Record<number, string> = {};
  (lagerData || []).forEach((lager) => {
    map[lager.lager_ID] = lager.bezeichnung;
  });
  return map;
}, [lagerData]);

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
 setFormData({
  ...item,
  farbe_json: {
    cyan: item.farbe_json.cyan || 0,
    magenta: item.farbe_json.magenta || 0,
    yellow: item.farbe_json.yellow || 0,
    black: item.farbe_json.black || 0,
  },
});
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
        farbe_json: {
          cyan: formData.farbe_json?.cyan || 0,
          magenta: formData.farbe_json?.magenta || 0,
          yellow: formData.farbe_json?.yellow || 0,
          black: formData.farbe_json?.black || 0,
        },
        standardmaterial: formData.standardmaterial!,
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

const handleInputChange = (field: keyof Material, value: string | number | boolean) => {
  setFormData((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const handleColorChange = (colorField: keyof Material["farbe_json"], value: string) => {
  setFormData((prev) => ({
    ...prev,
    farbe_json: {
      ...prev.farbe_json ?? {
        cyan: 0,
        magenta: 0,
        yellow: 0,
        black: 0,
      },
      [colorField]: value,
    },
  }));
};

  const columns: ColumnDef<Material & { id: string }>[] = [
    { accessorKey: "material_ID", header: "ID" },
    {
      accessorKey: "lager_ID",
      header: "Lager",
      cell: ({ getValue }) => {
        const lagerId = getValue() as number;
        const bezeichnung = lagerMap[lagerId] || `ID: ${lagerId}`;
        return <span>{bezeichnung}</span>;
      },
    },
    { accessorKey: "category", header: "Kategorie" },
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
           <Pencil size={18} />
          </Button>
          <button onClick={() => handleDelete(row.original.material_ID)}>
            <Trash size={20} color="red" />
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

      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Cyan"
          value={formData.farbe_json?.cyan || 0}
          onChange={(e) => handleColorChange("cyan", e.target.value)}
        />
        <Input
          placeholder="Magenta"
          value={formData.farbe_json?.magenta || 0}
          onChange={(e) => handleColorChange("magenta", e.target.value)}
        />
        <Input
          placeholder="Yellow"
          value={formData.farbe_json?.yellow || 0}
          onChange={(e) => handleColorChange("yellow", e.target.value)}
        />
        <Input
          placeholder="Black"
          value={formData.farbe_json?.black || 0}
          onChange={(e) => handleColorChange("black", e.target.value)}
        />
      </div>

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
  
     <label className="block mb-1 font-medium" htmlFor="standardmaterial">
          Standard Material
        </label>
        <select
          id="standardmaterial"
          name="standardmaterial"
          value={formData.standardmaterial ? "true" : "false"}
          onChange={(e) =>
            handleInputChange("standardmaterial", e.target.value === "true")
          }
          className="w-full border rounded px-2 py-2"
        >
          <option value="true">Ja</option>
          <option value="false">Nein</option>
        </select>

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
