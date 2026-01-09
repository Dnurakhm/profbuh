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
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    setUnreadCount(count || 0)
  }, [userId, supabase])

 useEffect(() => {
  if (!userId) return;

  fetchCount();

  // Создаем канал с уникальным ID сессии, чтобы избежать кэширования
  const channel = supabase
    .channel(`notifications-live-${userId}-${Math.random()}`) 
    .on(
      'postgres_changes',
      {
        event: 'INSERT', // Слушаем новые уведомления
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('REALTIME: Новое уведомление!', payload);
        // Не инкрементируем вручную, а переспрашиваем базу для точности
        fetchCount();
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE', // Слушаем обновления уведомлений (для группировки сообщений)
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('REALTIME: Уведомление обновлено!', payload);
        // Переспрашиваем базу для точности
        fetchCount();
      }
    )
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log('REALTIME: Подписка активна');
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, [userId, fetchCount]);

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