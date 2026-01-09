import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Star, CheckCircle, MessageSquare, Briefcase, Calendar, User, LogOut, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const revalidate = 0;

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Проверяем, авторизован ли текущий пользователь
  const { data: { user } } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === id;
  
  // Server action для выхода
  async function signOut() {
    "use server";
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Ошибка при выходе:', error);
    }
    redirect("/login");
  }

  // Загружаем профиль
  const { data: profile } = await supabase
    .from("profiles")
    .select('*')
    .eq("id", id)
    .single();

  if (!profile) return notFound();

  // Загружаем данные в зависимости от роли
  let reviews: any[] = []
  let finishedProjects: any[] = []
  let createdJobs: any[] = []

  if (profile.role === 'accountant') {
    // Для бухгалтера: отзывы и выполненные проекты
    const { data: profileWithData } = await supabase
      .from("profiles")
      .select(`
        *,
        reviews:reviews!accountant_id(
          id, rating, comment, created_at,
          jobs:job_id(title)
        ),
        completed_jobs:jobs!accountant_id(
          id, title, status, created_at
        )
      `)
      .eq("id", id)
      .single()

    reviews = profileWithData?.reviews || []
    finishedProjects = profileWithData?.completed_jobs?.filter((j: any) => j.status === 'completed') || []
  } else {
    // Для заказчика: созданные заказы
    const { data: jobs } = await supabase
      .from("jobs")
      .select('id, title, status, created_at, accountant_id')
      .eq("client_id", id)
      .order('created_at', { ascending: false })

    createdJobs = jobs || []
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ЛЕВАЯ КОЛОНКА: ИНФО */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-xl bg-gradient-to-b from-blue-600 to-blue-700 text-white overflow-hidden">
            <CardContent className="pt-8 text-center">
              <div className="h-24 w-24 bg-white/20 backdrop-blur-md rounded-3xl mx-auto flex items-center justify-center text-4xl font-black mb-4 border border-white/30">
                {profile.full_name?.[0]}
              </div>
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              <p className="text-blue-100 text-sm mt-1">
                {profile.role === 'accountant' ? profile.specialization : 'Заказчик'}
              </p>
              
              <div className="mt-6 flex justify-center gap-4 border-t border-white/10 pt-6">
                {profile.role === 'accountant' ? (
                  <>
                    <div className="text-center">
                      <p className="text-2xl font-black">{profile.rating_avg?.toFixed(1) || "0.0"}</p>
                      <p className="text-[10px] uppercase opacity-70 tracking-widest">Рейтинг</p>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div className="text-center">
                      <p className="text-2xl font-black">{profile.reviews_count || 0}</p>
                      <p className="text-[10px] uppercase opacity-70 tracking-widest">Отзывов</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <p className="text-2xl font-black">{createdJobs.length}</p>
                      <p className="text-[10px] uppercase opacity-70 tracking-widest">Заказов</p>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div className="text-center">
                      <p className="text-2xl font-black">{createdJobs.filter((j: any) => j.accountant_id).length}</p>
                      <p className="text-[10px] uppercase opacity-70 tracking-widest">В работе</p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Кнопки для своего профиля */}
              {isOwnProfile && (
                <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                  <Link href="/dashboard">
                    <Button 
                      variant="outline" 
                      className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Панель управления
                    </Button>
                  </Link>
                  <form action={signOut}>
                    <Button 
                      type="submit"
                      variant="outline" 
                      className="w-full bg-red-500/20 hover:bg-red-500/30 text-white border-red-300/30"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Выйти из аккаунта
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                <User className="w-4 h-4 text-blue-600" /> 
                {profile.role === 'accountant' ? 'О специалисте' : 'О пользователе'}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {profile.bio || (profile.role === 'accountant' 
                  ? "Специалист еще не заполнил информацию о себе." 
                  : "Пользователь еще не заполнил информацию о себе.")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ОТЗЫВЫ И ПРОЕКТЫ / ЗАКАЗЫ */}
        <div className="lg:col-span-2 space-y-8">
          {profile.role === 'accountant' ? (
            <>
              {/* Секция выполненных работ (только для бухгалтеров) */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" /> 
                  Выполненные проекты ({finishedProjects.length})
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {finishedProjects.length > 0 ? (
                    finishedProjects.map((project: any) => (
                      <div key={project.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                        <div>
                          <h4 className="font-semibold text-slate-800">{project.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> 
                            Завершен: {new Date(project.created_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <Badge className="bg-green-50 text-green-700 border-green-100 hover:bg-green-50">Выполнен</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm italic">Список проектов пуст</p>
                  )}
                </div>
              </section>

              {/* Секция отзывов (только для бухгалтеров) */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" /> 
                  Отзывы клиентов
                </h2>
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review: any) => (
                      <Card key={review.id} className="border-none shadow-sm bg-slate-50/50">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {new Date(review.created_at).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                          <p className="text-slate-700 mb-4 text-sm leading-relaxed italic">"{review.comment}"</p>
                          <div className="flex items-center gap-2 text-[10px] text-blue-600 font-black uppercase tracking-tighter bg-blue-50 w-fit px-2 py-1 rounded">
                            <CheckCircle className="w-3 h-3" /> Проект: {review.jobs?.title}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <p className="text-slate-400 text-sm">Отзывов пока нет</p>
                    </div>
                  )}
                </div>
              </section>
            </>
          ) : (
            /* Секция созданных заказов (для заказчиков) */
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" /> 
                Мои заказы ({createdJobs.length})
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {createdJobs.length > 0 ? (
                  createdJobs.map((job: any) => (
                    <Link 
                      key={job.id} 
                      href={`/jobs/${job.id}`}
                      className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div>
                        <h4 className="font-semibold text-slate-800">{job.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> 
                          Создан: {new Date(job.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <Badge className={
                        job.status === 'completed' 
                          ? 'bg-green-50 text-green-700 border-green-100' 
                          : job.accountant_id 
                          ? 'bg-blue-50 text-blue-700 border-blue-100' 
                          : 'bg-slate-50 text-slate-700 border-slate-100'
                      }>
                        {job.status === 'completed' ? 'Завершен' : job.accountant_id ? 'В работе' : 'Ожидает'}
                      </Badge>
                    </Link>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm italic">Список заказов пуст</p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}