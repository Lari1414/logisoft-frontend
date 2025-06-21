import { useState, useCallback } from "react";
import { Grid2x2Plus } from "lucide-react";
import { Tabs, Tab } from "@mui/material";
import { auftragApi } from "@/api/endpoints/auftragApi";
import { BaseContentLayout } from "@/common/BaseContentLayout";
import AuftragTable, { TransformedAuftrag } from "@/feature/auftrag/AuftragTable";
import AuftraghistoryTable from "@/feature/auftrag/AuftraghistoryTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EinlagerungsAuftraegeTable from "@/feature/auftrag/AuftragEinlagerungTable.tsx";
import AuslagerungsAuftraegeTable from "@/feature/auftrag/AuftragAuslagerungTable.tsx";

const Auftrag = () => {
  const [activeTab, setActiveTab] = useState("offen");
  const [storeMaterial, { isLoading: isStoring }] = auftragApi.useStoreMaterialMutation();
  const [outsourceMaterial, { isLoading: isOutsourcing }] = auftragApi.useOutsourceMaterialMutation();
  const isLoading = isStoring || isOutsourcing;

  const [selectedRows, setSelectedRows] = useState<TransformedAuftrag[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refetchTable, setRefetchTable] = useState<(() => void) | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleSetRefetch = useCallback((refetchFn: () => void) => {
    setRefetchTable(() => refetchFn);
  }, []);

  const handleSelectionChange = useCallback((rows: TransformedAuftrag[]) => {
    setSelectedRows(rows.filter(row => row !== undefined));
  }, []);

  const handleExecuteClick = () => {
    if (selectedRows.length === 0) return;
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    console.log("handleConfirm wurde aufgerufen");
    //const einlagerungAuftraege = selectedRows.filter(a => a.status === "Einlagerung angefordert");
    //const auslagerungAuftraege = selectedRows.filter(a => a.status === "Auslagerung angefordert");
    const einlagerungAuftraege = selectedRows.filter(
      (a) => a.status?.toLowerCase() === "einlagerung angefordert"
    );

    const auslagerungAuftraege = selectedRows.filter(
      (a) => a.status?.toLowerCase() === "auslagerung angefordert"
    );

    try {
      if (einlagerungAuftraege.length > 0) {
        const auftragIds = einlagerungAuftraege.map(a => a.auftrag_ID);
        await storeMaterial({ auftragIds });
        console.log("Einlagerungsaufträge ausgeführt:", auftragIds);
      }

      if (auslagerungAuftraege.length > 0) {
        const auftragIds = auslagerungAuftraege.map(a => a.auftrag_ID);
        await outsourceMaterial({ auftragIds });
        console.log("Auslagerungsaufträge ausgeführt:", auftragIds);
      }
    } catch (error) {
      console.error("Fehler beim Ausführen der Aufträge:", error);
    } finally {
      setIsModalOpen(false);
      setSelectedRows([]);
      if (refetchTable) refetchTable();
    }
  };

  return (
    <BaseContentLayout
      title="Aufträge"
      primaryCallToActionButton={{
        text: "Auftrag ausführen",
        icon: Grid2x2Plus,
        onClick: handleExecuteClick,
        isLoading,
      }}
    >
      <div className="flex flex-col space-y-4">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Offene Aufträge" value="offen" />
          <Tab label="Einlagerungsaufträge" value="einlagerung" />
          <Tab label="Auslagerungsaufträge" value="auslagerung" />
          <Tab label="Historie" value="historie" />
        </Tabs>

        {activeTab === "offen" && (
          <AuftragTable onSelectionChange={handleSelectionChange} onRefetch={handleSetRefetch} onExecuteSingle={async (auftrag) => {
            try {
              if (auftrag.status?.toLowerCase() === "einlagerung angefordert") {
                await storeMaterial({ auftragIds: [auftrag.auftrag_ID] });
              } else if (auftrag.status?.toLowerCase() === "auslagerung angefordert") {
                await outsourceMaterial({ auftragIds: [auftrag.auftrag_ID] });
              }
              if (refetchTable) refetchTable();
            } catch (error) {
              console.error("Fehler bei Einzelauftrag-Ausführung:", error);
            }
          }} />
        )}

        {activeTab === "einlagerung" && (
          <EinlagerungsAuftraegeTable onSelectionChange={handleSelectionChange} onRefetch={handleSetRefetch} onExecuteSingle={async (auftrag) => {
            try {
              if (auftrag.status?.toLowerCase() === "einlagerung angefordert") {
                await storeMaterial({ auftragIds: [auftrag.auftrag_ID] });
              } else if (auftrag.status?.toLowerCase() === "auslagerung angefordert") {
                await outsourceMaterial({ auftragIds: [auftrag.auftrag_ID] });
              }
              if (refetchTable) refetchTable();
            } catch (error) {
              console.error("Fehler bei Einzelauftrag-Ausführung:", error);
            }
          }} />
        )}

        {activeTab === "auslagerung" && (
          <AuslagerungsAuftraegeTable onSelectionChange={handleSelectionChange} onRefetch={handleSetRefetch} onExecuteSingle={async (auftrag) => {
            try {
              if (auftrag.status?.toLowerCase() === "einlagerung angefordert") {
                await storeMaterial({ auftragIds: [auftrag.auftrag_ID] });
              } else if (auftrag.status?.toLowerCase() === "auslagerung angefordert") {
                await outsourceMaterial({ auftragIds: [auftrag.auftrag_ID] });
              }
              if (refetchTable) refetchTable();
            } catch (error) {
              console.error("Fehler bei Einzelauftrag-Ausführung:", error);
            }
          }} />
        )}

        {activeTab === "historie" && <AuftraghistoryTable />}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-h-[60vh] overflow-y-auto max-w-4xl w-full">
            <DialogHeader>
              <DialogTitle>Ausgewählte Aufträge ausführen</DialogTitle>
            </DialogHeader>

            {selectedRows.map((auftrag) => (
              <div key={auftrag.auftrag_ID} className="mb-4 p-4 border rounded">
                <div className="font-semibold">Auftrag-ID: {auftrag.auftrag_ID}</div>
                <div>Material-ID: {auftrag.material_ID}</div>
                <div>Menge: {auftrag.menge}</div>
                <div>Status: {auftrag.status}</div>
                <div>Lagerbestand-ID: {auftrag.lagerbestand_ID}</div>
              </div>
            ))}

            <Button
              onClick={handleConfirm}
              className="mt-4"
              disabled={selectedRows.length === 0 || isLoading}
            >
              {isLoading ? "Wird ausgeführt..." : "Bestätigen"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </BaseContentLayout>
  );
};

export default Auftrag;
