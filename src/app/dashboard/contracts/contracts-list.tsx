'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Clock,
    Banknote,
    Briefcase,
    ChevronRight,
    User,
    CheckCircle2,
    Calendar
} from "lucide-react"
import Link from "next/link"

const STATUS_MAP: Record<string, { label: string, color: string, icon: any }> = {
    in_progress: { label: 'В работе', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Briefcase },
    completed: { label: 'Завершен', color: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle2 },
}

export function ContractsList({ contracts }: { contracts: any[] }) {
    if (!contracts || contracts.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4 text-slate-300">
                    <Briefcase className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">У вас пока нет активных проектов</h3>
                <p className="text-slate-500 mt-2 mb-6">Откликайтесь на заказы, чтобы начать работу</p>
                <Button asChild className="bg-slate-900 hover:bg-black text-white rounded-xl">
                    <Link href="/jobs">Найти работу</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="grid gap-6">
            {contracts.map((job) => {
                const status = STATUS_MAP[job.status] || STATUS_MAP.in_progress
                const StatusIcon = status.icon

                return (
                    <Card key={job.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden group bg-white">
                        <CardContent className="p-0">
                            <div className="flex flex-col">
                                <div className="p-8 flex flex-col md:flex-row justify-between gap-8">
                                    <div className="space-y-6 flex-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Badge className={`${status.color} px-4 py-1.5 rounded-full font-bold flex items-center gap-2 border shadow-sm`}>
                                                <StatusIcon className="w-4 h-4" />
                                                {status.label}
                                            </Badge>
                                            <span className="text-xs font-bold text-slate-400 flex items-center bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                                <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                Создан: {new Date(job.created_at).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-3">
                                                {job.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold">
                                                    {job.profiles?.full_name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Заказчик</p>
                                                    <p className="font-bold text-slate-900">{job.profiles?.full_name || 'Не указан'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between items-end gap-6 min-w-[200px] bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
                                        <div className="text-right w-full">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Бюджет проекта</p>
                                            <p className="text-3xl font-black text-slate-900 tracking-tight">
                                                {job.budget ? `${job.budget.toLocaleString('ru-RU')} ₸` : 'Договорная'}
                                            </p>
                                        </div>

                                        <div className="flex gap-2 w-full">
                                            <Button variant="outline" asChild className="flex-1 rounded-xl border-slate-200 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all font-bold">
                                                <Link href={`/dashboard/chat?jobId=${job.id}`}>
                                                    Чат
                                                </Link>
                                            </Button>
                                            <Button asChild className="flex-1 rounded-xl bg-slate-900 hover:bg-black text-white font-bold shadow-lg shadow-slate-200">
                                                <Link href={`/jobs/${job.id}`}>
                                                    Детали
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
