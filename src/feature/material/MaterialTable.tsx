import { Lieferant } from "@/models/lieferant.ts"; 
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table.tsx";
import { materialApi } from "@/api/endpoints/materialApi.ts";
const MaterialTable = () => {
  const { data, isLoading, error } = materialApi.useGetMaterialQuery();

  if (isLoading) {
    return <div>Lädt...</div>;
  }

  if (error) {
    return <div>Fehler beim Laden der Daten.</div>;
  }

  const columns: ColumnDef<Material>[] = [
    { accessorKey: "material_ID", header: "ID" },
    { accessorKey: "lager_ID", header: "Lager" },
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
  ];

  return <DataTable data={data || []} columns={columns} />;
};

export default MaterialTable;