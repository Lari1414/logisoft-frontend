import { Grid2x2Plus } from "lucide-react";
import { wareneingangApi } from "@/api/endpoints/wareneingangApi.ts";
import { BaseContentLayout } from "@/common/BaseContentLayout.tsx";
import WareneingangTable from "@/feature/wareneingang/WareneingangTable.tsx";  

const Wareneingang = () => {
  const [createWareneingang, { isLoading }] = wareneingangApi.useCreateWareneingangMutation();

  return (
    <BaseContentLayout
      title="Wareneingang"
      primaryCallToActionButton={{
        text: "Einlagern",
        icon: Grid2x2Plus,
        onClick: () => {
          
            createWareneingang({
                material_ID: 1,
                materialbestellung_ID: 1,
                menge: 10,
                //status?: "",
                lieferdatum: "string",
          });
        },
        isLoading,
      }}
    >
      <WareneingangTable />
    </BaseContentLayout>
  );
};

export default Wareneingang;