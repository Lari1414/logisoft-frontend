import { Grid2x2Plus } from "lucide-react";
import { auftragApi } from "@/api/endpoints/auftragApi.ts";
import { BaseContentLayout } from "@/common/BaseContentLayout.tsx";
import AuftragTable from "@/feature/auftrag/AuftragTable";  

const Auftrag = () => {
  const [createAuftrag, { isLoading }] = auftragApi.useCreateAuftragMutation();

  return (
    <BaseContentLayout
      title="Aufträge"
      primaryCallToActionButton={{
        text: "Bearbeiten",
        icon: Grid2x2Plus,
        onClick: () => {
          
            createAuftrag({
                material_ID: 1,
      anzahl: 1,
     // bestellposition?: "string",
          });
        },
        isLoading,
      }}
    >
      <AuftragTable />
    </BaseContentLayout>
  );
};

export default Auftrag;