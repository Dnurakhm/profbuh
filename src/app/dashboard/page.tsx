import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardContent from "./dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // --- Сбор статистики через ЕДИНЫЙ запрос (RPC) ---
  console.log("🚀 Dashboard: Fetching consolidated stats via RPC...");
  const { data: dashboardData, error: rpcError } = await supabase
    .rpc('get_dashboard_stats', { user_uuid: user.id });

  if (rpcError) {
    console.error("❌ Dashboard RPC Error:", rpcError);
    // Фолбэк на пустые данные или старую логику при необходимости
  }

  const profile = dashboardData?.profile || null;
  const stats = dashboardData?.stats || {
    client: { activeJobs: 0, inProgressJobs: 0, completedJobs: 0, bids: 0, spent: 0, recentActivity: [] },
    specialist: { proposals: 0, contracts: 0, earnings: 0, recommendedJobs: [] }
  };


  return (
    <div className="py-6" >
      <DashboardContent profile={profile} stats={stats} />
    </div >
  );
}