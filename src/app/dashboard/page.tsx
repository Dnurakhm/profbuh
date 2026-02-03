import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardContent from "./dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // --- Сбор статистики для ЗАКАЗЧИКА ---
  // 1. Активные заказы (open)
  const { count: activeJobsCount } = await supabase
    .from("jobs")
    .select("*", { count: 'exact', head: true })
    .eq("client_id", user.id)
    .eq("status", "open");

  // 2. Заказы в работе (in_progress)
  const { count: inProgressJobsCount } = await supabase
    .from("jobs")
    .select("*", { count: 'exact', head: true })
    .eq("client_id", user.id)
    .eq("status", "in_progress");

  // 3. Завершенные заказы (completed)
  const { count: completedJobsCount } = await supabase
    .from("jobs")
    .select("*", { count: 'exact', head: true })
    .eq("client_id", user.id)
    .eq("status", "completed");

  // 4. Новые отклики (bids) на мои заказы
  const { data: myJobs } = await supabase.from("jobs").select("id").eq("client_id", user.id).eq("status", "open");
  const myJobIds = myJobs?.map(j => j.id) || [];

  let bidsCount = 0;
  if (myJobIds.length > 0) {
    const { count } = await supabase
      .from("bids")
      .select("*", { count: 'exact', head: true })
      .in("job_id", myJobIds);
    bidsCount = count || 0;
  }

  // 1. Активные отклики (мои bids на ОТКРЫТЫЕ заказы)
  const { data: activeBidsData } = await supabase
    .from("bids")
    .select("job_id, jobs!inner(status)")
    .eq("accountant_id", user.id)
    .eq("jobs.status", "open");

  const myProposalsCount = activeBidsData?.length || 0;

  // 2. Текущие проекты (где я исполнитель)
  const { count: myActiveContractsCount } = await supabase
    .from("jobs")
    .select("*", { count: 'exact', head: true })
    .eq("accountant_id", user.id)
    .eq("status", "in_progress");

  // 3. Рекомендуемые заказы (последние 5 открытых)
  // Сначала получаем ID заказов, на которые я УЖЕ откликнулся
  const { data: myAppliedBids } = await supabase
    .from("bids")
    .select("job_id")
    .eq("accountant_id", user.id);

  const myAppliedJobIds = myAppliedBids?.map(b => b.job_id) || [];

  let query = supabase
    .from("jobs")
    .select("id, title, budget, created_at, category")
    .eq("status", "open")
    .neq("client_id", user.id) // Не показывать свои же заказы
    .order("created_at", { ascending: false })
    .limit(5);

  if (myAppliedJobIds.length > 0) {
    query = query.not('id', 'in', `(${myAppliedJobIds.join(',')})`);
  }

  const { data: recommendedJobs } = await query;

  // 4. Последние действия (последние 5 созданных заказов)
  const { data: recentJobs } = await supabase
    .from("jobs")
    .select("id, title, created_at, status")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = {
    client: {
      activeJobs: activeJobsCount,
      inProgressJobs: inProgressJobsCount,
      completedJobs: completedJobsCount,
      bids: bidsCount,
      spent: 0,
      recentActivity: recentJobs || []
    },
    specialist: {
      proposals: myProposalsCount || 0,
      contracts: myActiveContractsCount || 0,
      earnings: 0,
      recommendedJobs: recommendedJobs || []
    }
  };

  return (
    <div className="py-6" >
      <DashboardContent profile={profile} stats={stats} />
    </div >
  );
}