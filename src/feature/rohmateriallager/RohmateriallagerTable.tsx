//import { Material } from "@/models/material.ts";
import  { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table.tsx";
import { rohmateriallagerApi } from "@/api/endpoints/rohmateriallagerApi";

const RohmateriallagerTable = () => {
  const { data, isLoading, error } = rohmateriallagerApi.useGetRohmaterialQuery();

  // Lade- und Fehlerbehandlung
  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Daten.</div>;

  // Spaltendefinition
  const columns: ColumnDef<{ id: string; lagerId: number; category: string; farbe: string; typ: string; groesse: string; url: string }>[] = [
    { accessorKey: "material_ID", header: "ID" },  // material_ID bleibt als accessorKey
    { accessorKey: "lager_ID", header: "Lager" },  // lager_ID bleibt als accessorKey
    { accessorKey: "category", header: "Kategorie" },
    { accessorKey: "farbe", header: "Farbe" },
    { accessorKey: "typ", header: "Typ" },
    { accessorKey: "groesse", header: "Größe" },
    {
      accessorKey: "url",
      header: "URL",
      cell: ({ getValue }) => {
        const url = getValue() as string;
        return (
          <a href={url} target="_blank" rel="noopener noreferrer">
            Link
          </a>
        );
      },
    },
     {  header: "Menge" },
  ];

  // Umwandlung der Daten: ID wird von `material_ID` auf `id` und in `string` umgewandelt
  const transformedData = (data || []).map(item => ({
    ...item,
    id: item.material_ID.toString(),  // material_ID wird zu `id` und als string umgewandelt
    lagerId: item.lager_ID,           // lager_ID bleibt als number
  }));

  return <DataTable data={transformedData} columns={columns} />;
};

export default RohmateriallagerTable;