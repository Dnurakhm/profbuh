'use client'

import { useEffect, useRef } from 'react'
import { ChatMessageBubble } from './chat-message-bubble'
import { format, isToday, isYesterday } from 'date-fns'
import { ru } from 'date-fns/locale'

interface Message {
    id: string
    content: string
    created_at: string
    sender_id: string
    profiles?: {
        full_name: string
    }
    sending?: boolean
}

interface ChatMessageListProps {
    messages: Message[]
    currentUserId: string
}

export function ChatMessageList({ messages, currentUserId }: ChatMessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Группировка сообщений по датам
    const groupedMessages: { [key: string]: Message[] } = {}

    messages.forEach(msg => {
        const date = format(new Date(msg.created_at), 'yyyy-MM-dd')
        if (!groupedMessages[date]) {
            groupedMessages[date] = []
        }
        groupedMessages[date].push(msg)
    })

    const formatDateLabel = (dateStr: string) => {
        const date = new Date(dateStr)
        if (isToday(date)) return 'Сегодня'
        if (isYesterday(date)) return 'Вчера'
        return format(date, 'd MMMM yyyy', { locale: ru })
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 scrollbar-hide bg-[#f8fafc]">
            {Object.keys(groupedMessages).sort().map(date => (
                <div key={date} className="space-y-4">
                    <div className="flex justify-center">
                        <span className="bg-slate-200/50 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                            {formatDateLabel(date)}
                        </span>
                    </div>

                    {groupedMessages[date].map((msg) => (
                        <ChatMessageBubble
                            key={msg.id}
                            content={msg.content}
                            createdAt={msg.created_at}
                            isMine={msg.sender_id === currentUserId}
                            senderName={msg.profiles?.full_name}
                            sending={msg.sending}
                        />
                    ))}
                </div>
            ))}
            <div ref={bottomRef} className="h-2" />
        </div>
    )
}
