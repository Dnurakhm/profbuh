import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, ShieldCheck, ArrowRight, Briefcase, Star, TrendingUp, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 md:py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold border border-white/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Более 500 проверенных бухгалтеров
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-tight">
              Найдите идеального<br />
              <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">бухгалтера</span> для вашего бизнеса
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-medium">
              Профессиональные бухгалтеры для разовых задач или долгосрочного ведения учета. Быстро, надежно, прозрачно.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {user ? (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 h-14 px-8 text-lg font-black shadow-2xl shadow-blue-900/30 rounded-2xl"
                  >
                    <Link href="/dashboard">Перейти в панель</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-white/10 backdrop-blur-md text-white border-white/30 hover:bg-white/20 rounded-2xl"
                  >
                    <Link href="/specialists">Найти специалиста</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 h-14 px-8 text-lg font-black shadow-2xl shadow-blue-900/30 rounded-2xl"
                  >
                    <Link href="/login">Начать работу</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-white/10 backdrop-blur-md text-white border-white/30 hover:bg-white/20 rounded-2xl"
                  >
                    <Link href="/specialists">Найти специалиста</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-white/80">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold">4.8 средний рейтинг</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-bold">1000+ выполненных заказов</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm font-bold">500+ специалистов</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Как это работает?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Три простых шага до начала сотрудничества
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg">
                1
              </div>
              <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 h-full pt-12">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Опубликуйте заказ</h3>
                <p className="text-slate-600 leading-relaxed">
                  Опишите задачу, укажите бюджет и сроки. Это займет всего 2 минуты.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg">
                2
              </div>
              <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 h-full pt-12">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-4">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Выберите специалиста</h3>
                <p className="text-slate-600 leading-relaxed">
                  Получите отклики от проверенных бухгалтеров и выберите лучшего.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg">
                3
              </div>
              <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 h-full pt-12">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
                  <Briefcase className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Работайте и платите</h3>
                <p className="text-slate-600 leading-relaxed">
                  Работайте напрямую со специалистом. Оплата после выполнения работы.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Почему выбирают нас?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Платформа, которой доверяют тысячи предпринимателей
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Проверенные специалисты</h3>
              <p className="text-slate-600 leading-relaxed">
                Система рейтингов и отзывов помогает выбрать надежного исполнителя.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Быстрый старт</h3>
              <p className="text-slate-600 leading-relaxed">
                Первые отклики уже через 30 минут после публикации заказа.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Широкий выбор</h3>
              <p className="text-slate-600 leading-relaxed">
                Сотни специалистов под любой бюджет и специфику бизнеса.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
            Готовы найти своего бухгалтера?
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам предпринимателей, которые уже нашли надежных специалистов
          </p>
          <Button
            asChild
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg font-black shadow-2xl shadow-blue-500/30 rounded-2xl"
          >
            <Link href="/login" className="inline-flex items-center gap-2">
              Начать сейчас <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}