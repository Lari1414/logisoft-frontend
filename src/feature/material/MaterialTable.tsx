import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table.tsx";
import { materialApi } from "@/api/endpoints/materialApi.ts";
import { Trash } from "react-bootstrap-icons";
import { useEffect } from "react";

interface Material {
  material_ID: number;
  lager_ID: number;
  category: string;
  farbe: string;
  typ: string;
  groesse: string;
  url: string;
}

interface MaterialTableProps {
  onRefetch?: (refetchFn: () => void) => void;
}

const MaterialTable = ({ onRefetch }: MaterialTableProps) => {
  const { data, isLoading, error, refetch } = materialApi.useGetMaterialQuery();
  const [deleteMaterial] = materialApi.useDeleteMaterialMutation();

    useEffect(() => {
      if (onRefetch && refetch) {
        onRefetch(refetch);
      }
    }, [onRefetch, refetch]);

  const handleDelete = async (id: number) => {
    try {
      await deleteMaterial(id).unwrap();
        console.error("Materials:" +id+ " gelöscht");
      // Kein setState nötig – refetch passiert im Elternkomponent
        refetch();
    } catch (err) {
      console.error("Fehler beim Löschen des Materials:", err);
    }
  };

  // Lade- und Fehlerbehandlung
  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Daten.</div>;

  // Spaltendefinition
  const columns: ColumnDef<Material & { id: string }>[] = [
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
    {
      id: "delete",
      header: "",
      cell: ({ row }) => (
        <button onClick={() => handleDelete(row.original.material_ID)}>
          <Trash size={20} /> 
        </button>
      
      ),
    },
  ];

  // Umwandlung der Daten: ID wird von `material_ID` auf `id` und in `string` umgewandelt
  const transformedData = (data || []).map(item => ({
    ...item,
    id: item.material_ID.toString(),  // material_ID wird zu `id` und als string umgewandelt
    lagerId: item.lager_ID,           // lager_ID bleibt als number
  }));

  return <DataTable data={transformedData} columns={columns} />;
};

export default MaterialTable;
