'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    User,
    Briefcase,
    MapPin,
    Clock,
    Users,
    FileText,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    DollarSign,
    Globe,
    Settings,
    ShieldCheck,
    Plus,
    Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import {
    TARGET_CLIENT_TYPES,
    TAX_REGIMES,
    SPECIALIST_SERVICES,
    LANGUAGES,
    WORK_FORMATS
} from '@/constants/specialist'

interface ServicePrice {
    name: string
    price_from: number
}

export function ProfileSetupForm() {
    const router = useRouter()
    const supabase = createClient()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    // Form State
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        city: '',
        experience_years: '',
        target_clients: [] as string[],
        tax_regimes: [] as string[],
        tax_regimes_other: '',
        selected_services: [] as string[],
        service_prices: [] as ServicePrice[],
        bio: '',
        languages: ['Русский'] as string[],
        work_format: 'individual',
        rules_accepted: false
    })

    useEffect(() => {
        async function loadProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (error) throw error

                if (profile) {
                    setFormData({
                        first_name: profile.first_name || '',
                        last_name: profile.last_name || '',
                        city: profile.city || '',
                        experience_years: profile.experience_years?.toString() || '',
                        target_clients: profile.target_clients || [],
                        tax_regimes: profile.tax_regimes || [],
                        tax_regimes_other: profile.tax_regimes_other || '',
                        selected_services: (profile.services || []).map((s: any) => s.name),
                        service_prices: profile.services || [],
                        bio: profile.bio || '',
                        languages: profile.languages || ['Русский'],
                        work_format: profile.work_format || 'individual',
                        rules_accepted: profile.rules_accepted || false
                    })
                }
            } catch (err) {
                console.error('Error loading profile:', err)
            } finally {
                setInitialLoading(false)
            }
        }

        loadProfile()
    }, [supabase])

    const nextStep = () => {
        // Basic validation for step 1
        if (step === 1) {
            if (!formData.first_name || !formData.last_name || !formData.experience_years) {
                toast.error('Пожалуйста, заполните обязательные поля')
                return
            }
        }
        setStep(step + 1)
        window.scrollTo(0, 0)
    }

    const prevStep = () => {
        setStep(step - 1)
        window.scrollTo(0, 0)
    }

    const toggleItem = (list: string[], item: string, key: string) => {
        const newList = list.includes(item)
            ? list.filter(i => i !== item)
            : [...list, item]
        setFormData({ ...formData, [key]: newList })
    }

    const handleServiceToggle = (service: string) => {
        const isSelected = formData.selected_services.includes(service)
        let newServices = []
        let newPrices = [...formData.service_prices]

        if (isSelected) {
            newServices = formData.selected_services.filter(s => s !== service)
            newPrices = newPrices.filter(p => p.name !== service)
        } else {
            newServices = [...formData.selected_services, service]
            newPrices.push({ name: service, price_from: 0 })
        }

        setFormData({ ...formData, selected_services: newServices, service_prices: newPrices })
    }

    const updatePrice = (serviceName: string, price: number) => {
        const newPrices = formData.service_prices.map(p =>
            p.name === serviceName ? { ...p, price_from: price } : p
        )
        setFormData({ ...formData, service_prices: newPrices })
    }

    const handleSubmit = async () => {
        if (!formData.rules_accepted) {
            toast.error('Необходимо согласиться с правилами платформы')
            return
        }

        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not found')

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: `${formData.first_name} ${formData.last_name}`.trim(),
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    city: formData.city,
                    experience_years: parseInt(formData.experience_years),
                    target_clients: formData.target_clients,
                    tax_regimes: formData.tax_regimes,
                    tax_regimes_other: formData.tax_regimes_other,
                    services: formData.service_prices,
                    bio: formData.bio,
                    languages: formData.languages,
                    work_format: formData.work_format,
                    rules_accepted: formData.rules_accepted,
                    specialization: formData.tax_regimes.join(', ') || 'Бухгалтер'
                })
                .eq('id', user.id)

            if (error) throw error

            toast.success('Профиль успешно обновлен!')
            router.push('/dashboard')
            router.refresh()
        } catch (error: any) {
            toast.error('Ошибка: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-slate-400 font-bold animate-pulse">Загружаем данные профиля...</p>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Header */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className="flex flex-col items-center gap-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${step >= s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'
                                    }`}
                            >
                                {step > s ? <CheckCircle2 size={18} /> : s}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${(step / 5) * 100}%` }}
                    />
                </div>
            </div>

            <Card className="border-none shadow-2xl shadow-blue-500/5 bg-white rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-8 sm:p-12">

                    {/* STEP 1: BASIC INFO */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2 text-center pb-4">
                                <h2 className="text-3xl font-black text-slate-900">Основная информация</h2>
                                <p className="text-slate-500 font-medium">Давайте начнем с базовых данных о вас</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider px-1">Имя *</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <Input
                                            placeholder="Имя"
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            className="pl-12 h-14 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider px-1">Фамилия *</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <Input
                                            placeholder="Фамилия"
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            className="pl-12 h-14 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider px-1">Опыт (лет) *</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <Input
                                            type="number"
                                            placeholder="Например: 5"
                                            value={formData.experience_years}
                                            onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                                            className="pl-12 h-14 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider px-1">Город</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <Input
                                            placeholder="Алматы"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="pl-12 h-14 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8">
                                <Button
                                    onClick={nextStep}
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-lg shadow-xl shadow-blue-200 gap-2"
                                >
                                    Продолжить
                                    <ChevronRight size={20} />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: CLIENTS & REGIMES */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2 text-center pb-4">
                                <h2 className="text-3xl font-black text-slate-900">С кем работаете?</h2>
                                <p className="text-slate-500 font-medium">Выберите ваших целевых клиентов и режимы налогообложения</p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-black text-slate-700 uppercase tracking-wider px-1 block mb-4">Типы клиентов</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {TARGET_CLIENT_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => toggleItem(formData.target_clients, type, 'target_clients')}
                                            className={`h-16 rounded-2xl border-2 flex items-center justify-center font-bold transition-all ${formData.target_clients.includes(type)
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-black text-slate-700 uppercase tracking-wider px-1 block mb-4">Налоговые режимы</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {TAX_REGIMES.map((regime) => (
                                        <button
                                            key={regime}
                                            onClick={() => toggleItem(formData.tax_regimes, regime, 'tax_regimes')}
                                            className={`h-16 px-4 rounded-2xl border-2 flex items-center justify-center font-bold text-center text-sm transition-all ${formData.tax_regimes.includes(regime)
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                                                }`}
                                        >
                                            {regime}
                                        </button>
                                    ))}
                                </div>
                                {formData.tax_regimes.includes('Другое') && (
                                    <div className="pt-2 animate-in slide-in-from-top-2 duration-300">
                                        <Input
                                            placeholder="Укажите другой режим..."
                                            value={formData.tax_regimes_other}
                                            onChange={(e) => setFormData({ ...formData, tax_regimes_other: e.target.value })}
                                            className="h-14 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-8">
                                <Button
                                    variant="outline"
                                    onClick={prevStep}
                                    className="w-full sm:flex-1 h-12 border-slate-100 hover:bg-slate-50 text-slate-400 font-bold rounded-2xl gap-2"
                                >
                                    <ChevronLeft size={20} />
                                    Назад
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    className="w-full sm:flex-[2] h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-lg shadow-xl shadow-blue-200 gap-2"
                                >
                                    Далее
                                    <ChevronRight size={20} />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: SERVICES & PRICES */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2 text-center pb-4">
                                <h2 className="text-3xl font-black text-slate-900">Услуги и цены</h2>
                                <p className="text-slate-500 font-medium">Выберите услуги и укажите ориентировочную цену "от"</p>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-3">
                                    {SPECIALIST_SERVICES.map((service) => {
                                        const isSelected = formData.selected_services.includes(service)
                                        const priceData = formData.service_prices.find(p => p.name === service)

                                        return (
                                            <div key={service} className="space-y-3">
                                                <button
                                                    onClick={() => handleServiceToggle(service)}
                                                    className={`w-full h-16 px-6 rounded-2xl border-2 flex items-center justify-between font-bold transition-all ${isSelected
                                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                        : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                                                        }`}
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <Settings size={18} className={isSelected ? 'text-blue-600' : 'text-slate-300'} />
                                                        {service}
                                                    </span>
                                                    {isSelected && <CheckCircle2 size={20} />}
                                                </button>

                                                {isSelected && (
                                                    <div className="pl-6 pr-2 py-2 flex items-center gap-4 animate-in slide-in-from-top-2 duration-300">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ориентировочная цена "от"</label>
                                                            <div className="relative">
                                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                                <Input
                                                                    type="number"
                                                                    placeholder="50 000"
                                                                    value={priceData?.price_from || ''}
                                                                    onChange={(e) => updatePrice(service, parseInt(e.target.value) || 0)}
                                                                    className="pl-10 h-11 bg-white border-slate-100 rounded-xl font-bold focus:ring-2 focus:ring-blue-500/20"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="pt-5 text-sm font-bold text-slate-400">₸ / мес</div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-8">
                                <Button
                                    variant="outline"
                                    onClick={prevStep}
                                    className="w-full sm:flex-1 h-12 border-slate-100 hover:bg-slate-50 text-slate-400 font-bold rounded-2xl gap-2"
                                >
                                    <ChevronLeft size={20} />
                                    Назад
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    disabled={formData.selected_services.length === 0}
                                    className="w-full sm:flex-[2] h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-lg shadow-xl shadow-blue-200 gap-2"
                                >
                                    Далее
                                    <ChevronRight size={20} />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: ABOUT & DETAILS */}
                    {step === 4 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2 text-center pb-4">
                                <h2 className="text-3xl font-black text-slate-900">О себе</h2>
                                <p className="text-slate-500 font-medium">Расскажите подробнее о своем опыте и формате работы</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700 uppercase tracking-wider px-1">Короткое описание (до 500 знаков) *</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-4 text-slate-300" size={18} />
                                    <Textarea
                                        placeholder="Пример: Профессиональный бухгалтер с опытом работы в крупных компаниях. Специализируюсь на отчетности ТОО и ИП..."
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0, 500) })}
                                        rows={6}
                                        className="pl-12 pt-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500/20 resize-none"
                                    />
                                    <div className="absolute bottom-4 right-4 text-[10px] font-black text-slate-300">
                                        {formData.bio.length}/500
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-black text-slate-700 uppercase tracking-wider px-1 block mb-4">Языки общения</label>
                                <div className="flex flex-wrap gap-2">
                                    {LANGUAGES.map((lang) => (
                                        <button
                                            key={lang}
                                            onClick={() => toggleItem(formData.languages, lang, 'languages')}
                                            className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-2 font-bold transition-all ${formData.languages.includes(lang)
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                                                }`}
                                        >
                                            <Globe size={16} />
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-black text-slate-700 uppercase tracking-wider px-1 block mb-4">Формат работы</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {WORK_FORMATS.map((format) => (
                                        <button
                                            key={format.id}
                                            onClick={() => setFormData({ ...formData, work_format: format.id })}
                                            className={`h-16 rounded-2xl border-2 flex items-center justify-center gap-3 font-bold transition-all ${formData.work_format === format.id
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                                                }`}
                                        >
                                            {format.id === 'individual' ? <User size={18} /> : <Users size={18} />}
                                            {format.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-8">
                                <Button
                                    variant="outline"
                                    onClick={prevStep}
                                    className="w-full sm:flex-1 h-12 border-slate-100 hover:bg-slate-50 text-slate-400 font-bold rounded-2xl gap-2"
                                >
                                    <ChevronLeft size={20} />
                                    Назад
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    disabled={!formData.bio}
                                    className="w-full sm:flex-[2] h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-lg shadow-xl shadow-blue-200 gap-2"
                                >
                                    Далее
                                    <ChevronRight size={20} />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: CONFIRMATION */}
                    {step === 5 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2 text-center pb-4">
                                <h2 className="text-3xl font-black text-slate-900">Почти готово!</h2>
                                <p className="text-slate-500 font-medium">Проверьте данные и подтвердите согласие с правилами</p>
                            </div>

                            <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Имя и Фамилия</span>
                                        <span className="font-bold text-slate-900">{formData.first_name} {formData.last_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Опыт</span>
                                        <span className="font-bold text-slate-900">{formData.experience_years} лет</span>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Услуги ({formData.selected_services.length})</span>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.selected_services.map(s => (
                                            <Badge key={s} variant="secondary" className="bg-white text-blue-600 border-none font-bold">
                                                {s}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200">
                                    <label className="flex items-start gap-4 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.rules_accepted}
                                            onChange={(e) => setFormData({ ...formData, rules_accepted: e.target.checked })}
                                            className="mt-1 w-5 h-5 rounded border-2 border-slate-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                        />
                                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                                            Согласен с <span className="text-blue-600 underline">правилами платформы</span> и условиями обработки персональных данных
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={prevStep}
                                    className="w-full sm:flex-1 h-12 border-slate-100 hover:bg-slate-50 text-slate-400 font-bold rounded-2xl gap-2"
                                >
                                    <ChevronLeft size={20} />
                                    Назад
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading || !formData.rules_accepted}
                                    className="w-full sm:flex-[2] h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-lg shadow-xl shadow-blue-200 gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                                    Опубликовать профиль
                                </Button>
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    )
}
