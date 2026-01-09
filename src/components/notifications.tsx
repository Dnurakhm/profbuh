'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Notifications({ userId }: { userId: string }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()
  const router = useRouter()

  const fetchCount = useCallback(async () => {
    if (!userId) return
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
      
      if (error) {
        console.error('Error fetching notification count:', error)
        return
      }
      
      setUnreadCount(count || 0)
    } catch (error) {
      console.error('Error in fetchCount:', error)
    }
  }, [userId])

 useEffect(() => {
  if (!userId) return;

  // Загружаем счетчик сразу
  fetchCount();

  // Создаем канал с фиксированным именем для переиспользования
  const channelName = `notifications-live-${userId}`
  const channel = supabase
    .channel(channelName) 
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        // Используем debounce для избежания лишних запросов
        setTimeout(() => fetchCount(), 100)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        setTimeout(() => fetchCount(), 100)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [userId, fetchCount])

  return (
    <div 
      className="relative cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-all active:scale-90 group"
      onClick={() => {
        setUnreadCount(0) // Оптимистичный сброс
        router.push('/notifications')
      }}
    >
      <Bell size={24} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
      
      {unreadCount > 0 && (
        <span 
          className="absolute top-0 right-0 h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-[100]"
          style={{ backgroundColor: '#ef4444' }}
        >
          <span 
            className="text-[10px] font-black" 
            style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
          >
            {unreadCount}
          </span>
        </span>
      )}
    </div>
  )
}