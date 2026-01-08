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
  UserCircle
} from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
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
      }
    }
    getData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  // Ссылки для Заказчика
  const clientLinks = [
    { name: 'Мои заказы', href: '/dashboard/my-jobs', icon: LayoutDashboard },
    { name: 'Создать заказ', href: '/dashboard/my-jobs/new', icon: PlusCircle },
  ]

  // Ссылки для Бухгалтера
  const accountantLinks = [
    { name: 'Лента заказов', href: '/jobs', icon: Briefcase },
    { name: 'Моя работа', href: '/dashboard/my-work', icon: LayoutDashboard },
  ]

  const links = profile?.role === 'accountant' ? accountantLinks : clientLinks

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xl italic">B</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Buh<span className="text-blue-600">App</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user && links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <UserCircle className="w-4 h-4" />
                  {profile?.full_name}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button asChild variant="default" size="sm" className="bg-blue-600">
                <Link href="/login">Войти</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-50 outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user && links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${
                  pathname === link.href 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.name}
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-500 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                Выйти
              </button>
            ) : (
              <Link
                href="/login"
                className="block px-3 py-3 rounded-md text-base font-medium text-blue-600"
              >
                Войти
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}