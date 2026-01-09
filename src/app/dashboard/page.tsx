import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Briefcase, PlusCircle, Search, LogOut } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="py-6 space-y-6 sm:space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 sm:pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Панель управления</h1>
          <p className="text-sm sm:text-base text-slate-500">
            Добро пожаловать, {profile?.full_name || 'Пользователь'}
          </p>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
          <form action={signOut}>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-red-600 rounded-full px-3 h-9"
            >
              <LogOut className="mr-2 h-4 w-4" /> Выйти
            </Button>
          </form>

          {profile?.role === 'client' ? (
            <Button asChild className="bg-blue-600 rounded-2xl h-10 sm:h-11 px-4 text-sm sm:text-base">
              <Link href="/jobs/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Разместить заказ
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="default"
              className="bg-slate-900 rounded-2xl h-10 sm:h-11 px-4 text-sm sm:text-base"
            >
              <Link href="/jobs">
                <Search className="mr-2 h-4 w-4" /> Найти работу
              </Link>
            </Button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Ваша роль</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.role === 'accountant' ? 'Бухгалтер' : 'Заказчик'}
            </div>
            <Link 
    href={profile?.role === 'accountant' ? "/dashboard/my-work" : "/dashboard/my-jobs"} 
    className="text-xs text-blue-600 hover:underline mt-1 block font-medium"
  >
    {profile?.role === 'accountant' ? 'Мои текущие проекты →' : 'Управление вашими задачами →'}
  </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}