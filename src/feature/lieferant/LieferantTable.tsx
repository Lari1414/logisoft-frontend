import { Lieferant } from "@/models/lieferant.ts"; 
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table.tsx";
import { lieferantApi } from "@/api/endpoints/lieferantApi.ts";

const LieferantTable = () => {
  const { data, isLoading, error } = lieferantApi.useGetLieferantQuery();
  
  // Lade- und Fehlerbehandlung
  if (isLoading) {
    return <div>Lädt...</div>;
  }

  if (error) {
    return <div>Fehler beim Laden der Daten: {error.message}</div>;
  }

  // Spaltendefinition
  const columns: ColumnDef<Lieferant>[] = [
    { accessorKey: "firmenname", header: "Firmenname" },
    { accessorKey: "kontaktperson", header: "Kontaktperson" },
    { accessorFn: (row) => row.adresse.strasse, header: "Straße" },
    { accessorFn: (row) => row.adresse.plz, header: "PLZ" },
    { accessorFn: (row) => row.adresse.ort, header: "Ort" },
  ];

  return <DataTable data={data || []} columns={columns} />;
};


export default LieferantTable;