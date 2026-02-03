'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import {
    ArrowLeft,
    ArrowRight,
    Briefcase,
    FileText,
    Banknote,
    CheckCircle2,
    Calculator,
    Laptop
} from 'lucide-react'

// Шаги визарда
const STEPS = [
    { id: 1, name: 'Категория', icon: Briefcase },
    { id: 2, name: 'Детали', icon: FileText },
    { id: 3, name: 'Бюджет', icon: Banknote },
    { id: 4, name: 'Проверка', icon: CheckCircle2 },
]

const CATEGORIES = [
    { id: 'accounting', name: 'Бухгалтерский учет', icon: Calculator },
    { id: 'taxes', name: 'Налоги и отчетность', icon: FileText },
    { id: 'audit', name: 'Аудит', icon: CheckCircle2 },
    { id: 'consulting', name: 'Консультации', icon: Laptop },
    { id: 'other', name: 'Другое', icon: Briefcase },
]

export default function CreateJobWizard() {
    const router = useRouter()
    const supabase = createClient()

    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        category: '',
        title: '',
        description: '',
        budget: '',
        deadline: ''
    })

    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            console.log("🔄 Mount: Fetching user...")
            try {
                // Используем getUser для надежности при инициализации
                const { data: { user }, error } = await supabase.auth.getUser()
                if (error) {
                    console.error("❌ Mount: Auth error:", error)
                } else if (user) {
                    console.log("✅ Mount: User found:", user.id)
                    setUserId(user.id)
                } else {
                    console.log("⚠️ Mount: No user found")
                }
            } catch (e) {
                console.error("🔥 Mount: Exception:", e)
            }
        }
        fetchUser()
    }, [])

    const updateData = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        if (!userId) {
            alert("Пожалуйста, подождите загрузки данных или обновите страницу.")
            return
        }

        try {
            setIsLoading(true)

            const jobData = {
                client_id: userId,
                title: formData.title,
                description: formData.description,
                category: formData.category,
                budget: formData.budget ? parseInt(formData.budget) : null,
                status: 'open',
            }

            const { error } = await supabase
                .from('jobs')
                .insert(jobData)

            if (error) throw error

            // Успех: перенаправляем. Не сбрасываем isLoading, чтобы кнопка оставалась заблокированной.
            router.push('/dashboard')
            router.refresh()

        } catch (error: any) {
            console.error("Error creating job:", error)
            alert('Ошибка при создании заказа: ' + error.message)
            setIsLoading(false) // Сбрасываем только при ошибке
        }
    }

    // Рендер контента для каждого шага
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        {CATEGORIES.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => updateData('category', cat.name)}
                                className={`cursor-pointer p-6 rounded-2xl border-2 transition-all hover:scale-[1.02] ${formData.category === cat.name
                                    ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-100'
                                    : 'border-slate-100 hover:border-blue-200 hover:bg-white bg-white'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${formData.category === cat.name ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    <cat.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-900">{cat.name}</h3>
                            </div>
                        ))}
                    </div>
                )
            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-base font-bold text-slate-700">Что нужно сделать?</Label>
                            <Input
                                id="title"
                                placeholder="Например: Сдать отчет 910.00 за второе полугодие"
                                value={formData.title}
                                onChange={(e) => updateData('title', e.target.value)}
                                className="h-12 text-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc" className="text-base font-bold text-slate-700">Подробности задачи</Label>
                            <Textarea
                                id="desc"
                                placeholder="Опишите детали, объемы, специфику вашего бизнеса..."
                                value={formData.description}
                                onChange={(e) => updateData('description', e.target.value)}
                                className="min-h-[200px] text-base leading-relaxed p-4"
                            />
                        </div>
                    </div>
                )
            case 3:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                            <Label htmlFor="budget" className="text-lg font-bold text-slate-700 block mb-4">Какой у вас бюджет?</Label>
                            <div className="relative max-w-xs mx-auto">
                                <Input
                                    id="budget"
                                    type="number"
                                    placeholder="0"
                                    value={formData.budget}
                                    onChange={(e) => updateData('budget', e.target.value)}
                                    className="h-16 text-3xl font-black text-center pr-12 focus-visible:ring-blue-600"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">₸</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-4">
                                Вы можете оставить поле пустым, если хотите обсудить цену с исполнителем.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-100">
                            <div className="shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Banknote className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium">Деньги резервируются на счете только после того, как вы выберете исполнителя.</p>
                        </div>
                    </div>
                )
            case 4:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Категория</span>
                                <p className="text-lg font-bold text-slate-900">{formData.category}</p>
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Задача</span>
                                <p className="text-xl font-bold text-slate-900">{formData.title}</p>
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Описание</span>
                                <p className="text-slate-600 whitespace-pre-wrap">{formData.description}</p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                <span className="font-bold text-slate-500">Бюджет</span>
                                <span className="text-2xl font-black text-blue-600">
                                    {formData.budget ? `${parseInt(formData.budget).toLocaleString()} ₸` : 'Договорная'}
                                </span>
                            </div>
                        </div>

                        <div className="text-center text-sm text-slate-400">
                            Нажимая "Опубликовать", вы соглашаетесь с правилами сервиса.
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    const isStepValid = () => {
        switch (currentStep) {
            case 1: return !!formData.category
            case 2: return !!formData.title && !!formData.description
            case 3: return true // Бюджет может быть пустым
            default: return true
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-8 sm:py-12">
            {/* Степер */}
            <div className="mb-8 sm:mb-12">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 text-center">Создание заказа</h1>
                <div className="flex items-center justify-between relative px-4 sm:px-12">
                    <div className="absolute left-6 right-6 top-1/2 h-1 bg-slate-100 -z-10 rounded-full" />
                    <div
                        className="absolute left-6 top-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    />

                    {STEPS.map((step) => {
                        const isActive = step.id <= currentStep;
                        const isCurrent = step.id === currentStep;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4 z-10 ${isActive
                                    ? 'bg-blue-600 border-blue-100 text-white shadow-lg shadow-blue-200'
                                    : 'bg-white border-slate-100 text-slate-300'
                                    } ${isCurrent ? 'scale-110 ring-4 ring-blue-50' : ''}`}>
                                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-blue-600' : 'text-slate-400 hidden sm:block'
                                    }`}>
                                    {step.name}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Основной контент */}
            <div className="min-h-[400px]">
                {renderStepContent()}
            </div>

            {/* Кнопки навигации */}
            <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-100">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentStep === 1 || isLoading}
                    className="text-slate-400 hover:text-slate-600"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад
                </Button>

                {currentStep === STEPS.length ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-6 text-lg shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 transition-all hover:-translate-y-1"
                    >
                        {isLoading ? 'Публикация...' : 'Опубликовать заказ'}
                    </Button>
                ) : (
                    <Button
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        className="bg-slate-900 hover:bg-black text-white rounded-xl px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                        Далее
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                )}
            </div>
        </div>
    )
}
