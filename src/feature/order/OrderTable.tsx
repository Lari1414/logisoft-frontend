import { Order } from "@/models/order.ts";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/sidebar/data-table.tsx";
import { orderApi } from "@/api/endpoints/orderApi.ts";

const OrderTable = () => {
  const { data } = orderApi.useGetOrdersQuery();
  const columns: ColumnDef<Order>[] = [
    { accessorKey: "orderNumber", header: "Auftragsnummer" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "customerId", header: "Kunde" },
  ];

  return <DataTable data={data || []} columns={columns} />;
};

export default OrderTable;
