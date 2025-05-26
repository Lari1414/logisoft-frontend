import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { auftragApi } from "@/api/endpoints/auftragApi.ts";
import { Auftrag } from "@/models/auftrag";

const AuftragEinlagerungTable = () => {
  const { data, isLoading, error } = auftragApi.useGetEinlagerungsAuftraegeQuery();

  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Daten.</div>;

  const transformedData = (data || []).map((item: Auftrag) => ({
    ...item,
    id: item.auftrag_ID.toString(), // besser als material_ID, weil eindeutiger
  }));

  const columns: ColumnDef<Auftrag & { id: string }>[] = [
    { accessorKey: "auftrag_ID", header: "Auftrag-ID" },
    { accessorKey: "material_ID", header: "Material-ID" },
    { accessorKey: "menge", header: "Menge" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "lagerbestand_ID", header: "Lagerbestand-ID" },
    { accessorKey: "bestellposition", header: "Bestellposition" },
    { accessorKey: "angefordertVon", header: "Angefordert Von" },
  ];

  return <DataTable data={transformedData} columns={columns} />;
};

export default AuftragEinlagerungTable;
