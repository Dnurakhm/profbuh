'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { useUserMode } from '@/context/user-mode-context'
import {
  Menu,
  X,
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  UserCircle,
  Search,
  Repeat,
  FileText,
  MessageSquare,
  LogOut
} from 'lucide-react'
import Notifications from './notifications'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [totalUnreadCount, setTotalUnreadCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()
  const router = useRouter()
  const { mode, toggleMode } = useUserMode()

  // Функция для предзагрузки данных (SSR страниц)
  const prefetchLink = (href: string) => {
    router.prefetch(href)
  }

  useEffect(() => {
    setMounted(true)
    const getData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user || null
        setUser(user)
        if (user) {
          const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
          setProfile(data)
        }
      } catch (error) {
        console.error('Error in getData:', error)
      }
    }
    getData()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      const user = session?.user || null
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      } else {
        setProfile(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Получение общего количества непрочитанных сообщений
  useEffect(() => {
    if (!user) return

    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('messages')
        .select('id, jobs!inner(status)', { count: 'exact', head: true })
        .eq('jobs.status', 'in_progress')
        .neq('sender_id', user.id)
        .eq('is_read', false)

      setTotalUnreadCount(count || 0)
    }

    fetchUnreadCount()

    // Подписка на новые сообщения для обновления счетчика
    const channel = supabase
      .channel('navbar-unread-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        if (payload.new.sender_id !== user.id) {
          setTotalUnreadCount(prev => prev + 1)
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        // Если сообщение помечено как прочитанное нами
        if (payload.new.is_read && payload.old.is_read === false && payload.new.sender_id !== user.id) {
          setTotalUnreadCount(prev => Math.max(0, prev - 1))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getLinks = () => {
    if (!user) return []

    // Ссылки зависят от выбранного РЕЖИМА (mode), а не от сохраненной роли
    if (mode === 'specialist') {
      return [
        { name: 'Найти работу', href: '/jobs', icon: Search },
        { name: 'Мои отклики', href: '/dashboard/proposals', icon: FileText },
        { name: 'Активные контракты', href: '/dashboard/contracts', icon: Briefcase },
        { name: 'Чаты', href: '/dashboard/chat', icon: MessageSquare, badge: totalUnreadCount },
      ]
    }

    // Режим "Заказчик" (Client)
    return [
      { name: 'Мои заказы', href: '/dashboard/my-jobs', icon: LayoutDashboard },
      { name: 'Создать заказ', href: '/dashboard/my-jobs/new', icon: PlusCircle },
      { name: 'Специалисты', href: '/specialists', icon: UserCircle },
      { name: 'Чаты', href: '/dashboard/chat', icon: MessageSquare, badge: totalUnreadCount },
    ]
  }

  const links = getLinks()

  if (!mounted) {
    return (
      <nav className="h-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center gap-2">
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
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm/50 backdrop-blur-xl bg-white/80 support-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          <div className="flex items-center gap-8">
            <Link href={user ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center gap-2 group">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-xl italic">B</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Buh<span className="text-blue-600">App</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {user && links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => prefetchLink(link.href)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${pathname === link.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                  {link.badge && link.badge > 0 && (
                    <span className="ml-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                {/* MODE TOGGLE - HIDDEN FOR NOW (Restore if role switching is needed)
                <div onClick={toggleMode} className="cursor-pointer hidden md:flex items-center bg-slate-100 rounded-full p-1 border border-slate-200 relative w-[180px] h-9 select-none transition-all hover:border-blue-200">
                  <div
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-out ${mode === 'client' ? 'left-1' : 'left-[calc(50%)]'
                      }`}
                  />

                  <div className={`relative z-10 w-1/2 text-center text-[10px] uppercase font-black tracking-wider transition-colors duration-300 ${mode === 'client' ? 'text-blue-600' : 'text-slate-400'}`}>
                    Заказчик
                  </div>
                  <div className={`relative z-10 w-1/2 text-center text-[10px] uppercase font-black tracking-wider transition-colors duration-300 ${mode === 'specialist' ? 'text-blue-600' : 'text-slate-400'}`}>
                    Специалист
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-200 hidden md:block" />
                */}

                <Notifications userId={user.id} />

                <Link href={`/profile/${user.id}`}>
                  <div className="hidden md:flex items-center gap-3 pl-1 pr-2 py-1 rounded-full border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all">
                    <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                      {profile?.full_name?.[0] || user.email?.[0] || 'U'}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-bold text-slate-700 leading-none">
                        {profile?.full_name?.split(' ')[0] || 'User'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                        Профиль
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="h-6 w-px bg-slate-200 hidden md:block" />

                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
                  title="Выйти"
                >
                  <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold">Выйти</span>
                </button>
              </>
            ) : (
              <></>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
              >
                {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-2 animate-in slide-in-from-top duration-300">
          {/* USER MODE TOGGLE MOBILE - HIDDEN FOR NOW
          {user && (
            <div
              onClick={() => { toggleMode(); setIsOpen(false); }}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4 cursor-pointer active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-3">
                <Repeat className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-slate-700">Переключить режим</span>
              </div>
              <span className="text-xs font-black uppercase tracking-wider bg-white px-2 py-1 rounded border border-slate-100 text-slate-500">
                {mode === 'client' ? 'Заказчик' : 'Специалист'}
              </span>
            </div>
          )}
          */}

          {user && links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-bold transition-all ${pathname === link.href
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-600'
                }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <link.icon className="w-6 h-6" />
                {link.name}
              </div>
              {link.badge && link.badge > 0 && (
                <span className="flex h-6 min-w-[24px] px-2 items-center justify-center rounded-full bg-red-500 text-xs font-black text-white shadow-lg shadow-red-200">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
          {user && (
            <Link
              href={`/profile/${user.id}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-bold text-slate-600 hover:bg-slate-50"
            >
              <UserCircle className="w-6 h-6" />
              Мой профиль
            </Link>
          )}
          {!user && (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-4 px-4 py-4 rounded-2xl text-base font-bold text-white bg-blue-600 shadow-xl shadow-blue-200"
            >
              Войти / Регистрация
            </Link>
          )}

          {user && (
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 w-full px-4 py-4 rounded-2xl text-base font-bold text-red-600 hover:bg-red-50 transition-all active:scale-95"
              >
                <LogOut className="w-6 h-6" />
                Выйти из аккаунта
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}