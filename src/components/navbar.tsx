 'use client'



import { useState, useEffect } from 'react'

import Link from 'next/link'

import { usePathname } from 'next/navigation'

import { createClient } from '@/utils/supabase/client'

import { Button } from '@/components/ui/button'

import {

  Menu,

  X,

  LayoutDashboard,

  Briefcase,

  PlusCircle,

  UserCircle,

} from 'lucide-react'

import Notifications from './notifications' // Импорт нашего нового компонента



export default function Navbar() {

  const [isOpen, setIsOpen] = useState(false)

  const [user, setUser] = useState<any>(null)

  const [profile, setProfile] = useState<any>(null)

  const [mounted, setMounted] = useState(false)

  const pathname = usePathname()

  const supabase = createClient()



  useEffect(() => {
    setMounted(true)

    const getData = async () => {
      try {
        // Сначала получаем сессию, чтобы убедиться, что cookies загружены
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user || null
        
        console.log('Session loaded:', session?.user?.id)
        setUser(user)

        if (user) {
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileError) {
            console.error('Error loading profile:', profileError)
            setProfile(null)
          } else {
            console.log('Profile loaded:', data?.role)
            setProfile(data)
          }
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error('Error in getData:', error)
        setUser(null)
        setProfile(null)
      }
    }

    // Загружаем данные сразу
    getData()

    // Подписываемся на изменения auth состояния
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        const user = session?.user || null
        setUser(user)
        
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          setProfile(data)
        } else {
          setProfile(null)
        }
      }
    )

    // Очищаем подписку при размонтировании
    return () => {
      subscription.unsubscribe()
    }
  }, [])






  const getLinks = () => {
    // Если пользователь не авторизован - нет ссылок
    if (!user) return []

    // Если пользователь авторизован, но профиль еще не загружен - показываем базовые ссылки
    if (user && !profile) {
      return [
        { name: 'Панель', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Профиль', href: `/profile/${user.id}`, icon: UserCircle },
      ]
    }

    // Если профиль загружен - показываем ссылки в зависимости от роли
    if (!profile) return []

    if (profile.role === 'accountant') {
      return [
        { name: 'Лента заказов', href: '/jobs', icon: Briefcase },
        { name: 'Моя работа', href: '/dashboard/my-work', icon: LayoutDashboard },
        { name: 'Профиль', href: `/profile/${user?.id}`, icon: UserCircle },
        { name: 'Настройки', href: '/dashboard/settings', icon: PlusCircle },
      ]
    }

    return [
      { name: 'Мои заказы', href: '/dashboard/my-jobs', icon: LayoutDashboard },
      { name: 'Создать заказ', href: '/dashboard/my-jobs/new', icon: PlusCircle },
      { name: 'Профиль', href: `/profile/${user?.id}`, icon: UserCircle },
    ]
  }

  const links = getLinks()



  // Показываем минимальный navbar во время загрузки
  if (!mounted) {
    return (
      <nav className="h-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <span className="text-white font-black text-xl italic">B</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Buh<span className="text-blue-600">App</span>
              </span>
            </Link>
          </div>
        </div>
      </nav>
    )
  }



  return (

    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between h-16">

         

          {/* Logo */}

          <div className="flex items-center">

            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">

              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">

                <span className="text-white font-black text-xl italic">B</span>

              </div>

              <span className="font-bold text-xl tracking-tight text-slate-900">

                Buh<span className="text-blue-600">App</span>

              </span>

            </Link>

          </div>



          {/* Desktop Navigation */}

          <div className="hidden md:flex items-center space-x-1">

            {user && links.length > 0 ? links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  pathname === link.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            )) : user && (
              // Показываем хотя бы базовые ссылки, если пользователь авторизован
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Панель
                </Link>
                {user.id && (
                  <Link
                    href={`/profile/${user.id}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                  >
                    <UserCircle className="w-4 h-4" />
                    Профиль
                  </Link>
                )}
              </>
            )}

            {user && user.id && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-100">
                {/* КОЛОКОЛЬЧИК УВЕДОМЛЕНИЙ */}
                <Notifications userId={user.id} />

                {(profile?.full_name || profile?.role) && (
                  <div className="flex flex-col items-end mr-2 ml-2">
                    {profile?.role && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                        {profile.role === 'accountant' ? 'Бухгалтер' : 'Заказчик'}
                      </span>
                    )}
                    {profile?.full_name && (
                      <span className="text-sm font-bold text-slate-700 leading-none">
                        {profile.full_name.split(' ')[0]}
                      </span>
                    )}
                  </div>
                )}

                {/* Ссылка на профиль вместо кнопки выхода */}
                <Link href={`/profile/${user.id}`}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full h-10 w-10"
                  >
                    <UserCircle className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            )}

          </div>



          {/* Mobile menu button */}

          <div className="md:hidden flex items-center gap-3">

            {/* Колокольчик в мобильной версии рядом с меню */}

            {user && user.id && <Notifications userId={user.id} />}

            <button

              onClick={() => setIsOpen(!isOpen)}

              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"

            >

              {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}

            </button>

          </div>

        </div>

      </div>



      {/* Mobile Menu */}

      {isOpen && (

        <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-2 animate-in slide-in-from-top duration-300">

          {user && links.length > 0 && links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-bold transition-all ${
                pathname === link.href
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-600 bg-slate-50/50'
              }`}
            >
              <link.icon className="w-6 h-6" />
              {link.name}
            </Link>
          ))}

          {user && user.id && (
            <Link
              href={`/profile/${user.id}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-all"
            >
              <UserCircle className="w-6 h-6" />
              Мой профиль
            </Link>
          )}

        </div>

      )}

    </nav>

  )

}