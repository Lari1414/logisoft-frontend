import { Order } from "@/models/order.ts";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table.tsx";
import { orderApi } from "@/api/endpoints/orderApi.ts";

const OrderTable = () => {
  const { data } = orderApi.useGetOrdersQuery();
  const columns: ColumnDef<Order>[] = [
    { accessorKey: "orderNumber", header: "Bestellnummer" },
    { accessorKey: "supplierId", header: "Lieferantennummer" },
    { accessorKey: "materialNumber", header: "Materialnummer" },
    { accessorKey: "quantity", header: "Menge" },
  ];

  return <DataTable data={data || []} columns={columns} />;
};

export default OrderTable;
