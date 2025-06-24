import { SectionCards } from "@/components/sidebar/section-cards.tsx";
//import { ChartAreaInteractive } from "@/components/sidebar/chart-area-interactive.tsx";
import MindestbestandTable from "@/feature/mindestbestand/mindestbestandTable.tsx";
import StandardRohmaterialTable from "@/feature/rohmateriallager/StandardRohmaterialTable.tsx";


const Dashboard = () => {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6 flex flex-col gap-6">

        {/* Überschrift + Mindestbestand-Tabelle */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Mindestbestand Übersicht</h2>
          <div className="max-h-[300px] overflow-auto border rounded p-2">
            <MindestbestandTable />
          </div>
        </div>

        {/* Überschrift + Rohmaterial-Tabelle */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Rohmaterial Lagerbestand</h2>
          <div className="max-h-[300px] overflow-auto border rounded p-2">
            <StandardRohmaterialTable />
          </div>
        </div>

      </div>
    </>
  );
};
export default Dashboard;
