import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { auftragApi } from "@/api/endpoints/auftragApi";
import { Auftrag } from "@/models/auftrag";


const WareneingangTable = () => {
  const { data, isLoading, error } = auftragApi.useGetAuftragQuery();

  // Lade- und Fehleranzeige
  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Daten.</div>;

 
 const transformedData = (data || []).map((item: Auftrag) => ({
  ...item,
  id: item.material_ID.toString(),
}));

  // Columns definieren material_ID: number;
 // anzahl: number;
 // bestellposition?: string;
  const columns: ColumnDef<Auftrag & { id: string }>[] = [
    { accessorKey: "anzahl", header: "Anzahl" },
    { accessorKey: "materialbestellung_ID", header: "Bestell-ID" },
    { accessorKey: "bestellposition", header: "Bestellposition" },
   
  ];

  return <DataTable data={transformedData} columns={columns} />;
};

export default WareneingangTable;