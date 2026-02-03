'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, Loader2, MessageSquare, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Chat({ jobId, userId }: { jobId: string, userId: string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()

  // Получаем профиль текущего пользователя для Optimistic UI
  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('id, full_name').eq('id', userId).single()
      if (data) setProfile(data)
    }
    fetchProfile()
  }, [userId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    // Кэш для профилей, чтобы не делать лишние запросы
    const profileCache = new Map<string, any>()

    const fetchMessages = async () => {
      console.log("📡 Chat Component: Starting optimized fetch for jobId:", jobId)
      try {
        // Оптимизированный запрос с JOIN профилей в один заход
        const { data, error } = await supabase
          .from('messages')
          .select('*, profiles:sender_id(full_name)')
          .eq('job_id', jobId)
          .order('created_at', { ascending: false })
          .limit(100)

        console.log("📡 Chat Component: Fetch result:", { count: data?.length, error: error?.message })

        if (error) {
          console.error('❌ Chat Component: Error loading messages:', error)
          setLoading(false)
          return
        }

        if (data) {
          // Переворачиваем массив, так как загрузили в обратном порядке
          const messagesWithProfiles = data.reverse()
          setMessages(messagesWithProfiles)

          // Предварительно заполняем кэш из первых 100 сообщений
          messagesWithProfiles.forEach((msg: any) => {
            if (msg.profiles) {
              profileCache.set(msg.sender_id, msg.profiles)
            }
          })
        }
      } catch (error) {
        console.error('Error in fetchMessages:', error)
      } finally {
        setLoading(false)
        setTimeout(scrollToBottom, 100)
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
        // Проверяем, нет ли уже такого сообщения (по ID)
        // Это предотвращает дублирование при Optimistic UI
        setMessages((prev) => {
          const exists = prev.some(m => m.id === payload.new.id)
          if (exists) return prev

          // Также пробуем найти по контенту и времени, если реальный ID еще не заменен
          // Но обычно проверка по ID достаточна, так как sendMessage обновляет tempId на realId
          return [...prev, { ...payload.new, profiles: profileCache.get(payload.new.sender_id) }]
        })
        setTimeout(scrollToBottom, 50)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      profileCache.clear()
    }
  }, [jobId])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const content = newMessage.trim()
    setNewMessage('')

    // --- Optimistic UI Update ---
    const tempId = 'temp-' + Date.now()
    const optimisticMessage = {
      id: tempId,
      job_id: jobId,
      sender_id: userId,
      content: content,
      created_at: new Date().toISOString(),
      profiles: profile, // Используем загруженный профиль
      sending: true // Флаг для визуальной индикации отправки
    }

    setMessages(prev => [...prev, optimisticMessage])
    setTimeout(scrollToBottom, 50)

    const { data, error } = await supabase
      .from('messages')
      .insert({
        job_id: jobId,
        sender_id: userId,
        content: content
      })
      .select()
      .single()

    if (error) {
      console.error('Ошибка при отправке сообщения:', error)
      // Удаляем оптимистичное сообщение при ошибке
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setNewMessage(content) // Возвращаем текст в поле ввода
      alert('Не удалось отправить сообщение: ' + error.message)
    } else {
      // Заменяем временное сообщение реальным из базы (или просто убираем флаг sending)
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, ...data, sending: false } : m))
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-[400px]">
      <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
    </div>
  )

  return (
    <div className="flex flex-col h-[600px] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-blue-100/50">
      {/* Шапка чата — теперь в стиле приложения */}
      <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="font-bold text-slate-900 leading-tight">Обсуждение проекта</div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Чат активен</span>
            </div>
          </div>
        </div>
      </div>

      {/* Лента сообщений — чистый фон */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8fafc]">
        {messages.map((msg) => {
          const isMine = msg.sender_id === userId
          const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex flex-col max-w-[80%] ${isMine ? 'items-end' : 'items-start'}`}>
                {/* Имя отправителя */}
                {!isMine && (
                  <span className="text-[11px] font-bold text-slate-400 ml-2 mb-1 uppercase tracking-tighter">
                    {msg.profiles?.full_name || 'Собеседник'}
                  </span>
                )}

                <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${isMine
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  } ${msg.sending ? 'opacity-60 grayscale' : ''}`}>
                  {msg.content}
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium">
                  {time}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода — современный минимализм */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-3 items-center">
        <div className="flex-1 relative">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Напишите сообщение..."
            className="w-full bg-slate-50 border-none rounded-2xl py-6 px-5 text-sm focus-visible:ring-2 focus-visible:ring-blue-500/20 shadow-inner"
          />
        </div>
        <Button
          type="submit"
          disabled={!newMessage.trim()}
          size="icon"
          className="bg-blue-600 hover:bg-blue-700 h-12 w-12 rounded-2xl shrink-0 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
        >
          <Send className="h-5 w-5 text-white" />
        </Button>
      </form>
    </div>
  )
}