'use client'

import { cn } from "@/lib/utils"
import { MessageSquare, User, CheckCircle2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Conversation {
    id: string
    title: string
    status: string
    otherPartyName: string
    lastMessage?: string
    unreadCount?: number
}

interface ChatSidebarProps {
    conversations: Conversation[]
    activeId?: string
    onSelect: (id: string) => void
    className?: string
}

export function ChatSidebar({ conversations, activeId, onSelect, className }: ChatSidebarProps) {
    return (
        <div className={cn("flex flex-col h-full bg-white border-r border-slate-100", className)}>
            <div className="p-6 border-b border-slate-100 uppercase tracking-widest">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        Чаты
                    </h2>
                    {conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0) > 0 && (
                        <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-blue-200">
                            {conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0)}
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-slate-400 font-bold">
                    {conversations.length} активных обсуждений
                </p>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-sm text-slate-400">Нет активных чатов</p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => onSelect(conv.id)}
                            className={cn(
                                "w-full text-left p-4 transition-all hover:bg-slate-50 relative group border-b border-slate-50 last:border-0",
                                activeId === conv.id ? "bg-blue-50/30" : (conv.unreadCount ?? 0 > 0 ? "bg-white" : "bg-white")
                            )}
                        >
                            {activeId === conv.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                            )}

                            <div className="flex gap-3">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all relative",
                                    activeId === conv.id ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-100 text-slate-400"
                                )}>
                                    <User size={20} />
                                    {(conv.unreadCount ?? 0) > 0 && activeId !== conv.id && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 border-2 border-white rounded-full animate-bounce" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <span className={cn(
                                            "text-sm truncate pr-2",
                                            (conv.unreadCount ?? 0) > 0 ? "font-black text-slate-900" : "font-bold text-slate-700"
                                        )}>
                                            {conv.title}
                                        </span>
                                        <span className="text-[10px] text-slate-400 shrink-0 font-medium mt-0.5">
                                            {conv.status === 'in_progress' ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                            ) : (
                                                <Clock className="w-3.5 h-3.5" />
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center gap-2">
                                        <p className={cn(
                                            "text-xs truncate max-w-[140px]",
                                            (conv.unreadCount ?? 0) > 0 ? "text-blue-600 font-bold" : "text-slate-400"
                                        )}>
                                            {conv.lastMessage || conv.otherPartyName}
                                        </p>
                                        {(conv.unreadCount ?? 0) > 0 && (
                                            <span className="bg-blue-100 text-blue-600 text-[9px] font-black px-1.5 py-0.5 rounded-lg shrink-0">
                                                +{conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}
