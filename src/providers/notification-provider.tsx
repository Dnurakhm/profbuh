'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface NotificationContextType {
    unreadCount: number
    markAllAsRead: (types?: string[]) => Promise<void>
    fetchCount: () => Promise<void>
    userId?: string
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children, userId }: { children: ReactNode, userId?: string }) {
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()

    const fetchCount = useCallback(async () => {
        if (!userId) return
        try {
            const { count, error } = await supabase
                .from('notifications')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false)
                .neq('type', 'chat_message')

            if (!error) {
                setUnreadCount(count || 0)
            }
        } catch (err) {
            console.error('Error fetching notification count:', err)
        }
    }, [userId, supabase])

    const markAllAsRead = useCallback(async (types?: string[]) => {
        if (!userId) return
        try {
            let query = supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false)

            if (types && types.length > 0) {
                query = query.in('type', types)
            } else {
                // Если типы не указаны, помечаем всё кроме чатов (так как они в другой системе)
                query = query.neq('type', 'chat_message')
            }

            const { error } = await query

            if (!error) {
                fetchCount() // Пересчитываем счетчик
                if (!types) toast.success('Все уведомления прочитаны')
            }
        } catch (err) {
            console.error('Error marking as read:', err)
        }
    }, [userId, supabase, fetchCount])

    useEffect(() => {
        if (!userId) return

        fetchCount()

        // Слушаем вставку новых уведомлений
        const channelName = `global-notifications-${userId}`

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
                (payload: any) => {
                    // Игнорируем уведомления о чате, так как для них есть своя система в Navbar
                    if (payload.new.type === 'chat_message') return

                    setUnreadCount((prev) => prev + 1)

                    toast(payload.new.title, {
                        description: payload.new.content,
                        action: {
                            label: 'Открыть',
                            onClick: () => {
                                if (payload.new.link) router.push(payload.new.link)
                            },
                        },
                    })
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
                    fetchCount()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, supabase, router, fetchCount])

    const value = useMemo(() => ({
        unreadCount,
        markAllAsRead,
        fetchCount,
        userId
    }), [unreadCount, markAllAsRead, fetchCount, userId])

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotifications = () => {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}
