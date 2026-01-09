'use client'

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginFormContent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      setError('Заполните все поля')
      setLoading(false)
      return
    }

    // Сначала пытаемся войти
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // Если вход успешен
    if (!signInError && signInData.user) {
      // Полная перезагрузка страницы для обновления всех компонентов
      window.location.replace(redirectTo)
      return
    }

    // Если ошибка входа - проверяем, может быть пользователь не существует
    // Пытаемся зарегистрировать
    if (signInError) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        // Если регистрация тоже не удалась - показываем ошибку
        setError(signUpError.message || signInError.message)
        setLoading(false)
        return
      }

      // Регистрация успешна - переходим на onboarding
      window.location.replace('/onboarding')
      return
    }

    setLoading(false)
  }

  return (
    <Card className="w-full max-w-sm sm:max-w-md rounded-3xl shadow-xl border-slate-100">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center font-bold tracking-tight">ProfBuh</CardTitle>
        <CardDescription className="text-center">
          Войдите в систему или создайте новый аккаунт
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="mail@example.kz" 
              required 
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          
          <Button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 h-11 rounded-2xl text-sm font-semibold"
          >
            {loading ? 'Обработка...' : 'Войти / Зарегистрироваться'}
          </Button>
          
          <p className="text-xs text-center text-slate-500">
            Если аккаунт существует - войдете, если нет - зарегистрируетесь
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

export default function LoginForm() {
  return (
    <Suspense fallback={
      <Card className="w-full max-w-sm sm:max-w-md rounded-3xl shadow-xl border-slate-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-bold tracking-tight">ProfBuh</CardTitle>
          <CardDescription className="text-center">
            Загрузка...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-11 bg-slate-100 rounded-2xl animate-pulse" />
          </div>
        </CardContent>
      </Card>
    }>
      <LoginFormContent />
    </Suspense>
  )
}
