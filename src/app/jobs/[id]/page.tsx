import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, User, ArrowLeft, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import BidForm from "./bid-form"; 

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JobPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Получаем данные заказа
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select(`*, profiles:client_id (full_name)`)
    .eq("id", id)
    .single();

  if (jobError || !job) return notFound();

  // 2. Получаем текущего пользователя и его роль
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  // 3. Проверяем, есть ли уже отклик от этого бухгалтера
  const { data: existingBid } = await supabase
    .from("bids")
    .select("id")
    .eq("job_id", id)
    .eq("accountant_id", user?.id)
    .maybeSingle(); // Используем maybeSingle, чтобы не было ошибки, если отклика нет

  // Проверяем, является ли текущий бухгалтер выбранным исполнителем
  const isSelectedAccountant = job.accountant_id === user?.id;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Link href="/jobs" className="flex items-center text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors w-fit">
        <ArrowLeft className="mr-2 h-4 w-4" /> Назад к списку
      </Link>

      <Card className="border-none shadow-xl overflow-hidden bg-white">
        <div className={`h-2 ${job.status === 'open' ? 'bg-blue-600' : 'bg-green-500'}`} />
        
        <CardHeader className="border-b p-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">{job.category}</Badge>
                {job.status !== 'open' && (
                  <Badge className="bg-green-100 text-green-700 border-none italic">
                    {job.status === 'in_progress' ? 'В работе' : 'Завершен'}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-3xl font-bold text-slate-900 leading-tight">
                {job.title}
              </CardTitle>
              <div className="flex items-center text-slate-500 text-sm font-medium">
                <User className="mr-2 h-4 w-4" /> 
                Заказчик: {job.profiles?.full_name || "Не указан"}
              </div>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 min-w-[200px] text-center md:text-right">
              <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1 flex items-center justify-center md:justify-end">
                <Wallet className="mr-1 h-3 w-3" /> Бюджет
              </div>
              <div className="text-2xl font-black text-slate-900">
                {job.budget ? `${job.budget.toLocaleString()} ₸` : "Договорная"}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <div className="prose max-w-none mb-10">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              Описание задачи
            </h3>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-lg">
              {job.description}
            </p>
          </div>

          <div className="pt-8 border-t border-slate-100">
            {/* 1. Если текущий пользователь — выбранный исполнитель */}
            {isSelectedAccountant ? (
              <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex items-center gap-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-green-900 text-lg">Вы — исполнитель!</h4>
                  <p className="text-green-700">Заказчик выбрал вашу кандидатуру. Приступайте к выполнению.</p>
                </div>
              </div>
            ) : 
            /* 2. Если пользователь — Бухгалтер и заказ открыт */
            profile?.role === 'accountant' && job.status === 'open' ? (
              <div className="space-y-6">
                {existingBid ? (
                  // Если отклик уже отправлен
                  <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 flex items-center gap-4">
                    <AlertCircle className="h-8 w-8 text-amber-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-amber-900 text-lg">Отклик уже отправлен</h4>
                      <p className="text-amber-700">Вы уже предложили свои услуги. Заказчик рассмотрит вашу заявку.</p>
                    </div>
                  </div>
                ) : (
                  // Если отклика еще нет — показываем форму
                  <>
                    <h3 className="text-xl font-bold text-slate-900">Откликнуться на заказ</h3>
                    <BidForm jobId={job.id} />
                  </>
                )}
              </div>
            ) : 
            /* 3. Если заказ закрыт или в работе */
            job.status !== 'open' ? (
              <div className="p-6 bg-slate-50 rounded-xl text-slate-500 text-center border border-dashed border-slate-300">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                Прием откликов завершен. Проект уже находится в стадии реализации или завершен.
              </div>
            ) : 
            /* 4. Если смотрит сам Заказчик */
            profile?.role === 'client' ? (
              <div className="p-4 bg-amber-50 rounded-lg text-amber-700 text-sm text-center border border-amber-100">
                Вы просматриваете свой заказ. Управлять откликами можно в <Link href="/dashboard/my-jobs" className="underline font-bold">Личном кабинете</Link>.
              </div>
            ) : (
              /* 5. Для неавторизованных или иных ролей */
              <div className="p-4 bg-slate-50 rounded-lg text-slate-500 text-sm text-center">
                Авторизуйтесь как бухгалтер, чтобы оставить отклик.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}