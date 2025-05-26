// LieferantTable.tsx
import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { lieferantApi } from "@/api/endpoints/lieferantApi";
import { adresseApi } from "@/api/endpoints/adresseApi";
import { Trash } from "react-bootstrap-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lieferant, Adresse } from "@/models/lieferant";
import { Pencil } from "react-bootstrap-icons";

const LieferantTable = ({ lieferanten }: { lieferanten: Lieferant[] }) => {
  const [deleteLieferant] = lieferantApi.useDeleteLieferantMutation();
  const [deleteAdresse] = adresseApi.useDeleteAdresseMutation();
  const [updateLieferant] = lieferantApi.useUpdateLieferantMutation();

  const [editItem, setEditItem] = useState<Lieferant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Lieferant>>({});

  const handleDelete = async (id: number) => {
    try {
      await deleteLieferant(id).unwrap();
      await deleteAdresse(id).unwrap();
    } catch (err) {
      console.error("Fehler beim Löschen des Lieferanten:", err);
    }
  };

  const openEditDialog = (item: Lieferant) => {
    setEditItem(item);
    setFormData({ ...item });
    setIsDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editItem || !formData.adresse) return;

    try {
      await updateLieferant({
        id: editItem.lieferant_ID,
        data: {
          firmenname: formData.firmenname!,
          kontaktperson: formData.kontaktperson!,
          adresse_ID: formData.adresse.adresse_ID,
          adresse: {
            strasse: formData.adresse.strasse,
            plz: formData.adresse.plz,
            ort: formData.adresse.ort,
          },
        } as any, // falls Backend-Schema strikt ist
      }).unwrap();

      setIsDialogOpen(false);
    } catch (err) {
      console.error("Fehler beim Aktualisieren:", err);
    }
  };

  const handleInputChange = (
    field: keyof Lieferant | keyof Adresse,
    value: string | number
  ) => {
    if (field === "strasse" || field === "plz" || field === "ort") {
      setFormData((prev) => ({
        ...prev,
        adresse: {
          ...prev.adresse!,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const columns: ColumnDef<Lieferant & { id: string }>[] = [
    { accessorKey: "lieferant_ID", header: "ID" },
    { accessorKey: "firmenname", header: "Firmenname" },
    { accessorKey: "kontaktperson", header: "Kontaktperson" },
    { accessorFn: (row) => row.adresse.strasse, header: "Straße" },
    { accessorFn: (row) => row.adresse.plz.toString(), header: "PLZ" },
    { accessorFn: (row) => row.adresse.ort, header: "Ort" },
    {
      id: "actions",
      header: "Aktionen",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openEditDialog(row.original)}>
              <Pencil size={18} />
          </Button>
          <button onClick={() => handleDelete(row.original.lieferant_ID)}>
            <Trash size={18} color="red"/>
          </button>
        </div>
      ),
    },
  ];

  const transformedData = useMemo(() => {
    return lieferanten.map((item) => ({
      ...item,
      id: `${item.firmenname}-${item.kontaktperson}`,
    }));
  }, [lieferanten]);

  return (
    <>
      <DataTable data={transformedData} columns={columns} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lieferant bearbeiten</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {editItem && (
              <>
                <Input
                  placeholder="Firmenname"
                  value={formData.firmenname || ""}
                  onChange={(e) => handleInputChange("firmenname", e.target.value)}
                />
                <Input
                  placeholder="Kontaktperson"
                  value={formData.kontaktperson || ""}
                  onChange={(e) => handleInputChange("kontaktperson", e.target.value)}
                />
                <Input
                  placeholder="Straße"
                  value={formData.adresse?.strasse || ""}
                  onChange={(e) => handleInputChange("strasse", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="PLZ"
                  value={formData.adresse?.plz || ""}
                  onChange={(e) => handleInputChange("plz", Number(e.target.value))}
                />
                <Input
                  placeholder="Ort"
                  value={formData.adresse?.ort || ""}
                  onChange={(e) => handleInputChange("ort", e.target.value)}
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

export default LieferantTable;
