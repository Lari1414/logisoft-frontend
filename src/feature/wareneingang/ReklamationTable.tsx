import { useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { reklamationApi } from "@/api/endpoints/reklamationApi";
import { wareneingangApi } from "@/api/endpoints/wareneingangApi.ts";

export interface ReklamationData {
  reklamation_ID: number;
  menge: number;
  status: string;
  wareneingang_ID: number;
  wareneingang?: {
    eingang_ID: number;
    menge: number;
    lieferdatum?: string;
    status?: string;
  };
}
export interface WareneingangData {
  eingang_ID: number;
  material_ID: number;
  lager_ID: number;
  materialbestellung_ID: number;
  menge: number;
  qualitaet_ID: number;
  status?: string;
  lieferdatum?: string;
  material?: {
    material_ID: number;
    lager_ID: number;
    category: string;
    farbe: string;
    farbe_json?: Record<string, number>;
    typ: string;
    groesse: string;
    url: string | null;
    standardmaterial: boolean;
  };
}


export interface TransformedReklamation extends ReklamationData {
  id: string;
  typ: string;
  category: string;
  farbe: string;
  groesse: string;
  url: string;
  lieferdatum: string;

}

interface ReklamationTableProps {
  //setRefetch?: (fn: () => void) => void;
  onSelectionChange?: (rows: ReklamationData[]) => void;
  setRefetch: React.Dispatch<React.SetStateAction<(() => void) | null>>;
}

const ReklamationTable: React.FC<ReklamationTableProps> = ({ setRefetch }) => {
  const { data, isLoading, error, refetch } = reklamationApi.useGetReklamationQuery();
  const { data: wareneingaenge = [] } = wareneingangApi.useGetWareneingangAlleQuery() as {
    data: WareneingangData[];
  };



  const transformedData = useMemo(() => {
    return (data || []).map((item) => {
      const matchedWareneingang = wareneingaenge.find(
        (w) => w.eingang_ID === item.wareneingang_ID
      );

      return {
        ...item,
        id: item.reklamation_ID.toString(),
        typ: matchedWareneingang?.material?.typ ?? "",
        category: matchedWareneingang?.material?.category ?? "",
        farbe: matchedWareneingang?.material?.farbe ?? "",
        groesse: matchedWareneingang?.material?.groesse ?? "",
        url: matchedWareneingang?.material?.url ?? "",
        lieferdatum: matchedWareneingang?.lieferdatum ?? "",

      };
    });
  }, [data, wareneingaenge]);


  useEffect(() => {
    if (setRefetch) {
      setRefetch(() => refetch);
    }
  }, [refetch, setRefetch]);

  const columns: ColumnDef<TransformedReklamation>[] = [
    {
      accessorFn: (row) => row.reklamation_ID,
      id: "reklamation_ID",
      header: "Reklamation-ID",
    },
    {
      accessorFn: (row) => row.wareneingang_ID,
      id: "wareneingang_ID",
      header: "Wareneingang-ID",
    },


    {
      accessorFn: (row) => row.category,
      id: "kategorie",
      header: "Kategorie",
    },

    {
      accessorFn: (row) => row.farbe ?? "",
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
      header: "Grösse",
    },
    {
      accessorFn: (row) => row.url,
      id: "url",
      header: "Url",
    },
    {
      accessorFn: (row) => row.menge,
      id: "menge",
      header: "Menge",
    },
    {
      accessorFn: (row) => row.status,
      id: "status",
      header: "Status", cell: ({ getValue }) => (
        <span className="px-2 py-1 rounded bg-red-500 text-white">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorFn: (row) => row.lieferdatum ?? "",
      id: "lieferdatum",
      header: "Lieferdatum",
      cell: ({ row }) => {
        const rawDate = row.original.lieferdatum;
        if (!rawDate) return "";
        const date = new Date(rawDate);
        return date.toLocaleDateString("de-DE");
      },
    },


  ];

  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Daten.</div>;

  return (
    <div className="space-y-4">
      <DataTable<TransformedReklamation>
        data={transformedData}
        columns={columns}
      />
    </div>
  );
};

export default ReklamationTable;
