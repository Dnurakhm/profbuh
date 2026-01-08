import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Briefcase, UserCircle } from "lucide-react";
import RoleButtons from "./role-buttons"; // Мы сейчас создадим этот файл

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Проверяем, может пользователь уже выбрал роль?
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role) {
    redirect("/onboarding/complete");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Добро пожаловать в ProfBuh</CardTitle>
          <CardDescription>Выберите вашу роль в системе</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Передаем логику в клиентский компонент */}
          <RoleButtons /> 
        </CardContent>
      </Card>
    </div>
  );
}