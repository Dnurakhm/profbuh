'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Clock,
    Banknote,
    FileText,
    ChevronRight,
    CircleDashed,
    CheckCircle2,
    XCircle
} from "lucide-react"
import Link from "next/link"

const STATUS_MAP: Record<string, { label: string, color: string, icon: any }> = {
    pending: { label: 'На рассмотрении', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: CircleDashed },
    accepted: { label: 'Принят', color: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle2 },
    rejected: { label: 'Отклонен', color: 'bg-slate-50 text-slate-500 border-slate-100', icon: XCircle }
}

export function ProposalsList({ proposals }: { proposals: any[] }) {
    if (!proposals || proposals.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4 text-slate-300">
                    <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Вы еще не отправляли отклики</h3>
                <p className="text-slate-500 mt-2 mb-6">Найдите подходящие заказы в ленте</p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                    <Link href="/jobs">Перейти к поиску</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="grid gap-4">
            {proposals.map((bid) => {
                const isHired = bid.jobs?.accountant_id === bid.accountant_id && bid.jobs?.status !== 'open'
                const status = isHired
                    ? { label: 'Вас выбрали!', color: 'bg-green-600 text-white border-green-700', icon: CheckCircle2 }
                    : (STATUS_MAP[bid.status] || STATUS_MAP.pending)

                // Если заказ уже в работе у другого или закрыт, и это не мы
                const isLost = !isHired && bid.jobs?.status !== 'open'
                const finalStatus = isLost
                    ? { label: 'Завершен / Другой исполнитель', color: 'bg-slate-100 text-slate-400 border-slate-200', icon: XCircle }
                    : status

                const StatusIcon = finalStatus.icon

                return (
                    <Card key={bid.id} className={`border-none shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden group ${isHired ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}>
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                                {/* Статус - боковая полоса на десктопе */}
                                <div className={`w-full md:w-1.5 ${isHired ? 'bg-green-500' : isLost ? 'bg-slate-300' : 'bg-amber-400'}`} />

                                <div className="p-6 flex-1 flex flex-col md:flex-row justify-between gap-6">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Badge variant="outline" className={`${finalStatus.color} px-3 py-1 rounded-full font-bold flex items-center gap-1.5 border`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {finalStatus.label}
                                            </Badge>
                                            <span className="text-xs font-bold text-slate-400 flex items-center">
                                                <Clock className="w-3.5 h-3.5 mr-1" />
                                                {new Date(bid.created_at).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {bid.jobs?.title}
                                            </h3>
                                            <p className="text-slate-500 text-sm mt-2 line-clamp-2 italic">
                                                &ldquo;{bid.content}&rdquo;
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between items-end gap-4 min-w-[180px]">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ваше предложение</p>
                                            <p className="text-2xl font-black text-slate-900">
                                                {bid.proposed_price ? `${bid.proposed_price.toLocaleString('ru-RU')} ₸` : 'Договорная'}
                                            </p>
                                        </div>

                                        <Button variant="outline" asChild className="rounded-xl border-slate-200 hover:bg-slate-50 group/btn">
                                            <Link href={`/jobs/${bid.job_id}`} className="flex items-center">
                                                Просмотреть заказ
                                                <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                            </Link>
                                        </Button>
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
