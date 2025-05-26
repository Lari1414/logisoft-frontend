import { useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table";
import { reklamationApi } from "@/api/endpoints/reklamationApi";

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

export interface TransformedReklamation extends ReklamationData {
  id: string;
}

interface ReklamationTableProps {
  setRefetch?: (fn: () => void) => void;
}

const ReklamationTable: React.FC<ReklamationTableProps> = ({ setRefetch }) => {
  const { data, isLoading, error, refetch } = reklamationApi.useGetReklamationQuery();

  const transformedData = useMemo(() => {
    return (data || []).map((item) => ({
      ...item,
      id: item.reklamation_ID.toString(),
    }));
  }, [data]);

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
      accessorFn: (row) => row.menge,
      id: "menge",
      header: "Menge",
    },
    {
      accessorFn: (row) => row.status,
      id: "status",
      header: "Status",
    },
    {
      accessorFn: (row) => row.wareneingang_ID,
      id: "wareneingang_ID",
      header: "Wareneingang-ID",
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
