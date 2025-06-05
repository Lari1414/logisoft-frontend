import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { auftragApi } from "@/api/endpoints/auftragApi.ts";
import { Auftrag } from "@/models/auftrag";

const AuftraghistoryTable = () => {
  const { data, isLoading, error } = auftragApi.useGetAuftraghistoryQuery();

  // Lade- und Fehleranzeige
  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Daten.</div>;

  const transformedData = (data || []).map((item: Auftrag) => ({
    ...item,
    id: item.auftrag_ID.toString(),
  }));

  const columns: ColumnDef<Auftrag & { id: string }>[] = [
    { accessorKey: "auftrag_ID", header: "Auftrag-ID" },
    { accessorKey: "material_ID", header: "Material-ID" },
    { accessorKey: "menge", header: "Menge" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => (
        <span className="px-2 py-1 rounded bg-green-500 text-white">
          {getValue() as string}
        </span>
      ),
    },
    { accessorKey: "lagerbestand_ID", header: "Lagerbestand-ID" },
    { accessorKey: "bestellposition", header: "Bestellposition" },
    { accessorKey: "angefordertVon", header: "Angefordert von" },
  ];

  return <DataTable data={transformedData} columns={columns} />;
};

export default AuftraghistoryTable;