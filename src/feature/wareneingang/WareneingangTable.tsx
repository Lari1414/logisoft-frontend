import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { wareneingangApi } from "@/api/endpoints/wareneingangApi";

// Interface für den Wareneingang
interface Wareneingang {
  material_ID: number;
  materialbestellung_ID: number;
  menge: number;
  status?: string;
  lieferdatum: string;
}

const WareneingangTable = () => {
  const { data, isLoading, error } = wareneingangApi.useGetWareneingangQuery();

  // Lade- und Fehleranzeige
  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Daten.</div>;

 
 const transformedData = (data || []).map((item: Wareneingang) => ({
  ...item,
  id: item.material_ID.toString(),
}));

  // Columns definieren
  const columns: ColumnDef<Wareneingang & { id: string }>[] = [
    { accessorKey: "material_ID", header: "Material-ID" },
    { accessorKey: "materialbestellung_ID", header: "Bestell-ID" },
    { accessorKey: "menge", header: "Menge" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "lieferdatum", header: "Lieferdatum" },
  ];

  return <DataTable data={transformedData} columns={columns} />;
};

export default WareneingangTable;