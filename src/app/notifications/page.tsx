'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Bell, MessageSquare, Clock, UserPlus, CheckCircle, ChevronRight, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/providers/notification-provider'
import { format, isToday, isYesterday } from 'date-fns'
import { ru } from 'date-fns/locale'
import { NotificationSkeleton } from '@/components/ui/skeletons'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const { markAllAsRead: globalMarkAll, fetchCount, userId: currentUserId } = useNotifications()
  const initialized = useRef(false)

  // Группировка уведомлений по дате
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: any[] } = {
      'Сегодня': [],
      'Вчера': [],
      'Ранее': []
    }

    notifications.forEach(n => {
      const date = new Date(n.created_at)
      if (isToday(date)) groups['Сегодня'].push(n)
      else if (isYesterday(date)) groups['Вчера'].push(n)
      else groups['Ранее'].push(n)
    })

    return groups
  }, [notifications])

  const handleMarkAllAsRead = async () => {
    await globalMarkAll()
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

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
  const markAsRead = async (notificationId: string, link: string, isAlreadyRead: boolean) => {
    if (!isAlreadyRead) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId)

        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        )
        fetchCount()
      } catch (err) {
        console.error('NotificationsPage Error:', err)
      }
    }

    if (link && link !== '#') {
      router.push(link)
    }
  }

  useEffect(() => {
    if (!currentUserId || initialized.current) return;
    initialized.current = true;

    let channel: any = null

    const initNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (!error) {
          setNotifications(data || [])
        }
      } catch (error) {
        console.error('NotificationsPage Error:', error)
      } finally {
        setLoading(false)
      }
    }

    const setupRealtime = async () => {
      channel = supabase
        .channel(`notifications-page-sync-${currentUserId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${currentUserId}`,
          },
          (payload: any) => {
            if (payload.eventType === 'INSERT') {
              setNotifications(prev => [payload.new as any, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setNotifications(prev =>
                prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n)
              )
            }
          }
        )
        .subscribe()
    }

    initNotifications()
    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [currentUserId, supabase, fetchCount])

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 pb-20">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 bg-slate-100 rounded-[1.25rem] animate-pulse" />
        <div className="w-48 h-10 bg-slate-100 rounded-xl animate-pulse" />
      </div>
      <NotificationSkeleton />
    </div>
  )

  const hasUnread = notifications.some(n => !n.is_read)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 pb-20">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-blue-200 text-white rotate-3">
            <Bell size={28} fill="currentColor" />
          </div>
          Уведомления
        </h1>

        {hasUnread && (
          <Button
            variant="ghost"
            onClick={handleMarkAllAsRead}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold gap-2 rounded-xl"
          >
            <CheckCheck size={20} />
            Пометить всё как прочитанное
          </Button>
        )}
      </div>

      {/* Список */}
      <div className="space-y-8">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 sm:p-20 text-center border border-slate-100 shadow-sm transition-all">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell size={32} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Здесь пока пусто</h3>
            <p className="text-slate-400 font-medium text-sm">Мы сообщим вам о важных событиях</p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([group, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={group} className="space-y-4">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{group}</h2>
                <div className="grid gap-3">
                  {items.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id, n.link || '#', n.is_read)}
                      className={`group block relative p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border transition-all duration-300 cursor-pointer ${n.is_read
                        ? 'bg-white/50 border-slate-100 opacity-70 grayscale-[0.5]'
                        : 'bg-white border-blue-100 shadow-xl shadow-blue-50/50 ring-1 ring-blue-50'
                        } hover:scale-[1.01] active:scale-[0.99]`}
                    >
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center">
                        {/* Иконка */}
                        <div className="flex items-center justify-between w-full sm:w-auto">
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 ${n.is_read ? 'bg-slate-100' : 'bg-blue-600 shadow-lg shadow-blue-200 group-hover:rotate-6'
                            }`}>
                            {getIcon(n.type, n.is_read)}
                          </div>

                          <div className="sm:hidden flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                            {format(new Date(n.created_at), 'HH:mm')}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <h3 className={`transition-all duration-300 truncate leading-tight ${n.is_read ? 'text-slate-700 font-bold text-sm sm:text-base' : 'text-slate-900 font-black text-base sm:text-lg tracking-tight'
                              }`}>
                              {n.title}
                              {n.notification_count > 1 && (
                                <span className="ml-2 text-[10px] sm:text-sm text-blue-600 font-black px-2 py-0.5 bg-blue-50 rounded-lg">
                                  +{n.notification_count - 1}
                                </span>
                              )}
                            </h3>
                            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                              {format(new Date(n.created_at), 'HH:mm')}
                            </div>
                          </div>

                          <p className={`text-xs sm:text-sm leading-relaxed transition-all duration-300 line-clamp-2 ${n.is_read ? 'text-slate-500 font-medium' : 'text-slate-700 font-bold'
                            }`}>
                            {n.content}
                          </p>
                        </div>

                        <div className="hidden sm:block ml-2 text-slate-300 group-hover:text-blue-600 transition-colors">
                          <ChevronRight size={24} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
