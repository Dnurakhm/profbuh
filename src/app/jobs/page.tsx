import { createClient } from "@/utils/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Sparkles, Users, Clock, ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function JobsFeedPage() {
  const supabase = await createClient();
  
  // 1. Получаем текущего пользователя
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Запрашиваем заказы вместе с подсчетом откликов (bids)
  const [jobsRes, viewsRes] = await Promise.all([
    supabase.from("jobs")
      .select(`
        *,
        profiles:client_id (full_name),
        bids (count)
      `)
      .eq("status", "open")
      .order("created_at", { ascending: false }),
    supabase.from("job_views")
      .select("job_id")
      .eq("user_id", user?.id)
  ]);

  const jobs = jobsRes.data;
  const viewedIds = new Set(viewsRes.data?.map(v => v.job_id) || []);

  if (jobsRes.error) return (
    <div className="p-10 text-red-500 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Ошибка загрузки ленты</h2>
      <pre className="text-xs bg-slate-100 p-4 rounded">{JSON.stringify(jobsRes.error, null, 2)}</pre>
    </div>
  );

  return (
    <div className="py-6 sm:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-10 gap-3 sm:gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Лента заказов
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-500">
            Найдите идеальный проект для работы сегодня
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-blue-50 text-blue-600 border-blue-100 px-3 sm:px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm"
        >
          {jobs?.length || 0} активных предложений
        </Badge>
      </div>
      
      <div className="grid gap-4 sm:gap-6 pb-8">
        {!jobs || jobs.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed rounded-[2rem] bg-slate-50/50">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-xl">Пока новых заказов нет</p>
            <p className="text-slate-400">Мы сообщим вам, как только появится что-то подходящее.</p>
          </div>
        ) : (
          jobs.map((job) => {
            const isNew = !viewedIds.has(job.id);
            const bidsCount = job.bids?.[0]?.count || 0;
            const isFirstPotential = bidsCount === 0;

            return (
              <Card
                key={job.id}
                className={`group relative overflow-hidden transition-all duration-500 border-none shadow-sm hover:shadow-2xl rounded-2xl sm:rounded-3xl ${
                  isNew 
                  ? 'bg-gradient-to-br from-blue-50/80 via-white to-white ring-1 ring-blue-100' 
                  : 'bg-white ring-1 ring-slate-100'
                }`}
              >
                {/* Левая полоса-акцент */}
                {isNew && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[4px_0_15px_rgba(37,99,235,0.3)]" />
                )}

                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-slate-900 text-white border-none px-3 py-0.5 text-[10px] uppercase font-bold tracking-widest">
                          {job.category}
                        </Badge>
                        
                        {isNew && (
                          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black tracking-wider uppercase animate-pulse">
                            <Sparkles className="w-3 h-3 fill-current" />
                            Новинка
                          </div>
                        )}
                      </div>
                      
                      <CardTitle
                        className={`text-lg sm:text-xl md:text-2xl font-extrabold transition-colors ${
                          isNew ? 'text-blue-950' : 'text-slate-800'
                        } group-hover:text-blue-600`}
                      >
                        {job.title}
                      </CardTitle>
                    </div>

                    <div className="bg-white/50 backdrop-blur-sm p-3 rounded-2xl border border-white shadow-sm min-w-[140px] text-center sm:text-right">
                      <div className={`text-2xl font-black ${isNew ? 'text-blue-600' : 'text-slate-900'}`}>
                        {job.budget ? `${job.budget.toLocaleString()} ₸` : "Договорная"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                        {new Date(job.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 sm:space-y-6">
                  <p className="text-slate-600 line-clamp-2 text-sm sm:text-base leading-relaxed">
                    {job.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
                      {/* Счетчик откликов (Яркий и заметный) */}
                      <div
                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl border text-xs sm:text-sm ${
                        bidsCount > 0 
                        ? 'bg-blue-50 border-blue-100 text-blue-700' 
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}>
                        <Users className={`w-5 h-5 ${bidsCount > 0 ? 'text-blue-500' : 'text-slate-300'}`} />
                        <span className="font-bold uppercase tracking-tighter">
                          {bidsCount > 0 ? `Откликов: ${bidsCount}` : "Пока нет откликов"}
                        </span>
                      </div>

                      <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-white">
                          {job.profiles?.full_name?.[0] || "?"}
                        </div>
                        <span className="font-medium">Заказчик: {job.profiles?.full_name || "Не указан"}</span>
                      </div>
                    </div>

                    <Button
                      asChild
                      className={`w-full sm:w-auto rounded-2xl px-6 sm:px-8 h-11 sm:h-12 font-bold transition-all duration-300 ${
                      isNew && isFirstPotential
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 scale-105 hover:-translate-y-1' 
                      : 'bg-slate-900 text-white hover:bg-black'
                    }`}>
                      <Link href={`/jobs/${job.id}`} className="flex items-center justify-center gap-2 text-sm sm:text-base">
                        {isNew && isFirstPotential ? (
                          <>Стать первым исполнителем <ArrowRight className="w-4 h-4" /></>
                        ) : (
                          <>Подробнее <ArrowRight className="w-4 h-4" /></>
                        )}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}