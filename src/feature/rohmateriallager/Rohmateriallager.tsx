import { Grid2x2Plus } from "lucide-react";
import { rohmateriallagerApi } from "@/api/endpoints/rohmateriallagerApi.ts";
import { BaseContentLayout } from "@/common/BaseContentLayout.tsx";
import RohmateriallagerTable from "@/feature/Rohmateriallager/RohmateriallagerTable.tsx";  // Die Rohmaterial-Tabelle importieren

const RohMateriallager = () => {
  const [createRohmaterial, { isLoading }] = rohmateriallagerApi.useCreateRohmaterialMutation();

  return (
    <BaseContentLayout
      title="Rohrmaterial"
      primaryCallToActionButton={{
        text: "Auslagern",
        icon: Grid2x2Plus,
        onClick: () => {
          // Beispiel für das Erstellen eines neuen Rohrmaterials
          createRohmaterial({
            lager_ID: 1, 
            category: "Rohr",
            farbe: "Grün",
            typ: "PVC",
            groesse: "50mm",
            url: "https://www.example.com/rohrmaterial",
          });
        },
        isLoading,
      }}
    >
      <RohmateriallagerTable />
    </BaseContentLayout>
  );
};

export default RohMateriallager;
