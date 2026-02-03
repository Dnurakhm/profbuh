import { createClient } from "@/utils/supabase/server"
import { JobsFeed } from "./jobs-feed"
import { redirect } from "next/navigation"

export default async function JobsPage() {
  const supabase = await createClient()

  // Проверяем авторизацию (опционально, можно разрешить просмотр без логина)
  const { data: { user } } = await supabase.auth.getUser()
  // if (!user) redirect("/login") 

  // Получаем активные заказы, просмотренные и откликнутые заказы
  const [
    { data: jobs, error: jobsError },
    { data: views, error: viewsError },
    { data: bids, error: bidsError },
  ] = await Promise.all([
    supabase
      .from('jobs')
      .select('*, bids(count)')
      .eq('status', 'open')
      .order('created_at', { ascending: false }),
    supabase
      .from("job_views")
      .select("job_id")
      .eq("user_id", user?.id),
    supabase
      .from("bids")
      .select("job_id")
      .eq("accountant_id", user?.id)
  ]);

  if (jobsError || viewsError || bidsError) {
    console.error("Error fetching jobs:", jobsError || viewsError || bidsError)
    return <div className="p-10 text-red-500">Ошибка загрузки вакансий</div>
  }

  const viewedIds = new Set(views?.map(v => v.job_id) || []);
  const appliedIds = new Set(bids?.map(b => b.job_id) || []);

  // Приводим данные к нужному виду (bids -> bids_count)
  const formattedJobs = jobs?.map(job => ({
    ...job,
    bids_count: job.bids?.[0]?.count || 0
  })) || []

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Найти работу</h1>
        <p className="text-lg text-slate-500">Актуальные заказы для бухгалтеров и аудиторов</p>
      </div>

      <JobsFeed initialJobs={formattedJobs} appliedJobIds={appliedIds} />
    </div>
  )
}