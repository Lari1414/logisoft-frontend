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
import { useGetLagerQuery } from "@/api/endpoints/lagerApi.ts";

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

  const { data: lagerList = [] } = useGetLagerQuery();
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
    { accessorKey: "url", header: "Url" },
    {
      id: "actions",
      header: "Aktionen",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => openEditDialog(row.original)} className="p-2 text-blue-600 hover:bg-blue-100 rounded" title="Bearbeiten">
           <Pencil size={18} />
          </Button>
          <button onClick={() => handleDelete(row.original.material_ID)} className=" hover:bg-red-100 rounded" title="Löschen">
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

    {editItem && (
      <div className="grid grid-cols-2 gap-4">
        {/* Kategorie */}
        <div>
          <label className="block font-medium mb-1">Kategorie</label>
      
          <select
          name="category"
          value={formData.category}
          onChange={(e) => handleInputChange("category", e.target.value)}
          className="w-full border rounded p-2"
          >
          <option value="">Bitte auswählen</option>
          <option value="T-Shirt">T-Shirt</option>
          <option value="Farbe">Farbe</option>
          <option value="Druckfolie">Druckfolie</option>
           <option value="Verpackung">Verpackung</option>
        </select>
        </div>

        {/* Typ */}
        <div>
          <label className="block font-medium mb-1">Typ</label>
          
          <select
          name="typ"
          value={formData.typ}
         onChange={(e) => handleInputChange("typ", e.target.value)}
          className="w-full border rounded p-2"
          >
          <option value="">Bitte auswählen</option>
          <option value="Sport">Sport</option>
          <option value="Top">Top</option>
          <option value="Rundhals">Rundhals</option>
          <option value="Oversize">Oversize</option>
          <option value="Standardfarbe">Standardfarbe</option>
        </select>
        </div>

        {/* Größe */}
        <div>
          <label className="block font-medium mb-1">Größe</label>
          <select
          name="groesse"
          value={formData.groesse}
           onChange={(e) => handleInputChange("groesse", e.target.value)}
          className="w-full border rounded p-2"
          >
          <option value="">Bitte auswählen</option>
          <option value="XS">XS</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <option value="XXL">XXL</option>
        </select>
        </div>

        {/* URL */}
        <div>
          <label className="block font-medium mb-1">URL</label>
          <Input
            placeholder="URL"
            value={formData.url || ""}
            onChange={(e) => handleInputChange("url", e.target.value)}
          />
        </div>

        {/* Lager-ID */}

         <div className="col-span-2">
          <label className="block font-medium mb-1">Lager</label>
          <select
            name="lager_ID"
            value={formData.lager_ID || ""}
           onChange={(e) => handleInputChange("lager_ID", Number(e.target.value))}
            className="w-full border rounded px-2 py-2"
          >
            <option value="">Lager auswählen</option>
            {lagerList.map((lager) => (
              <option key={lager.lager_ID} value={lager.lager_ID}>
                {lager.bezeichnung}
              </option>
            ))}
          </select>
        </div>

        {/* Standardmaterial */}
        <div>
          <label className="block font-medium mb-1" htmlFor="standardmaterial">Standardmaterial</label>
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
        </div>

        {/* Farbe-Preview + Eingaben (volle Breite) */}
        <div className="col-span-2">
          <div className="flex items-center space-x-3 mb-2">
            <label className="block font-medium">Farbe</label>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: "1px solid #ccc",
                backgroundColor: (() => {
                  const c = formData.farbe_json?.cyan || 0;
                  const m = formData.farbe_json?.magenta || 0;
                  const y = formData.farbe_json?.yellow || 0;
                  const k = formData.farbe_json?.black || 0;
                  const r = 255 * (1 - c / 100) * (1 - k / 100);
                  const g = 255 * (1 - m / 100) * (1 - k / 100);
                  const b = 255 * (1 - y / 100) * (1 - k / 100);
                  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
                })(),
              }}
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex flex-col w-1/4">
              <label htmlFor="cyan" className="mb-1 text-sm font-medium">Cyan</label>
              <Input
                id="cyan"
                placeholder="Cyan"
                value={formData.farbe_json?.cyan || 0}
                onChange={(e) => handleColorChange("cyan", e.target.value)}
              />
            </div>
            <div className="flex flex-col w-1/4">
              <label htmlFor="magenta" className="mb-1 text-sm font-medium">Magenta</label>
              <Input
                id="magenta"
                placeholder="Magenta"
                value={formData.farbe_json?.magenta || 0}
                onChange={(e) => handleColorChange("magenta", e.target.value)}
              />
            </div>
            <div className="flex flex-col w-1/4">
              <label htmlFor="yellow" className="mb-1 text-sm font-medium">Yellow</label>
              <Input
                id="yellow"
                placeholder="Yellow"
                value={formData.farbe_json?.yellow || 0}
                onChange={(e) => handleColorChange("yellow", e.target.value)}
              />
            </div>
            <div className="flex flex-col w-1/4">
              <label htmlFor="black" className="mb-1 text-sm font-medium">Black</label>
              <Input
                id="black"
                placeholder="Black"
                value={formData.farbe_json?.black || 0}
                onChange={(e) => handleColorChange("black", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Speichern Button volle Breite */}
        <div className="col-span-2 mt-4">
          <Button onClick={handleUpdate}>Speichern</Button>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>

    </>
  );
};

export default MaterialTable;
