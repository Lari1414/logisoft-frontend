import { Grid2x2Plus } from "lucide-react";
import { fertigmateriallagerApi } from "@/api/endpoints/fertigmateriallagerApi.ts";
import { BaseContentLayout } from "@/common/BaseContentLayout.tsx";
import FertigMateriallagerTable from "@/feature/fertigmateriallager/FertigmateriallagerTable";  // Die Rohmaterial-Tabelle importieren

const FertigMateriallager = () => {
  const [createRohmaterial, { isLoading }] = fertigmateriallagerApi.useCreateFertigmaterialMutation();

  return (
    <BaseContentLayout
      title="Fertigmaterial Lager"
      primaryCallToActionButton={{
        text: "Auslagern",
        icon: Grid2x2Plus,
        onClick: () => {
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
      <FertigMateriallagerTable />
    </BaseContentLayout>
  );
};

export default FertigMateriallager;
