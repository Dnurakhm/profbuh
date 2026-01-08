import { createClient } from "@/utils/supabase/server";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = 'force-dynamic'; // Заставляет страницу запрашивать данные при каждом входе

// Заставляем Next.js проверять базу данных при каждом посещении
export const revalidate = 0;

export default async function JobsFeedPage() {
  const supabase = await createClient();
  
  // Получаем текущего пользователя, чтобы понимать, кто смотрит ленту
  const { data: { user } } = await supabase.auth.getUser();

  // Запрос: ТОЛЬКО открытые заказы
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(`
      *,
      profiles:client_id (full_name)
    `)
    .eq("status", "open") 
    .order("created_at", { ascending: false });

  if (error) return (
    <div className="p-10 text-red-500 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Ошибка загрузки ленты</h2>
      <pre className="text-xs bg-slate-100 p-4 rounded">{JSON.stringify(error, null, 2)}</pre>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Лента заказов</h1>
        <Badge variant="outline" className="text-slate-500">
          Активных задач: {jobs?.length || 0}
        </Badge>
      </div>
      
      <div className="space-y-4">
        {jobs?.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-slate-50/50">
            <p className="text-slate-500 font-medium text-lg">Пока нет активных заказов.</p>
            <p className="text-slate-400 text-sm">Попробуйте зайти позже или обновить страницу.</p>
          </div>
        ) : (
          jobs?.map((job) => (
            <Card key={job.id} className="group hover:shadow-md hover:border-blue-200 transition-all duration-200">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                      {job.category}
                    </Badge>
                    <CardTitle className="text-xl text-slate-900 group-hover:text-blue-700 transition-colors">
                      {job.title}
                    </CardTitle>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-black text-slate-900">
                      {job.budget ? `${job.budget.toLocaleString()} ₸` : "Договорная"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase mt-1">
                      {new Date(job.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 line-clamp-2 text-sm leading-relaxed mb-4">
                  {job.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                    {job.profiles?.full_name?.[0] || "?"}
                  </div>
                  <span>Заказчик: <span className="font-semibold text-slate-700">{job.profiles?.full_name || "Не указан"}</span></span>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 border-t py-3">
                <Button asChild variant="ghost" className="w-full sm:w-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold">
                  <Link href={`/jobs/${job.id}`}>
                    Подробнее о заказе
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}