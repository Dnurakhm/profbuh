import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, User, ArrowLeft, CheckCircle2, Clock, AlertCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import BidForm from "./bid-form"; 
import Chat from "@/components/chat";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JobPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Данные заказа
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select(`*, profiles:client_id (full_name)`)
    .eq("id", id)
    .single();

  if (jobError || !job) return notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user?.id).single();

  // 2. ОТМЕТКА О ПРОЧТЕНИИ (Если бухгалтер зашел — помечаем)
  if (user && profile?.role === 'accountant') {
    await supabase.from("job_views").upsert({ job_id: id, user_id: user.id }, { onConflict: 'job_id,user_id' });
  }

  const { data: existingBid } = await supabase.from("bids").select("id").eq("job_id", id).eq("accountant_id", user?.id).maybeSingle();

  const isJobOwner = job.client_id === user?.id;
  const isSelectedAccountant = job.accountant_id === user?.id;
  const hasAssignee = !!job.accountant_id;

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8">
      <Link
        href="/jobs"
        className="flex items-center text-xs sm:text-sm text-slate-500 hover:text-blue-600 mb-4 sm:mb-6 transition-colors w-fit"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Назад к ленте
      </Link>

      <Card className="border-none shadow-xl overflow-hidden bg-white mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl">
        <div className={`h-2 ${job.status === 'open' ? 'bg-blue-600' : 'bg-green-500'}`} />
        <CardHeader className="border-b p-5 sm:p-7 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Badge className="bg-slate-100 text-slate-600 text-xs sm:text-sm px-3 py-1 rounded-full">
                  {job.category}
                </Badge>
                {job.status !== 'open' && (
                  <Badge className="bg-green-100 text-green-700 border-none italic">
                    {job.status === 'in_progress' ? 'В работе' : 'Завершен'}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                {job.title}
              </CardTitle>
              <div className="flex items-center text-slate-500 text-xs sm:text-sm font-medium">
                <User className="mr-2 h-4 w-4" /> Заказчик: {job.profiles?.full_name || "Не указан"}
              </div>
            </div>
            <div className="bg-blue-50 p-4 sm:p-5 rounded-2xl border border-blue-100 min-w-[180px] text-center md:text-right">
              <div className="text-[10px] sm:text-xs text-blue-600 font-bold uppercase tracking-wider mb-1 flex items-center justify-center md:justify-end">
                <Wallet className="mr-1 h-3 w-3" /> Бюджет
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {job.budget ? `${job.budget.toLocaleString()} ₸` : "Договорная"}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-7 md:p-8">
          <div className="prose max-w-none mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4 flex items-center">
              Описание задачи
            </h3>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
              {job.description}
            </p>
          </div>

          <div className="pt-6 sm:pt-8 border-t border-slate-100 space-y-6 sm:space-y-8">
            {hasAssignee && (isSelectedAccountant || isJobOwner) ? (
              <div className="space-y-6 sm:space-y-8">
                <div className="bg-green-50 p-4 sm:p-6 rounded-xl border border-green-100 flex items-start gap-3 sm:gap-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-green-900 text-base sm:text-lg">Проект активен</h4>
                    <p className="text-green-700 text-sm sm:text-base">
                      {isJobOwner
                        ? "Вы выбрали исполнителя. Чат открыт."
                        : "Вы исполнитель. Обсудите детали с заказчиком."}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 text-slate-800">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg sm:text-xl font-bold">Чат по проекту</h3>
                  </div>
                  {user && <Chat jobId={job.id} userId={user.id} />}
                </div>
              </div>
            ) : profile?.role === 'accountant' && job.status === 'open' ? (
              <div className="space-y-6">
                {existingBid ? (
                  <div className="bg-amber-50 p-4 sm:p-6 rounded-xl border border-amber-100 flex items-start gap-3 sm:gap-4">
                    <AlertCircle className="h-8 w-8 text-amber-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-amber-900 text-base sm:text-lg">Отклик отправлен</h4>
                      <p className="text-amber-700 text-sm sm:text-base">Ожидайте решения заказчика.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">Откликнуться на заказ</h3>
                    <BidForm jobId={job.id} />
                  </>
                )}
              </div>
            ) : isJobOwner && job.status === 'open' ? (
              <div className="p-6 sm:p-8 bg-blue-50 rounded-2xl border border-blue-100 text-center space-y-3 sm:space-y-4">
                <Clock className="h-10 w-10 text-blue-600 mx-auto" />
                <h4 className="text-lg sm:text-xl font-bold text-blue-900">Ожидание откликов</h4>
                <p className="text-blue-700 text-sm sm:text-base">
                  Выберите исполнителя в личном кабинете.
                </p>
                <Link
                  href="/dashboard/my-jobs"
                  className="inline-flex items-center justify-center bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all text-sm sm:text-base"
                >
                  Управлять откликами
                </Link>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg text-slate-500 text-center text-xs sm:text-sm">
                {job.status !== 'open' ? "Прием откликов завершен." : "Авторизуйтесь для просмотра."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}