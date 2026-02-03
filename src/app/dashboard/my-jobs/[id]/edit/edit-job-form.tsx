'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    ArrowLeft,
    Briefcase,
    FileText,
    Banknote,
    CheckCircle2,
    Calculator,
    Laptop,
    Save
} from 'lucide-react'

// Категории для выбора
const CATEGORIES = [
    { id: 'accounting', name: 'Бухгалтерский учет', icon: Calculator },
    { id: 'taxes', name: 'Налоги и отчетность', icon: FileText },
    { id: 'audit', name: 'Аудит', icon: CheckCircle2 },
    { id: 'consulting', name: 'Консультации', icon: Laptop },
    { id: 'other', name: 'Другое', icon: Briefcase },
]

export default function EditJobForm({ job }: { job: any }) {
    const router = useRouter()
    const supabase = createClient()

    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        category: job.category || '',
        title: job.title || '',
        description: job.description || '',
        budget: job.budget ? String(job.budget) : '',
    })

    const updateData = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const handleSubmit = async () => {
        try {
            setIsLoading(true)
            const { error } = await supabase
                .from('jobs')
                .update({
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    budget: formData.budget ? parseInt(formData.budget) : null,
                })
                .eq('id', job.id)

            if (error) throw error

            router.push('/dashboard/my-jobs')
            router.refresh()
        } catch (error: any) {
            alert('Ошибка при обновлении заказа: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <h1 className="text-3xl font-black text-slate-900 mb-8">Редактирование заказа</h1>

            <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">

                {/* Категория */}
                <div>
                    <Label className="text-base font-bold text-slate-700 mb-4 block">Категория</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {CATEGORIES.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => updateData('category', cat.name)}
                                className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center gap-3 ${formData.category === cat.name
                                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100'
                                        : 'border-slate-100 hover:border-blue-200 bg-slate-50'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.category === cat.name ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'
                                    }`}>
                                    <cat.icon className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Основные поля */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-base font-bold text-slate-700">Что нужно сделать?</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => updateData('title', e.target.value)}
                            className="h-12 text-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="desc" className="text-base font-bold text-slate-700">Подробности задачи</Label>
                        <Textarea
                            id="desc"
                            value={formData.description}
                            onChange={(e) => updateData('description', e.target.value)}
                            className="min-h-[150px] text-base leading-relaxed p-4"
                        />
                    </div>
                </div>

                {/* Бюджет */}
                <div className="space-y-2">
                    <Label htmlFor="budget" className="text-base font-bold text-slate-700">Бюджет (₸)</Label>
                    <Input
                        id="budget"
                        type="number"
                        value={formData.budget}
                        onChange={(e) => updateData('budget', e.target.value)}
                        className="h-12 text-lg font-bold"
                        placeholder="Договорная"
                    />
                </div>

                {/* Кнопки */}
                <div className="flex items-center gap-4 pt-6 mt-6 border-t border-slate-100">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="text-slate-500"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Отмена
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 ml-auto"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                </div>

            </div>
        </div>
    )
}
