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

  LogOut,

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

      const { data: { user } } = await supabase.auth.getUser()

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

    // Загружаем данные сразу
    getData()

    // Подписываемся на изменения auth состояния
    const { data: { subscription } } = supabase.auth.onAuthStateChange(

      async (event, session) => {

        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {

          await getData()

        }

      }

    )

    // Очищаем подписку при размонтировании
    return () => {

      subscription.unsubscribe()

    }

  }, [])



  const handleLogout = async (e?: React.MouseEvent) => {

    e?.preventDefault()

    e?.stopPropagation()

    try {

      const { error } = await supabase.auth.signOut()

      if (error) {

        console.error('Ошибка при выходе:', error)

        alert('Ошибка при выходе: ' + error.message)

        return

      }

      // Небольшая задержка перед редиректом, чтобы подписка успела обработать SIGNED_OUT
      setTimeout(() => {

        window.location.href = '/login'

      }, 100)

    } catch (err) {

      console.error('Неожиданная ошибка при выходе:', err)

      alert('Произошла ошибка при выходе')

    }

  }



  const getLinks = () => {

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

    ]

  }



  const links = getLinks()



  if (!mounted) return <nav className="h-16 bg-white border-b border-slate-100" />



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

            {user && links.map((link) => (

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

            ))}

           

            {user ? (

              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-100">

                {/* КОЛОКОЛЬЧИК УВЕДОМЛЕНИЙ */}

                <Notifications userId={user.id} />

               

                <div className="flex flex-col items-end mr-2 ml-2">

                  <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">

                    {profile?.role === 'accountant' ? 'Бухгалтер' : 'Заказчик'}

                  </span>

                  <span className="text-sm font-bold text-slate-700 leading-none">

                    {profile?.full_name?.split(' ')[0]}

                  </span>

                </div>

               

                <Button

                  type="button"

                  variant="ghost"

                  size="icon"

                  onClick={handleLogout}

                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full h-10 w-10"

                >

                  <LogOut className="w-5 h-5" />

                </Button>

              </div>

            ) : (

              <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 font-bold shadow-md shadow-blue-100">

                <Link href="/login">Войти</Link>

              </Button>

            )}

          </div>



          {/* Mobile menu button */}

          <div className="md:hidden flex items-center gap-3">

            {/* Колокольчик в мобильной версии рядом с меню */}

            {user && <Notifications userId={user.id} />}

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

          {user && links.map((link) => (

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

         

          {user ? (

            <button

              type="button"

              onClick={handleLogout}

              className="flex w-full items-center gap-4 px-4 py-4 rounded-2xl text-base font-bold text-red-500 bg-red-50/50 hover:bg-red-50 transition-all"

            >

              <LogOut className="w-6 h-6" />

              Выйти из аккаунта

            </button>

          ) : (

            <Link

              href="/login"

              onClick={() => setIsOpen(false)}

              className="flex items-center justify-center w-full py-4 rounded-2xl bg-blue-600 text-white font-bold"

            >

              Войти в BuhApp

            </Link>

          )}

        </div>

      )}

    </nav>

  )

}