import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  User,
  Clock,
  ShieldCheck,
  Star,
  MapPin,
  Briefcase,
  Calendar,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import BidItem from "./bid-item";
import CompleteJobButton from "./complete-button";
import ReviewForm from "./review-form";

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
      description,
      status,
      created_at,
      budget,
      category,
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

  const selectedAccountant = rawBid ? {
    ...rawBid,
    profile: Array.isArray(rawBid.profiles) ? rawBid.profiles[0] : rawBid.profiles
  } : null;

  return (
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in duration-500">
      {/* Header Navigation */}
      <div className="mb-6">
        <Link
          href="/dashboard/my-jobs"
          className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-full border border-slate-200 hover:border-blue-200 shadow-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад к списку
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left Column: Job Details */}
        <div className="lg:col-span-2 space-y-8">

          {/* Job Title Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-2 ${job.status === 'open' ? 'bg-blue-500' :
              job.status === 'in_progress' ? 'bg-green-500' : 'bg-slate-400'
              }`} />

            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <Badge variant="outline" className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-none ${job.status === 'open' ? 'bg-blue-100 text-blue-700' :
                  job.status === 'in_progress' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                  {job.status === 'open' && 'Сбор откликов'}
                  {job.status === 'in_progress' && 'В работе'}
                  {job.status === 'completed' && 'Завершен'}
                </Badge>
                <span className="text-sm font-medium text-slate-400 flex items-center bg-slate-50 px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(job.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 font-bold">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  {job.category || 'Общее'}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 font-bold">
                  <MapPin className="w-4 h-4 text-red-500" />
                  Удаленно
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">Описание задачи</h3>
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                <p className="whitespace-pre-wrap">{job.description || "Описание отсутствует."}</p>
              </div>
            </div>
          </div>

          {/* Proposals / Active Work */}
          <div className="space-y-6">
            {job.accountant_id && selectedAccountant ? (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className={`p-6 border-b border-gray-100 flex items-center justify-between ${job.status === 'completed' ? 'bg-slate-50' : 'bg-green-50'
                  }`}>
                  <div className="flex items-center gap-3">
                    {job.status === 'completed' ? (
                      <ShieldCheck className="w-6 h-6 text-slate-500" />
                    ) : (
                      <div className="relative">
                        <span className="absolute -right-0.5 -top-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                    )}
                    <h3 className={`font-bold text-lg ${job.status === 'completed' ? 'text-slate-700' : 'text-green-800'}`}>
                      {job.status === 'completed' ? 'Работа принята' : 'Исполнитель работает над заказом'}
                    </h3>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-6 mb-8">
                    <Link href={`/profile/${job.accountant_id}`} className="shrink-0 relative">
                      <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl font-bold shadow-xl shadow-slate-200">
                        {selectedAccountant.profile?.full_name?.[0]}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm flex items-center">
                        <Star className="w-3 h-3 fill-white mr-1" />
                        {selectedAccountant.profile?.rating_avg?.toFixed(1) || "5.0"}
                      </div>
                    </Link>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">{selectedAccountant.profile?.full_name}</h4>
                      <p className="text-slate-500">Специалист по бухучету</p>
                      <Button variant="link" asChild className="p-0 h-auto text-blue-600 text-sm mt-1">
                        <Link href={`/profile/${job.accountant_id}`}>Посмотреть профиль</Link>
                      </Button>
                    </div>
                  </div>

                  {job.status === 'in_progress' && (
                    <div className="space-y-6">
                      <div className="bg-blue-50/50 rounded-2xl p-8 border border-blue-100 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white mb-4 shadow-xl shadow-blue-200">
                          <MessageSquare className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-2">Обсуждение проекта</h4>
                        <p className="text-slate-500 text-sm max-w-sm mb-6">
                          Используйте наш обновленный мессенджер для безопасного общения и обмена файлами.
                        </p>
                        <Button asChild className="rounded-2xl h-14 px-8 font-black text-base shadow-xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95">
                          <Link href={`/dashboard/chat?jobId=${job.id}`}>
                            Открыть чат по заказу
                          </Link>
                        </Button>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-slate-100">
                        <div className="max-w-xs w-full">
                          <CompleteJobButton jobId={job.id} />
                          <p className="text-xs text-center text-slate-400 mt-2">
                            Нажмите только когда работа полностью выполнена
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {job.status === 'completed' && job.reviews && (
                    <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100">
                      <h4 className="font-bold text-yellow-900 mb-3">Ваш отзыв</h4>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(job.reviews[0]?.rating || 5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-slate-700 italic">"{job.reviews[0]?.comment}"</p>
                    </div>
                  )}

                  {job.status === 'completed' && (!job.reviews || job.reviews.length === 0) && user && (
                    <ReviewForm jobId={job.id} clientId={user.id} accountantId={job.accountant_id} />
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900">Предложения</h3>
                  <Badge className="bg-slate-900 text-white rounded-full px-3 text-sm">
                    {job.bids?.length || 0}
                  </Badge>
                </div>

                {(!job.bids || job.bids.length === 0) ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
                      <User className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-700 mb-2">Пока нет откликов</h4>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">
                      Специалисты скоро увидят ваш заказ. Мы пришлем уведомление, когда кто-то откликнется.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {job.bids.map((bid: any) => (
                      <BidItem key={bid.id} bid={bid} jobId={job.id} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          {/* Budget Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10" />
            <div className="relative z-10 text-center">
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Бюджет проекта</p>
              <div className="text-3xl font-black mb-1">
                {job.budget ? `${job.budget.toLocaleString()} ₸` : "Договорная"}
              </div>
              <p className="text-xs text-slate-400">Сумма резервируется при старте</p>
            </div>
          </div>

          {/* Tips / Help */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Безопасная сделка
            </h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 shrink-0" />
                Деньги замораживаются и выплачиваются только после вашей приемки.
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 shrink-0" />
                Общайтесь только в чате платформы.
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}