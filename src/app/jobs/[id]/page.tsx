import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ApplyForm } from "./apply-form"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Calendar,
  Banknote,
  Briefcase,
  Clock,
  ChevronLeft,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Получаем детали заказа
  const { data: job, error } = await supabase
    .from('jobs')
    .select(`
            *,
            profiles:client_id (full_name)
        `)
    .eq('id', id)
    .single()

  if (error || !job) {
    return notFound()
  }

  // Проверяем, не подавал ли уже этот пользователь заявку
  const { data: myBid } = await supabase
    .from('bids')
    .select('id')
    .eq('job_id', id)
    .eq('accountant_id', user.id)
    .single()

  const hasApplied = !!myBid
  const isOwner = job.client_id === user.id
  const isHired = job.accountant_id === user.id

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* ... (header and other stuff remains same) ... */}
// ... this is tricky because I need to replace parts of the file while keeping others.
      // I'll use replace_file_content with a larger block to ensure context.

      <Link
        href="/jobs"
        className="inline-flex items-center text-slate-500 hover:text-blue-600 font-medium mb-8 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Назад к поиску
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая колонка: Информация о заказе */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 px-4 py-1.5 text-sm font-bold">
                {job.category || 'Общее'}
              </Badge>
              <span className="flex items-center text-slate-400 text-sm font-medium">
                <Clock className="w-4 h-4 mr-1.5" />
                Опубликовано {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight">
              {job.title}
            </h1>

            <div className="flex flex-col sm:flex-row gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm">
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Бюджет</p>
                  <p className="text-xl font-black text-slate-900">
                    {job.budget ? `${job.budget.toLocaleString('ru-RU')} ₸` : 'Договорная'}
                  </p>
                </div>
              </div>
              <div className="w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Статус</p>
                  <p className="text-xl font-black text-slate-900">
                    {isHired ? (
                      <span className="text-green-600">Вас выбрали исполнителем! 🎉</span>
                    ) : job.status === 'open' ? (
                      'Открыт для предложений'
                    ) : (
                      'В работе'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Описание задачи</h3>
              <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4">О заказчике</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-bold text-slate-400">
                {job.profiles?.full_name?.[0] || '?'}
              </div>
              <div>
                <p className="font-bold text-lg text-slate-900">{job.profiles?.full_name || 'Не указан'}</p>
                <p className="text-slate-500">Заказчик на платформе</p>
              </div>
            </div>
          </div>
        </div>

        {/* Правая колонка: Форма отклика */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            {isOwner ? (
              <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-amber-900 mb-2">Это ваш заказ</h3>
                <p className="text-amber-700 mb-6">
                  Вы не можете откликнуться на собственный заказ.
                </p>
                <Link
                  href={`/dashboard/my-jobs/${id}`}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-amber-200 px-6 font-bold text-amber-900 hover:bg-amber-300 transition-colors"
                >
                  Управлять заказом
                </Link>
              </div>
            ) : (
              <ApplyForm
                jobId={id}
                currentUserId={user.id}
                hasApplied={hasApplied}
                isHired={isHired}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}