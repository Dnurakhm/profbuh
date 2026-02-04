'use client'

import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface ChatMessageBubbleProps {
    content: string
    createdAt: string
    isMine: boolean
    senderName?: string
    sending?: boolean
}

export function ChatMessageBubble({
    content,
    createdAt,
    isMine,
    senderName,
    sending
}: ChatMessageBubbleProps) {
    const time = format(new Date(createdAt), 'HH:mm', { locale: ru })

    return (
        <div className={cn(
            "flex flex-col mb-4",
            isMine ? "items-end" : "items-start"
        )}>
            {!isMine && senderName && (
                <span className="text-[11px] font-bold text-slate-400 ml-2 mb-1 uppercase tracking-wider">
                    {senderName}
                </span>
            )}

            <div className={cn(
                "max-w-[85%] sm:max-w-md px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed transition-all",
                isMine
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-none",
                sending && "opacity-60 grayscale-[50%]"
            )}>
                {content}
            </div>

            <div className={cn(
                "flex items-center gap-1.5 mt-1 px-1 text-[10px] font-medium text-slate-400",
                isMine ? "flex-row-reverse" : "flex-row"
            )}>
                <span>{time}</span>
                {sending && (
                    <span className="flex h-1 w-1 rounded-full bg-blue-400 animate-pulse" />
                )}
            </div>
        </div>
    )
}
