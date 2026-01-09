import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, User, Clock, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import BidItem from "./bid-item";
import CompleteJobButton from "./complete-button";
import ReviewForm from "./review-form";
import Chat from "@/components/chat";

export const revalidate = 0;

export default async function JobBidsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: job, error } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      status,
      created_at,
      accountant_id,
      bids (
        id,
        content,
        accountant_id,
        created_at,
        profiles:accountant_id (
          full_name,
          rating_avg,
          reviews_count
        )
      ),
      reviews (
        id, 
        rating, 
        comment
      )
    `)
    .eq("id", id)
    .single();

  if (error || !job) return notFound();

  // Находим данные выбранного исполнителя
  const rawBid = job.accountant_id 
    ? job.bids?.find((b: any) => b.accountant_id === job.accountant_id)
    : null;

  // ТРЮК ДЛЯ TYPESCRIPT: обрабатываем profiles как массив или объект
  const selectedAccountant = rawBid ? {
    ...rawBid,
    profile: Array.isArray(rawBid.profiles) ? rawBid.profiles[0] : rawBid.profiles
  } : null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Link 
        href="/dashboard/my-jobs" 
        className="flex items-center text-sm text-slate-500 mb-6 hover:text-blue-600 transition-colors w-fit"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Назад к списку
      </Link>

      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>
          <Badge variant="outline" className={job.status === 'open' ? "border-green-500 text-green-600" : job.status === 'in_progress' ? "border-blue-500 text-blue-600" : "border-slate-400 text-slate-500"}>
            {job.status === 'open' && 'Сбор откликов'}
            {job.status === 'in_progress' && 'В работе'}
            {job.status === 'completed' && 'Завершен'}
          </Badge>
        </div>
      </div>

      <div className="space-y-6">
        {job.accountant_id && selectedAccountant ? (
          <Card className={`border-none shadow-md overflow-hidden ${job.status === 'completed' ? 'bg-slate-50' : 'bg-blue-50/30'}`}>
            <div className={`h-1.5 ${job.status === 'completed' ? 'bg-slate-400' : 'bg-blue-600'}`} />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                {job.status === 'completed' ? <ShieldCheck className="h-5 w-5 text-slate-500" /> : <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                {job.status === 'completed' ? 'Проект выполнен' : 'Исполнитель подтвержден'}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${job.status === 'completed' ? 'bg-slate-400' : 'bg-blue-600'}`}>
                  {/* ИСПОЛЬЗУЕМ .profile вместо .profiles */}
                  {selectedAccountant.profile?.full_name?.[0] || "?"}
                </div>
                <div>
                  <Link href={`/profile/${job.accountant_id}`} className="font-bold text-slate-900 text-lg hover:text-blue-600 transition-colors">
                    {selectedAccountant.profile?.full_name}
                  </Link>
                  <p className="text-sm text-slate-500">Назначенный специалист</p>
                </div>
              </div>
              
              <div className="bg-white/50 p-4 rounded-lg border border-slate-100 italic text-sm text-slate-700">
                &ldquo;{selectedAccountant.content}&rdquo;
              </div>

              {job.status === 'in_progress' && (
                <><div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                  <div className="lg:col-span-2 text-slate-600">
                    {/* Тут основная инфо о заказе */}
                    <p>Работа уже идет. Обсудите детали с исполнителем в чате.</p>
                  </div>

                  <div className="lg:col-span-1">
                    {/* Вставляем наш новый компонент */}
                    <Chat jobId={job.id} userId={user?.id || ""} /> 
                  </div>
                </div><div className="pt-4 flex justify-end">
                    <CompleteJobButton jobId={job.id} />
                  </div></>
              )}

              {job.status === 'completed' && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                  {job.reviews && job.reviews.length > 0 ? (
                    <div className="bg-white p-6 rounded-xl border border-slate-100">
                      <div className="flex gap-1 mb-2">
                        {[...Array(job.reviews[0].rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-slate-700 italic">"{job.reviews[0].comment}"</p>
                    </div>
                  ) : (
                    user && <ReviewForm jobId={job.id} clientId={user.id} accountantId={job.accountant_id} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Список откликов */
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Доступные предложения ({job.bids?.length || 0})</h3>
            <div className="grid gap-4">
              {job.bids?.map((bid: any) => (
                <BidItem key={bid.id} bid={bid} jobId={job.id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}