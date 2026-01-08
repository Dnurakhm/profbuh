import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, ArrowRight } from "lucide-react";

export default async function MyJobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Получаем заказы пользователя и считаем количество откликов (count)
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(`
      *,
      bids (id)
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return <div className="p-10 text-red-500">Ошибка: {error.message}</div>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Мои заказы</h1>
        <Button asChild className="bg-blue-600">
          <Link href="/jobs/create">Создать новый</Link>
        </Button>
      </div>
      
      <div className="grid gap-4">
        {jobs?.length === 0 ? (
          <Card className="p-10 text-center border-dashed">
            <p className="text-slate-500">Вы еще не опубликовали ни одного заказа.</p>
          </Card>
        ) : (
          jobs?.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={job.status === 'open' ? 'default' : 'secondary'} className="bg-green-100 text-green-800 border-none uppercase text-[10px]">
                        {job.status === 'open' ? 'Активен' : job.status}
                      </Badge>
                      <span className="text-xs text-slate-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(job.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <CardTitle className="text-xl text-slate-900">{job.title}</CardTitle>
                  </div>
                  
                  <Button asChild variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                    <Link href={`/dashboard/my-jobs/${job.id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Откликов: {job.bids?.length || 0}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}