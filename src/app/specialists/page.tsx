'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search, SlidersHorizontal, UserCircle, Briefcase, Star, Filter } from 'lucide-react'
import { SpecialistCard } from '@/components/specialists/specialist-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SpecialistSkeleton } from '@/components/ui/skeletons'
import { SPECIALIST_SERVICES } from '@/constants/specialist'

const CATEGORIES = ["Все", ...SPECIALIST_SERVICES]

export default function SpecialistsPage() {
    const [specialists, setSpecialists] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState("Все")
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        async function fetchSpecialists() {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'accountant')
                    .order('rating_avg', { ascending: false })

                if (!error) {
                    setSpecialists(data || [])
                }
            } catch (err) {
                console.error('Error fetching specialists:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchSpecialists()
    }, [supabase])

    const filteredSpecialists = useMemo(() => {
        return specialists.filter(s => {
            const matchesSearch =
                s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.city?.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesCategory =
                selectedCategory === "Все" ||
                s.specialization?.includes(selectedCategory) ||
                (s.services && s.services.some((ser: any) => ser.name === selectedCategory))

            return matchesSearch && matchesCategory
        })
    }, [specialists, searchTerm, selectedCategory])

    return (
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-12 pb-24">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:gap-8 mb-8 sm:mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
                    <div className="space-y-1 sm:space-y-2">
                        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Найти <span className="text-blue-600">Специалиста</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm sm:text-lg max-w-xl">
                            Проверенные бухгалтеры и эксперты для вашего бизнеса
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-[400px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Поиск по имени или специализации..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 h-12 sm:h-14 bg-white border-slate-200 shadow-sm rounded-2xl text-sm sm:text-base font-medium focus:ring-blue-500/20"
                        />
                    </div>
                </div>

                {/* Categories / Filters */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 shrink-0">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${selectedCategory === cat
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => { setSearchTerm(''); setSelectedCategory('Все') }}
                        className="h-9 sm:h-11 rounded-xl sm:rounded-2xl border-slate-200 gap-1.5 shrink-0 font-bold text-slate-600 text-xs sm:text-sm"
                    >
                        <Filter size={16} />
                        Сбросить
                    </Button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => <SpecialistSkeleton key={i} />)}
                </div>
            ) : filteredSpecialists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredSpecialists.map((specialist) => (
                        <SpecialistCard key={specialist.id} specialist={specialist} />
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <UserCircle size={48} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Никого не нашли</h3>
                    <p className="text-slate-500 font-medium">Попробуйте изменить параметры поиска или фильтры</p>
                    <Button
                        variant="link"
                        onClick={() => { setSearchTerm(''); setSelectedCategory('Все') }}
                        className="mt-4 text-blue-600 font-bold"
                    >
                        Сбросить все фильтры
                    </Button>
                </div>
            )}
        </div>
    )
}
