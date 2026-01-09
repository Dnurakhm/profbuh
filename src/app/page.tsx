import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, ShieldCheck, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-10 sm:py-16 md:py-20 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium border border-blue-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Более 500 проверенных бухгалтеров
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight">
            Бухгалтерия для бизнеса <br />
            <span className="text-blue-600 italic">без лишних хлопот</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Маркетплейс, где предприниматели находят профессиональных бухгалтеров для разовых задач или долгосрочного ведения учета.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-bold shadow-lg shadow-blue-200 rounded-2xl"
            >
              <Link href="/dashboard/my-jobs/new">Разместить заказ</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold border-slate-200 hover:bg-slate-50 rounded-2xl"
            >
              <Link href="/jobs">Найти работу</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 sm:py-16 md:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-3">
          <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Безопасность</h3>
            <p className="text-slate-600">Система рейтингов и проверенные профили гарантируют качество выполняемых работ.</p>
          </div>

          <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Простота</h3>
            <p className="text-slate-600">Создайте заказ за 2 минуты и получите первые отклики уже через полчаса.</p>
          </div>

          <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Выбор</h3>
            <p className="text-slate-600">Сотни специалистов разного уровня под любой бюджет и специфику бизнеса.</p>
          </div>
        </div>
      </section>

      {/* Footer-like section */}
      <section className="py-12 sm:py-16 md:py-20 text-center bg-white">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 sm:mb-6">Готовы начать?</h2>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all text-base sm:text-lg"
        >
          Зарегистрируйтесь сейчас <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
      </section>
    </div>
  );
}