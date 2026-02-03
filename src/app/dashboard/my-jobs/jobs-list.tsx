'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    FileText,
    PlusCircle,
    Search,
    Clock,
    MessageSquare,
    MoreVertical,
    Pencil,
    Trash2,
    Eye
} from "lucide-react"

export function JobsList({ initialJobs, initialFilter = 'all' }: { initialJobs: any[], initialFilter?: 'all' | 'open' | 'in_progress' | 'completed' }) {
    const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'completed'>(initialFilter)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const filteredJobs = initialJobs.filter(job => {
        if (filter === 'all') return true
        return job.status === filter
    })

    const handleCancel = async (jobId: string) => {
        if (!confirm("Вы уверены, что хотите отменить этот заказ? Поиск исполнителей будет остановлен.")) return

        setLoadingId(jobId)
        const { error } = await supabase
            .from('jobs')
            .update({ status: 'cancelled' })
            .eq('id', jobId)

        if (error) {
            alert(error.message)
        } else {
            router.refresh()
        }
        setLoadingId(null)
    }

    return (
        <div className="max-w-5xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Мои заказы</h1>
                    <p className="text-slate-500 text-lg">Управляйте вашими проектами и откликами</p>
                </div>
                <Button
                    asChild
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 px-6 h-12 text-base font-bold transition-transform hover:-translate-y-0.5"
                >
                    <Link href="/dashboard/my-jobs/new">
                        <PlusCircle className="mr-2 h-5 w-5" /> Создать заказ
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>Все</FilterButton>
                <FilterButton active={filter === 'open'} onClick={() => setFilter('open')}>Активные</FilterButton>
                <FilterButton active={filter === 'in_progress'} onClick={() => setFilter('in_progress')}>В работе</FilterButton>
                <FilterButton active={filter === 'completed'} onClick={() => setFilter('completed')}>Завершенные</FilterButton>
            </div>

            {/* Jobs Grid */}
            <div className="space-y-4">
                {filteredJobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <Search className="w-10 h-10 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {filter === 'all' ? "Заказов пока нет" : "В этой категории пусто"}
                        </h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8">
                            {filter === 'all'
                                ? "Создайте свой первый заказ, чтобы найти отличного специалиста."
                                : "Попробуйте выбрать другой фильтр."}
                        </p>
                        {filter === 'all' && (
                            <Button asChild className="bg-blue-600 text-white rounded-xl">
                                <Link href="/dashboard/my-jobs/new">Разместить заказ</Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    filteredJobs.map((job) => (
                        <Card key={job.id} className="group border-none shadow-sm hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 bg-white rounded-2xl overflow-hidden relative">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${job.status === 'open' ? 'bg-blue-500' :
                                job.status === 'in_progress' ? 'bg-green-500 ' :
                                    job.status === 'cancelled' ? 'bg-red-500' : 'bg-slate-300'
                                }`} />

                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row gap-6 p-6">

                                    {/* Icon */}
                                    <div className="hidden md:flex flex-shrink-0">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${job.status === 'open' ? 'bg-blue-50 text-blue-600' :
                                            job.status === 'in_progress' ? 'bg-green-50 text-green-600' :
                                                job.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            {job.title[0].toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Badge className={`border-none px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${job.status === 'open' ? 'bg-blue-100 text-blue-700' :
                                                job.status === 'in_progress' ? 'bg-green-100 text-green-700' :
                                                    job.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {job.status === 'open' ? 'Поиск исполнителя' :
                                                    job.status === 'in_progress' ? 'В работе' :
                                                        job.status === 'cancelled' ? 'Отменен' : 'Завершен'}
                                            </Badge>
                                            <span className="text-xs font-medium text-slate-400 flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {new Date(job.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                                            </span>
                                        </div>

                                        <Link href={`/dashboard/my-jobs/${job.id}`} className="block">
                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                {job.title}
                                            </h3>
                                        </Link>

                                        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                                            {job.description}
                                        </p>

                                        <div className="flex items-center gap-6 pt-2">
                                            <div className="text-sm">
                                                <span className="text-slate-400 font-medium">Бюджет: </span>
                                                <span className="font-bold text-slate-900">
                                                    {job.budget ? `${job.budget.toLocaleString()} ₸` : "Договорная"}
                                                </span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-slate-400 font-medium">Категория: </span>
                                                <span className="font-bold text-slate-700">{job.category}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-row md:flex-col justify-end gap-3 mt-4 md:mt-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 md:w-48">
                                        <Button asChild variant="outline" className="w-full justify-between group/btn border-slate-200 hover:border-blue-300 hover:bg-blue-50">
                                            <Link href={`/dashboard/my-jobs/${job.id}`}>
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare className="w-4 h-4 text-blue-600" />
                                                    <span className="font-bold text-slate-700 group-hover/btn:text-blue-700">
                                                        Отклики
                                                    </span>
                                                </div>
                                                <Badge className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-2">
                                                    {job.bidsCount || job.bids?.length || 0}
                                                </Badge>
                                            </Link>
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-slate-700">
                                                    <MoreVertical className="w-4 h-4 mr-2" />
                                                    Управление
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/my-jobs/${job.id}`}>
                                                        <Eye className="w-4 h-4 mr-2" /> Просмотр
                                                    </Link>
                                                </DropdownMenuItem>
                                                {job.status === 'open' && (
                                                    <>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/my-jobs/${job.id}/edit`}>
                                                                <Pencil className="w-4 h-4 mr-2" /> Редактировать
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                handleCancel(job.id)
                                                            }}
                                                            className="text-red-600 focus:text-red-600 cursor-pointer"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" /> Отменить
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}

function FilterButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
    return (
        <Button
            variant={active ? "secondary" : "ghost"}
            onClick={onClick}
            className={`rounded-full px-6 transition-all ${active
                ? "bg-slate-900 text-white shadow-md hover:bg-slate-800"
                : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                }`}
        >
            {children}
        </Button>
    )
}
