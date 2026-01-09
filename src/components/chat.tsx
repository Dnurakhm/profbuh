'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, Loader2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Chat({ jobId, userId }: { jobId: string, userId: string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select(`*, profiles:sender_id (full_name)`)
        .eq('job_id', jobId)
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data)
      setLoading(false)
      setTimeout(scrollToBottom, 100)
    }

    fetchMessages()

    const channel = supabase
      .channel(`chat:${jobId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `job_id=eq.${jobId}` 
      }, async (payload) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', payload.new.sender_id)
          .single()
        
        setMessages((prev) => [...prev, { ...payload.new, profiles: profile }])
        setTimeout(scrollToBottom, 50)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [jobId])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const { error } = await supabase
      .from('messages')
      .insert({
        job_id: jobId,
        sender_id: userId,
        content: newMessage.trim()
      })

    if (!error) setNewMessage('')
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>

  return (
    <div className="flex flex-col h-[600px] bg-[#e5ddd5] dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-xl border-slate-300">
      {/* Шапка чата */}
      <div className="bg-[#075e54] p-3 flex items-center gap-3 text-white">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <MessageSquare size={20} />
        </div>
        <div>
          <div className="font-bold text-sm">Рабочий чат</div>
          <div className="text-[11px] opacity-80">в сети</div>
        </div>
      </div>
      
      {/* Лента сообщений */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#e5ddd5]">
        {messages.map((msg) => {
          const isMine = msg.sender_id === userId
          const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} w-full`}>
              <div className={`relative max-w-[85%] px-2 py-1 rounded-lg shadow-sm ${
                isMine ? 'bg-[#dcf8c6]' : 'bg-white'
              }`}>
                {/* Имя отправителя */}
                {!isMine && (
                  <div className="text-[12px] font-bold text-blue-600 px-0.5 leading-tight mb-0.5 truncate">
                    {msg.profiles?.full_name || 'Собеседник'}
                  </div>
                )}
                
                {/* Контент с плавающим временем */}
                <div className="text-[15px] leading-[1.4] text-slate-900 px-0.5 overflow-hidden">
                  {msg.content}
                  
                  {/* Блок времени, прижатый вправо */}
                  <span className="float-right mt-2 ml-2 flex items-center gap-0.5 h-4 pointer-events-none">
                    <span className={`text-[10px] ${isMine ? 'text-slate-500' : 'text-slate-400'}`}>
                      {time}
                    </span>
                  </span>
                  <div className="clear-both"></div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <form onSubmit={sendMessage} className="p-2 bg-[#f0f0f0] flex gap-2 items-center">
        <Input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение"
          className="flex-1 bg-white border-none rounded-full py-5 px-4 text-sm focus-visible:ring-0 shadow-sm"
        />
        <Button 
          type="submit" 
          disabled={!newMessage.trim()}
          size="icon" 
          className="bg-[#075e54] hover:bg-[#054c44] h-11 w-11 rounded-full shrink-0 shadow-md transition-all active:scale-90"
        >
          <Send className="h-5 w-5 text-white" />
        </Button>
      </form>
    </div>
  )
}