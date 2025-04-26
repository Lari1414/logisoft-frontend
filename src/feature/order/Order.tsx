import OrderTable from "@/feature/order/OrderTable.tsx";
import { BaseContentLayout } from "@/common/BaseContentLayout.tsx";
import { Grid2x2Plus } from "lucide-react";
import { orderApi } from "@/api/endpoints/orderApi.ts";

const Order = () => {
  const [create, { isLoading }] = orderApi.useCreateOrderMutation();
  return (
    <BaseContentLayout
      title="Meine Bestellung"
      primaryCallToActionButton={{
        text: "Bestellung erfassen",
        icon: Grid2x2Plus,
        onClick: () => {
          // TODO hardcoded example remove me!!
          create({ customerId: "6a8387e9-6ab5-4851-bc5b-c7d6e817fea1" });
        },
        isLoading,
      }}
    >
      <OrderTable />
    </BaseContentLayout>
  );
};

export default Order;
