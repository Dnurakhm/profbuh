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
  const [filter, setFilter] = useState<'all' | 'jobs' | 'system'>('all')
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const { markAllAsRead: globalMarkAll, fetchCount, userId: currentUserId } = useNotifications()
  const initialized = useRef(false)

  // Группировка уведомлений по дате
  const groupedNotifications = useMemo(() => {
    // Сначала фильтруем по типу
    let filtered = notifications.filter(n => n.type !== 'chat_message')

    if (filter === 'jobs') {
      filtered = filtered.filter(n => ['new_bid', 'job_assigned', 'proposal_accepted'].includes(n.type))
    } else if (filter === 'system') {
      filtered = filtered.filter(n => ['system', 'billing'].includes(n.type) || !n.type)
    }

    const groups: { [key: string]: any[] } = {
      'Сегодня': [],
      'Вчера': [],
      'Ранее': []
    }

    filtered.forEach(n => {
      const date = new Date(n.created_at)
      if (isToday(date)) groups['Сегодня'].push(n)
      else if (isYesterday(date)) groups['Вчера'].push(n)
      else groups['Ранее'].push(n)
    })

    return groups
  }, [notifications, filter])

  const handleMarkAllAsRead = async () => {
    let types: string[] | undefined = undefined
    if (filter === 'jobs') {
      types = ['new_bid', 'job_assigned', 'proposal_accepted']
    } else if (filter === 'system') {
      types = ['system', 'billing']
    }

    await globalMarkAll(types)
    setNotifications(prev => prev.map(n => {
      if (!types || types.includes(n.type)) {
        return { ...n, is_read: true }
      }
      return n
    }))
  }

  // Функция для получения иконок в зависимости от типа
  const getIcon = (type: string, isRead: boolean) => {
    const className = isRead ? "text-slate-400" : "text-white"
    switch (type) {
      case 'chat_message': return <MessageSquare size={18} className={className} />
      case 'new_bid': return <UserPlus size={18} className={className} />
      case 'job_assigned': return <CheckCircle size={18} className={className} />
      case 'billing': return <Clock size={18} className={className} />
      default: return <Bell size={18} className={className} />
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
          .neq('type', 'chat_message') // Исключаем чаты
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
            if (payload.new.type === 'chat_message') return // Игнорируем чаты

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
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-10 pb-20 overflow-x-hidden">
      {/* Заголовок */}
      <div className="flex flex-col gap-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-blue-200 text-white shrink-0">
              <Bell size={20} className="sm:w-[24px] sm:h-[24px]" fill="currentColor" />
            </div>
            <span className="truncate">Уведомления</span>
          </h1>

          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold gap-1.5 rounded-xl text-xs w-full sm:w-auto justify-center shrink-0"
            >
              <CheckCheck size={16} />
              Прочитать всё
            </Button>
          )}
        </div>

        {/* Фильтры */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth w-full sm:w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex-1 sm:flex-none ${filter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('jobs')}
            className={`px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex-1 sm:flex-none ${filter === 'jobs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            Заказы
          </button>
          <button
            onClick={() => setFilter('system')}
            className={`px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex-1 sm:flex-none ${filter === 'system' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            Система
          </button>
        </div>
      </div>

      {/* Список */}
      <div className="space-y-6 w-full overflow-hidden">
        {Object.keys(groupedNotifications).every(k => groupedNotifications[k].length === 0) ? (
          <div className="bg-white rounded-[2rem] p-12 sm:p-20 text-center border border-slate-100 shadow-sm transition-all w-full">
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
              <div key={group} className="space-y-3 w-full">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 sm:px-4">{group}</h2>
                <div className="grid gap-2 w-full">
                  {items.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id, n.link || '#', n.is_read)}
                      className={`group block relative p-3 sm:p-4 rounded-[1.5rem] sm:rounded-3xl border transition-all duration-200 cursor-pointer w-full overflow-hidden ${n.is_read
                          ? 'bg-transparent border-transparent opacity-60 grayscale-[0.8] hover:opacity-100 hover:grayscale-0 hover:bg-white/50'
                          : 'bg-white border-blue-50 shadow-lg shadow-blue-100/20 ring-1 ring-blue-50'
                        } active:scale-[0.98]`}
                    >
                      <div className="flex gap-3 sm:gap-4 items-center w-full min-w-0">
                        {/* Иконка */}
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${n.is_read ? 'bg-slate-100' : 'bg-blue-600 shadow-lg shadow-blue-200'
                          }`}>
                          {getIcon(n.type, n.is_read)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5 w-full">
                            <h3 className={`truncate leading-tight flex-1 pr-2 ${n.is_read ? 'text-slate-700 font-bold text-sm' : 'text-slate-900 font-black text-sm sm:text-base tracking-tight'
                              }`}>
                              {n.title}
                            </h3>
                            {!n.is_read && (
                              <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 shadow-sm mt-1 sm:mt-1.5" />
                            )}
                          </div>

                          <div className="flex justify-between items-end w-full">
                            <p className={`text-[11px] sm:text-xs leading-relaxed truncate flex-1 pr-2 ${n.is_read ? 'text-slate-500 font-medium' : 'text-slate-600 font-bold'
                              }`}>
                              {n.content}
                            </p>
                            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 shrink-0 uppercase tracking-tighter sm:tracking-normal">
                              {format(new Date(n.created_at), 'HH:mm')}
                            </span>
                          </div>
                        </div>

                        <div className="hidden sm:block ml-1 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  )
}
