import { SectionCards } from "@/components/sidebar/section-cards.tsx";
//import { ChartAreaInteractive } from "@/components/sidebar/chart-area-interactive.tsx";
import MindestbestandTable  from "@/feature/mindestbestand/mindestbestandTable.tsx";

const Dashboard = () => {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        {/*<ChartAreaInteractive />*/}
        <MindestbestandTable />
      </div>
    </>
  );
};

export default Dashboard;
