'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader2, MessageSquare, ChevronLeft } from 'lucide-react'
import { ChatSidebar } from './chat/chat-sidebar'
import { ChatMessageList } from './chat/chat-message-list'
import { ChatInput } from './chat/chat-input'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Conversation {
  id: string
  title: string
  status: string
  otherPartyName: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount?: number
}

export default function Chat({ jobId, userId }: { jobId: string, userId: string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  // Функция для пометки сообщений как прочитанных
  const markMessagesAsRead = async (id: string) => {
    if (!id || !userId) return
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('job_id', id)
      .neq('sender_id', userId)
      .eq('is_read', false)

    if (!error) {
      setConversations(prev => prev.map(conv =>
        conv.id === id ? { ...conv, unreadCount: 0 } : conv
      ))
    }
  }

  // 1. Оптимизированная инициализация (параллельные запросы)
  useEffect(() => {
    const initChat = async () => {
      setLoading(true)
      try {
        const [profileRes, jobsRes] = await Promise.all([
          supabase.from('profiles').select('id, full_name').eq('id', userId).single(),
          supabase
            .from('jobs')
            .select(`
              id, 
              title, 
              status, 
              client_id, 
              accountant_id,
              client:client_id(full_name),
              specialist:accountant_id(full_name)
            `)
            .or(`client_id.eq.${userId},accountant_id.eq.${userId}`)
            .eq('status', 'in_progress')
            .order('created_at', { ascending: false })
        ])

        if (profileRes.data) setProfile(profileRes.data)

        if (jobsRes.data) {
          // Получаем дополнительные данные для каждого чата (последнее сообщение и кол-во непрочитанных)
          const detailedConversations = await Promise.all(jobsRes.data.map(async (job: any) => {
            const [lastMsgRes, unreadRes] = await Promise.all([
              supabase
                .from('messages')
                .select('content, created_at')
                .eq('job_id', job.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single(),
              supabase
                .from('messages')
                .select('id', { count: 'exact', head: true })
                .eq('job_id', job.id)
                .neq('sender_id', userId)
                .eq('is_read', false)
            ])

            return {
              id: job.id,
              title: job.title,
              status: job.status,
              otherPartyName: job.client_id === userId
                ? (job.specialist?.full_name || 'Специалист')
                : (job.client?.full_name || 'Заказчик'),
              lastMessage: lastMsgRes.data?.content || '',
              lastMessageAt: lastMsgRes.data?.created_at || job.created_at,
              unreadCount: unreadRes.count || 0
            }
          })).then(convs => convs.sort((a, b) =>
            new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
          ))
          setConversations(detailedConversations)
        }
      } catch (err) {
        console.error('Error init chat:', err)
      } finally {
        setLoading(false)
      }
    }
    initChat()
  }, [userId])

  // 2. Оптимизированная загрузка сообщений
  useEffect(() => {
    if (!jobId) {
      setMessages([])
      return
    }

    let isMounted = true

    const fetchMessages = async () => {
      setMessagesLoading(true)
      try {
        const { data } = await supabase
          .from('messages')
          .select('*, profiles:sender_id(full_name)')
          .eq('job_id', jobId)
          .order('created_at', { ascending: true })
          .limit(100)

        if (isMounted && data) {
          setMessages(data)
          // Помечаем как прочитанные при загрузке
          markMessagesAsRead(jobId)
        }
      } catch (err) {
        console.error('Error fetching messages:', err)
      } finally {
        if (isMounted) setMessagesLoading(false)
      }
    }

    fetchMessages()

    const channel = supabase
      .channel(`chat:${jobId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `job_id=eq.${jobId}`
      }, async (payload: any) => {
        if (isMounted) {
          setMessages((prev) => {
            if (prev.some(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })

          // Обновляем последнее сообщение и счетчик непрочитанных в сайдбаре
          setConversations(prev => {
            const next = prev.map(conv => {
              if (conv.id === payload.new.job_id) {
                const isMine = payload.new.sender_id === userId
                return {
                  ...conv,
                  lastMessage: payload.new.content,
                  lastMessageAt: payload.new.created_at,
                  unreadCount: (isMine || jobId === conv.id) ? 0 : (conv.unreadCount || 0) + 1
                }
              }
              return conv
            })
            return [...next].sort((a, b) =>
              new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
            )
          })

          // Если чат открыт и сообщение не моё, помечаем как прочитанное
          if (jobId === payload.new.job_id && payload.new.sender_id !== userId) {
            markMessagesAsRead(jobId)
          }
        }
      })
      .subscribe()

    // Слушатель для обновлений в других чатах (неактивных)
    const globalChannel = supabase
      .channel('global-chat-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload: any) => {
        if (isMounted && payload.new.job_id !== jobId) {
          setConversations(prev => {
            const next = prev.map(conv => {
              if (conv.id === payload.new.job_id) {
                return {
                  ...conv,
                  lastMessage: payload.new.content,
                  lastMessageAt: payload.new.created_at,
                  unreadCount: (conv.unreadCount || 0) + 1
                }
              }
              return conv
            })
            return [...next].sort((a, b) =>
              new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
            )
          })
        }
      })
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
      supabase.removeChannel(globalChannel)
    }
  }, [jobId])

  const handleSendMessage = async (content: string) => {
    if (!jobId || !userId) return

    const tempId = 'temp-' + Date.now()
    const optimisticMessage = {
      id: tempId,
      job_id: jobId,
      sender_id: userId,
      content: content,
      created_at: new Date().toISOString(),
      profiles: profile,
      sending: true
    }

    setMessages(prev => [...prev, optimisticMessage])

    // Также обновляем превью в сайдбаре при отправке
    setConversations(prev => {
      const next = prev.map(conv =>
        conv.id === jobId ? { ...conv, lastMessage: content, lastMessageAt: optimisticMessage.created_at } : conv
      )
      return [...next].sort((a, b) =>
        new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
      )
    })

    const { data, error } = await supabase
      .from('messages')
      .insert({
        job_id: jobId,
        sender_id: userId,
        content: content,
        is_read: false
      })
      .select()
      .single()

    if (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId))
      alert('Ошибка отправки: ' + error.message)
    } else {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, ...data, sending: false } : m))
    }
  }

  const handleSelectConversation = (id: string) => {
    router.push(`/dashboard/chat?jobId=${id}`)
    markMessagesAsRead(id)
  }

  const handleBackToList = () => {
    router.push('/dashboard/chat')
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-white sm:rounded-[2rem] sm:border sm:border-slate-100 sm:shadow-xl sm:shadow-blue-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex bg-white sm:rounded-[2.5rem] sm:border sm:border-slate-100 sm:shadow-2xl sm:shadow-blue-100/50 overflow-hidden h-full max-h-screen">
      {/* Sidebar - Прячем на мобилках если выбран чат */}
      <ChatSidebar
        conversations={conversations}
        activeId={jobId}
        onSelect={handleSelectConversation}
        className={`w-full lg:w-80 shrink-0 ${jobId ? 'hidden lg:flex' : 'flex'}`}
      />

      {/* Основная область чата */}
      <div className={`flex-1 flex flex-col min-w-0 bg-[#f8fafc] ${!jobId ? 'hidden lg:flex' : 'flex'}`}>
        {jobId ? (
          <>
            <div className="bg-white p-4 sm:p-6 border-b border-slate-100 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToList}
                className="lg:hidden shrink-0 -ml-2"
              >
                <ChevronLeft className="w-6 h-6 text-slate-600" />
              </Button>
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
                  <MessageSquare size={20} />
                </div>
                <div className="truncate">
                  <h3 className="font-black text-slate-900 leading-tight truncate">
                    {conversations.find(c => c.id === jobId)?.title || 'Загрузка...'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">В сети</span>
                  </div>
                </div>
              </div>
            </div>

            {messagesLoading && messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            ) : (
              <ChatMessageList messages={messages} currentUserId={userId} />
            )}

            <ChatInput onSendMessage={handleSendMessage} disabled={messagesLoading} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
            <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Ваши сообщения</h3>
            <p className="text-slate-500 max-w-xs mx-auto">Выберите диалог из списка слева, чтобы начать обсуждение проекта</p>
          </div>
        )}
      </div>
    </div>
  )
}
