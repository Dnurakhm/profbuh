import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function MyWorkPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Получаем заказы, где текущий пользователь назначен исполнителем
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(`
      *,
      profiles:client_id (full_name)
    `)
    .eq("accountant_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return <div className="p-10 text-red-500">Ошибка: {error.message}</div>;

  return (
    <div className="py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Мои проекты</h1>

      <div className="grid gap-4 sm:gap-6 pb-8">
        {jobs?.length === 0 ? (
          <Card className="p-10 sm:p-16 text-center border-dashed rounded-3xl">
            <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-sm sm:text-base">
              У вас пока нет активных проектов.
            </p>
            <Link
              href="/jobs"
              className="text-blue-600 hover:underline text-xs sm:text-sm mt-3 inline-block font-semibold"
            >
              Перейти в ленту заказов →
            </Link>
          </Card>
        ) : (
          jobs?.map((job) => (
            <Card
              key={job.id}
              className="border-l-4 border-l-blue-600 rounded-2xl sm:rounded-3xl shadow-sm"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none uppercase text-[10px] px-2 py-0.5 rounded-full">
                    {job.status === 'in_progress' ? 'В работе' : 'Завершен'}
                  </Badge>
                  <CardTitle className="text-base sm:text-lg">{job.title}</CardTitle>
                </div>
                <div className="text-right">
                  <div className="text-base sm:text-lg font-bold text-slate-900">
                    {job.budget ? `${job.budget.toLocaleString()} ₸` : 'Договорная'}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-400 flex items-center justify-end">
                    <Clock className="h-3 w-3 mr-1" />
                    Обновлено {new Date(job.updated_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-3 sm:gap-4">
                  <div className="text-xs sm:text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">Заказчик:</span>{' '}
                    {job.profiles?.full_name}
                  </div>
                  <Link 
                    href={`/jobs/${job.id}`} 
                    className="flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Детали заказа <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}