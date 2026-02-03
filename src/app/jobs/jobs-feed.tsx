'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Search,
    Briefcase,
    MapPin,
    Clock,
    DollarSign,
    Filter,
    ArrowUpRight
} from 'lucide-react'

const CATEGORIES = [
    { id: 'all', name: 'Все категории' },
    { id: 'Бухгалтерский учет', name: 'Бухгалтерский учет' },
    { id: 'Налоги и отчетность', name: 'Налоги и отчетность' },
    { id: 'Аудит', name: 'Аудит' },
    { id: 'Консультации', name: 'Консультации' },
    { id: 'Кадры', name: 'Кадры' },
]

export function JobsFeed({ initialJobs, appliedJobIds }: { initialJobs: any[], appliedJobIds: Set<any> }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    const filteredJobs = useMemo(() => {
        return initialJobs.filter(job => {
            const matchesSearch =
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.description.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesCategory =
                selectedCategory === 'all' ||
                job.category === selectedCategory

            return matchesSearch && matchesCategory
        })
    }, [initialJobs, searchQuery, selectedCategory])

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Search Header */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                        placeholder="Поиск по названию или описанию..."
                        className="pl-12 h-12 text-lg bg-slate-50 border-slate-200 focus-visible:ring-blue-600 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === cat.id
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Jobs List */}
            <div className="grid gap-4">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map(job => {
                        const isApplied = appliedJobIds.has(job.id)
                        return (
                            <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
                                <Card className={`border-slate-200 transaction-all duration-300 ${isApplied ? 'bg-blue-50/50 border-blue-200' : 'hover:border-blue-400 hover:shadow-md'}`}>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between md:hidden">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                            {job.category || 'Общее'}
                                                        </Badge>
                                                        {isApplied && (
                                                            <Badge className="bg-green-600 hover:bg-green-700">Вы откликнулись</Badge>
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-slate-900">
                                                        {job.budget ? `${job.budget.toLocaleString('ru-RU')} ₸` : 'Договорная'}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                    {job.title}
                                                </h3>

                                                <p className="text-slate-500 line-clamp-2 text-sm max-w-2xl">
                                                    {job.description}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400 pt-2">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {new Date(job.created_at).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Briefcase className="w-3.5 h-3.5" />
                                                        {job.bids_count || 0} откликов
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="hidden md:flex flex-col items-end justify-between min-w-[200px]">
                                                <div className="flex flex-col items-end gap-2">
                                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                        {job.category || 'Общее'}
                                                    </Badge>
                                                    {isApplied && (
                                                        <Badge className="bg-green-600 hover:bg-green-700 shadow-sm animate-in fade-in">
                                                            <span className="mr-1">✓</span> Вы откликнулись
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-lg font-black text-slate-900">
                                                        {job.budget ? `${job.budget.toLocaleString('ru-RU')} ₸` : 'Договорная'}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-medium">Бюджет проекта</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4">
                            <Search className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Ничего не найдено</h3>
                        <p className="text-slate-500">Попробуйте изменить параметры поиска</p>
                    </div>
                )}
            </div>
        </div>
    )
}
