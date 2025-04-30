
import { BaseContentLayout } from "@/common/BaseContentLayout.tsx";
import { Grid2x2Plus } from "lucide-react";
import { stammdatenApi } from "@/api/endpoints/stammdatenApi.ts";
import StammdatenTable from "@/feature/stammdaten/StammdatenTable.tsx";

const Stammdaten = () => {
  const [create, { isLoading }] = stammdatenApi.useCreateStammdatenMutation();
  return (
    <BaseContentLayout
      title="Stammdaten"
      primaryCallToActionButton={{
        text: "Lieferanten anlegen",
        icon: Grid2x2Plus,
        onClick: () => {
          // TODO hardcoded example remove me!!
          create({ customerId: "6a8387e9-6ab5-4851-bc5b-c7d6e817fea1",

            data: {
              id: "123", // oder leer lassen, falls Backend das erzeugt
              supplierId: "L123",
              firstName: "Max",
              lastName: "Mustermann",
              street: "Beispielstraße 1",
              postalCode: "12345",
              city: "Berlin",
              email: "max@firma.de",
              material: "Stahl"
            }
           });
        },
        isLoading,
      }}
    >
      <StammdatenTable />
    </BaseContentLayout>
  );
};

export default Stammdaten;
