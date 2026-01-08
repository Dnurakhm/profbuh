import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Если есть код подтверждения, обмениваем его на сессию
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await (await supabase).auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Возвращаем пользователя на страницу ошибки, если что-то пошло не так
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}