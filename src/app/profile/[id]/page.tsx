import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Star, CheckCircle, MessageSquare, Briefcase, Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0;

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Загружаем профиль, отзывы и выполненные заказы
  const { data: profile } = await supabase
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
    .single();

  if (!profile) return notFound();

  // Фильтруем только реально завершенные проекты
  const finishedProjects = profile.completed_jobs?.filter((j: any) => j.status === 'completed') || [];

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
              <p className="text-blue-100 text-sm mt-1">{profile.specialization}</p>
              
              <div className="mt-6 flex justify-center gap-4 border-t border-white/10 pt-6">
                <div className="text-center">
                  <p className="text-2xl font-black">{profile.rating_avg?.toFixed(1) || "0.0"}</p>
                  <p className="text-[10px] uppercase opacity-70 tracking-widest">Рейтинг</p>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-black">{profile.reviews_count || 0}</p>
                  <p className="text-[10px] uppercase opacity-70 tracking-widest">Отзывов</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                <User className="w-4 h-4 text-blue-600" /> О специалисте
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {profile.bio || "Специалист еще не заполнил информацию о себе."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ОТЗЫВЫ И ПРОЕКТЫ */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Секция выполненных работ */}
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

          {/* Секция отзывов */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" /> 
              Отзывы клиентов
            </h2>
            <div className="space-y-4">
              {profile.reviews && profile.reviews.length > 0 ? (
                profile.reviews.map((review: any) => (
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
        </div>
      </div>
    </div>
  );
}