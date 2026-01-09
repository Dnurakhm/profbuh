import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  
  // Действие для Входа
  async function signIn(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // В реальном проекте здесь лучше передавать ошибку через query-параметры
      return redirect("/login?error=Invalid credentials");
    }

    redirect("/dashboard");
  }

  // Действие для Регистрации
  async function signUp(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:3000/auth/callback",
      },
    });

    if (error) {
      return redirect("/login?error=" + error.message);
    }

    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 py-6">
      <Card className="w-full max-w-sm sm:max-w-md rounded-3xl shadow-xl border-slate-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-bold tracking-tight">ProfBuh</CardTitle>
          <CardDescription className="text-center">
            Войдите в систему или создайте новый аккаунт
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="mail@example.kz" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Button formAction={signIn} className="bg-blue-600 hover:bg-blue-700 h-11 rounded-2xl text-sm font-semibold">
                Войти
              </Button>
              <Button formAction={signUp} variant="outline" className="h-11 rounded-2xl text-sm font-semibold">
                Регистрация
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}