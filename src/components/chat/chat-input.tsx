'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
    onSendMessage: (message: string) => void
    disabled?: boolean
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
    const [message, setMessage] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSend = () => {
        if (!message.trim() || disabled) return
        onSendMessage(message.trim())
        setMessage('')
        // Сброс высоты
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // Автоматическое изменение высоты textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
        }
    }, [message])

    return (
        <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-end gap-3 max-w-5xl mx-auto">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Напишите сообщение... (Shift+Enter для новой строки)"
                        disabled={disabled}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 text-sm focus:ring-2 focus:ring-blue-500/20 shadow-inner resize-none transition-all placeholder:text-slate-400"
                    />
                </div>
                <Button
                    type="button"
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700 h-11 w-11 rounded-2xl shrink-0 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                >
                    <Send className="h-5 w-5 text-white" />
                </Button>
            </div>
        </div>
    )
}
