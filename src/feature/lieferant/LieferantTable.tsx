import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { lieferantApi } from "@/api/endpoints/lieferantApi";
import { adresseApi } from "@/api/endpoints/adresseApi";
import { Trash, Pencil } from "react-bootstrap-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lieferant, Adresse } from "@/models/lieferant";

const LieferantTable = ({ lieferanten }: { lieferanten: Lieferant[] }) => {
  const [deleteLieferant] = lieferantApi.useDeleteLieferantMutation();
  const [deleteAdresse] = adresseApi.useDeleteAdresseMutation();
  const [updateLieferant] = lieferantApi.useUpdateLieferantMutation();
  const [updateAdresse] = adresseApi.useUpdateAdresseMutation(); // Achtung: eigentlich updateAdresse

  const [editItem, setEditItem] = useState<Lieferant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Lieferant>>({});
  const [searchTerm, setSearchTerm] = useState("");

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
      // 1. Adresse separat aktualisieren
      await updateAdresse({
        id: formData.adresse.adresse_ID!,
        data: {
          strasse: formData.adresse.strasse,
          plz: formData.adresse.plz,
          ort: formData.adresse.ort,
        },
      }).unwrap();

      // 2. Lieferant aktualisieren (nur erlaubte Felder)
      await updateLieferant({
        id: editItem.lieferant_ID,
        data: {
          firmenname: formData.firmenname!,
          kontaktperson: formData.kontaktperson!,
          adresse_ID: formData.adresse.adresse_ID!,
        },
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
          <Button variant="ghost" className="p-2 text-black-600 hover:bg-blue-100 rounded" onClick={() => openEditDialog(row.original)} title="Bearbeiten">
            <Pencil size={18} />
          </Button>
          <button onClick={() => handleDelete(row.original.lieferant_ID)} className="hover:bg-red-100 rounded" title="Löschen">
            <Trash size={18} color="red" />
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

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return transformedData;

    const term = searchTerm.toLowerCase();
    return transformedData.filter((item) => {
      return (
        item.firmenname.toLowerCase().includes(term) ||
        item.kontaktperson.toLowerCase().includes(term) ||
        item.adresse.strasse.toLowerCase().includes(term) ||
        item.adresse.ort.toLowerCase().includes(term) ||
        item.adresse.plz.toString().includes(term)
      );
    });
  }, [searchTerm, transformedData]);

  return (
    <>
      {/* Suchfeld */}
      <div className="mb-4">
        <Input
          placeholder="Lieferant suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="
            w-40                 
            focus:w-72            
            transition-all   
            duration-300
            ease-in-out
            px-2 py-1             
            text-sm               
            focus:shadow-md       
          "
        />
      </div>


      <DataTable data={filteredData} columns={columns} />


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
                  onChange={(e) =>
                    handleInputChange("firmenname", e.target.value)
                  }
                />
                <Input
                  placeholder="Kontaktperson"
                  value={formData.kontaktperson || ""}
                  onChange={(e) =>
                    handleInputChange("kontaktperson", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInputChange("plz", Number(e.target.value))
                  }
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
