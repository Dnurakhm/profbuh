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
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Мои проекты</h1>

      <div className="grid gap-6">
        {jobs?.length === 0 ? (
          <Card className="p-20 text-center border-dashed">
            <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">У вас пока нет активных проектов.</p>
            <Link href="/jobs" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              Перейти в ленту заказов →
            </Link>
          </Card>
        ) : (
          jobs?.map((job) => (
            <Card key={job.id} className="border-l-4 border-l-blue-600">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none uppercase text-[10px]">
                    {job.status === 'in_progress' ? 'В работе' : 'Завершен'}
                  </Badge>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                </div>
                <div className="text-right">
                   <div className="text-lg font-bold text-slate-900">{job.budget} ₸</div>
                   <div className="text-xs text-slate-400 flex items-center justify-end">
                     <Clock className="h-3 w-3 mr-1" />
                     Обновлено {new Date(job.updated_at).toLocaleDateString('ru-RU')}
                   </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">Заказчик:</span> {job.profiles?.full_name}
                  </div>
                  <Link 
                    href={`/jobs/${job.id}`} 
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
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