import { Order } from "@/models/order.ts";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table.tsx";
import { orderApi } from "@/api/endpoints/orderApi.ts";



const OrderTable = () => {
  const { data, isLoading, error } = orderApi.useGetOrdersQuery();

   // Lade- und Fehleranzeige
  if (isLoading) return <div>Lädt...</div>;
  if (error) return <div>Fehler beim Laden der Daten.</div>;

  const columns: ColumnDef< Order & { id: string 
}>[] = [
    { accessorKey: "material_ID", header: "Materialnummer" },
    { accessorKey: "lieferant_ID", header: "Lieferantennummer" },
    { accessorKey: "status", header: "status" },
    
  ];
/*lieferant_ID: number;
  material_ID: number;
  status: string;*/
   const transformedData = (data || []).map((item: Order) => ({
  ...item,
  id: item.material_ID.toString(),
  idl: item.lieferant_ID.toString(),
}));
   return <DataTable data={transformedData} columns={columns} />;
};

export default OrderTable;
