'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Bell, MessageSquare, Clock, UserPlus, CheckCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Функция для получения иконок в зависимости от типа
  const getIcon = (type: string, isRead: boolean) => {
    const className = isRead ? "text-slate-400" : "text-white"
    switch (type) {
      case 'chat_message': return <MessageSquare size={20} className={className} />
      case 'new_bid': return <UserPlus size={20} className={className} />
      case 'job_assigned': return <CheckCircle size={20} className={className} />
      default: return <Bell size={20} className={className} />
    }
  }

  // Функция для пометки уведомления как прочитанного
  const markAsRead = async (notificationId: string, link: string) => {
    // Помечаем как прочитанное в базе
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
    
    // Обновляем локальное состояние
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    )
    
    // Переходим по ссылке
    window.location.href = link
  }

  useEffect(() => {
    let channel: any = null
    
    const initNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Загружаем только последние 50 уведомлений для быстрой загрузки
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) {
          console.error('Error loading notifications:', error)
        } else if (data) {
          setNotifications(data)
        }
      } catch (error) {
        console.error('Error in initNotifications:', error)
      } finally {
        setLoading(false)
      }
    }

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      channel = supabase
        .channel(`notifications-page-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            // Оптимистично добавляем новое уведомление без полной перезагрузки
            setNotifications(prev => [payload.new as any, ...prev])
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            // Обновляем только измененное уведомление
            setNotifications(prev => 
              prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n)
            )
          }
        )
        .subscribe()
    }

    // Загружаем данные и настраиваем realtime параллельно
    initNotifications()
    setupRealtime()

    // Cleanup функция
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-medium">Загрузка уведомлений...</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-100 text-white">
            <Bell size={24} fill="currentColor" />
          </div>
          Уведомления
        </h1>
      </div>

      {/* Список */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-medium">У вас пока нет уведомлений</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id, n.link || '#')}
              className={`group block relative p-5 rounded-3xl border transition-all duration-500 cursor-pointer ${
                n.is_read 
                  ? 'bg-white border-slate-100 opacity-60' 
                  : 'bg-white border-blue-200 shadow-xl shadow-blue-50 ring-1 ring-blue-100' 
              }`}
            >
              {/* Акцентная полоска для новых */}
              {!n.is_read && (
                <div className="absolute left-0 top-6 bottom-6 w-1.5 bg-blue-600 rounded-r-full shadow-[2px_0_10px_rgba(37,99,235,0.4)]" />
              )}

              <div className="flex gap-5 items-center">
                {/* Иконка */}
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  n.is_read ? 'bg-slate-100' : 'bg-blue-600 shadow-lg shadow-blue-200 rotate-3 group-hover:rotate-0'
                }`}>
                  {getIcon(n.type, n.is_read)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`transition-all duration-500 truncate pr-6 ${
                      n.is_read ? 'text-slate-600 font-bold' : 'text-slate-900 font-black text-xl tracking-tight'
                    }`}>
                      {n.title}
                      {n.notification_count > 1 && (
                        <span className="ml-2 text-sm text-blue-600 font-bold">
                          ({n.notification_count})
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                      <Clock size={12} />
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <p className={`text-sm leading-relaxed transition-all duration-500 ${
                    n.is_read ? 'text-slate-500 font-normal' : 'text-slate-800 font-bold'
                  }`}>
                    {n.content}
                  </p>
                </div>

                <div className="ml-2 text-slate-300 group-hover:text-blue-600 transition-colors">
                  <ChevronRight size={24} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}