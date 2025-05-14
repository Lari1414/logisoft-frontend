//import { Lieferant } from "@/models/lieferant.ts";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { lieferantApi } from "@/api/endpoints/lieferantApi.ts";
import { adresseApi } from "@/api/endpoints/adresseApi.ts";
import { Trash } from "react-bootstrap-icons";

interface Lieferant {
  lieferant_ID: number;
  firmenname: string;
  kontaktperson: string;
  adresse: {
    strasse: string;
    plz: number;
    ort: string;
  };
}

const LieferantTable = ({ lieferanten }: { lieferanten: Lieferant[] }) => {
const [deleteLieferant] = lieferantApi.useDeleteLieferantMutation();
const [deleteAdresse] = adresseApi.useDeleteAdresseMutation();

  const handleDelete = async (id: number) => {
    try {
      await deleteLieferant(id).unwrap();
      await deleteAdresse(id).unwrap();
     
    } catch (err) {
      console.error("Fehler beim Löschen des Lieferanten:", err);
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
      id: "delete",
      header: "",
      cell: ({ row }) => (
        <button onClick={() => handleDelete(row.original.lieferant_ID)}>
           <Trash size={18} /> 
        </button>
      ),
    },
  ];

  return (
    <DataTable
      data={lieferanten.map((item) => ({
        ...item,
        id: `${item.firmenname}-${item.kontaktperson}`,
      }))}
      columns={columns}
    />
  );
};

export default LieferantTable;
