import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { auftragApi } from "@/api/endpoints/auftragApi";
import { Auftrag } from "@/models/auftrag";
import { materialApi } from "@/api/endpoints/materialApi";

// Typ mit Material-Infos
export interface TransformedAuftrag extends Auftrag {
  id: string;
  category: string;
  farbe: string;
  typ: string;
  groesse: string;
}

const AuftraghistoryTable = () => {
  const { data, isLoading, error } = auftragApi.useGetAuftraghistoryQuery();
  const { data: materialsData } = materialApi.useGetMaterialQuery();

  const transformedData: TransformedAuftrag[] = useMemo(() => {
    if (!data || !materialsData) return [];

    const seen = new Set<number>();

    return data
      .filter((item) => {
        if (seen.has(item.auftrag_ID)) return false;
        seen.add(item.auftrag_ID);
        return true;
      })
      .map((item: Auftrag) => {
        const material = materialsData.find((m) => m.material_ID === item.material_ID);

        return {
          ...item,
          id: item.auftrag_ID.toString(),
          category: material?.category ?? "",
          farbe: material?.farbe ?? "",
          typ: material?.typ ?? "",
          groesse: material?.groesse ?? "",
        };
      });
  }, [data, materialsData]);

  const columns: ColumnDef<TransformedAuftrag>[] = [
    { accessorKey: "auftrag_ID", header: "Auftrag-ID" },
    { accessorKey: "material_ID", header: "Material-ID" },
    {
      accessorFn: (row) => row.category,
      id: "category",
      header: "Kategorie",
    },
    {
      accessorKey: "farbe",
      header: "Farbe",
      cell: ({ getValue }) => {
        const color = getValue() as string;
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: color }}
            />
            <span>{color}</span>
          </div>
        );
      },
    },
    {
      accessorFn: (row) => row.typ,
      id: "typ",
      header: "Typ",
    },
    {
      accessorFn: (row) => row.groesse,
      id: "groesse",
      header: "Größe",
    },
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

  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Daten.</div>;

  return <DataTable data={transformedData} columns={columns} />;
};

export default AuftraghistoryTable;
