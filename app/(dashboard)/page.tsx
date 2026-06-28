import { Header } from "@/components/dashboard/header";
import { DashboardOverview } from "@/components/dashboard/overview";

export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="داشبورد"
        description="خوش آمدید! نمای کلی فروشگاه شما."
      />
      <div className="flex-1 p-6">
        <DashboardOverview />
      </div>
    </div>
  );
}
