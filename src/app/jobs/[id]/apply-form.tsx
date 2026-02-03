'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Send, CheckCircle2 } from 'lucide-react'
import { submitProposal } from './actions'

export function ApplyForm({
    jobId,
    currentUserId,
    hasApplied,
    isHired
}: {
    jobId: string,
    currentUserId: string,
    hasApplied: boolean,
    isHired?: boolean
}) {
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(hasApplied)
    /* Удален локальный state formData, так как используем FormData */

    // Используем нативную форму для простоты передачи в Server Action
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        // Добавляем скрытые поля, если их нет в input
        formData.append('jobId', jobId)
        formData.append('accountantId', currentUserId) // Add currentUserId to formData

        const price = formData.get('price')
        const coverLetter = formData.get('coverLetter')

        if (!price || !coverLetter) {
            alert('Пожалуйста, заполните все поля')
            return
        }

        try {
            setIsLoading(true)
            console.log("🚀 Calling Server Action...")

            const result = await submitProposal(formData)

            if (result.error) {
                console.error("❌ Server Action Error:", result.error)
                alert(result.error)
            } else {
                console.log("🎉 Server Action Success")
                setIsSuccess(true)
                router.refresh() // Keep router.refresh() to revalidate data on the page
            }
        } catch (error: any) {
            console.error('🔥 Error calling action:', error)
            alert('Ошибка выполнения действия: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (isHired) {
        return (
            <div className="bg-slate-900 text-white rounded-3xl p-8 text-center animate-in zoom-in duration-500 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 pointer-events-none" />
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">Вы приняты! 🎉</h3>
                    <p className="text-slate-300">
                        Заказчик выбрал вас исполнителем для этого проекта. Теперь он находится в ваших текущих проектах.
                    </p>
                    <div className="grid gap-3 mt-8">
                        <Button
                            className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl h-12"
                            onClick={() => router.push('/dashboard/contracts')}
                        >
                            К проекту
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-slate-400 hover:text-white hover:bg-white/10"
                            onClick={() => router.push('/jobs')}
                        >
                            Искать дальше
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (isSuccess) {
        return (
            <div className="bg-green-50 border border-green-100 rounded-3xl p-8 text-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-2">Отклик отправлен!</h3>
                <p className="text-green-700">
                    Заказчик получил ваше предложение. <br />
                    Вы получите уведомление, если вас выберут исполнителем.
                </p>
                <Button
                    variant="outline"
                    className="mt-6 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                    onClick={() => router.push('/jobs')}
                >
                    Искать другие заказы
                </Button>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
            <div>
                <h3 className="text-2xl font-black text-slate-900">Подать отклик</h3>
                <p className="text-slate-500">Предложите свои услуги для этого заказа</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="price" className="font-bold text-slate-700">Ваша цена (₸)</Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        placeholder="Например: 50000"
                        className="h-12 text-lg font-bold"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="coverLetter" className="font-bold text-slate-700">Сопроводительное письмо</Label>
                    <Textarea
                        id="coverLetter"
                        name="coverLetter"
                        placeholder="Расскажите, почему вы подходите для этой задачи. Опишите ваш опыт..."
                        className="min-h-[150px] text-base p-4"
                        required
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-1"
                >
                    {isLoading ? (
                        'Отправка...'
                    ) : (
                        <span className="flex items-center gap-2">
                            Отправить предложение <Send className="w-5 h-5" />
                        </span>
                    )}
                </Button>
            </form>

            <p className="text-xs text-center text-slate-400">
                Нажимая кнопку, вы соглашаетесь с правилами сервиса
            </p>
        </div>
    )
}
