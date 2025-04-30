import { Stammdaten } from "@/models/stammdaten.ts"; 
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table.tsx";
import { stammdatenApi } from "@/api/endpoints/stammdatenApi.ts";

const StammdatenTable = () => {
  const { data } = stammdatenApi.useGetStammdatenQuery();
  const columns: ColumnDef<Stammdaten>[] = [
    { accessorKey: "supplierId", header: "Lieferantennummer" },
    { accessorKey: "firstName", header: "Vorname" },
    { accessorKey: "lastName", header: "Nachname" },
    { accessorKey: "street", header: "Straße" },
    { accessorKey: "postalCode", header: "PLZ" },
    { accessorKey: "city", header: "Ort" },
    { accessorKey: "email", header: "Mail" },
    { accessorKey: "material", header: "Material" },
  ];

  return <DataTable data={data || []} columns={columns} />;
};

export default StammdatenTable;