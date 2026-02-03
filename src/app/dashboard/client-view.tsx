'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle, FileText, Users, CreditCard, ArrowRight, Activity, CheckCircle } from 'lucide-react'

export function ClientDashboardView({ profile, stats }: { profile: any, stats: any }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Кабинет Заказчика</h2>
                    <p className="text-slate-500 text-lg">Управляйте вашими задачами и находите исполнителей</p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200">
                    <Link href="/dashboard/my-jobs/new">
                        <PlusCircle className="mr-2 h-5 w-5" /> Новый заказ
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Активные заказы"
                    value={stats.activeJobs}
                    icon={FileText}
                    color="blue"
                    href="/dashboard/my-jobs?filter=open"
                />
                <StatCard
                    title="В работе"
                    value={stats.inProgressJobs}
                    icon={Activity}
                    color="green"
                    href="/dashboard/my-jobs?filter=in_progress"
                />
                <StatCard
                    title="Завершенные"
                    value={stats.completedJobs}
                    icon={CheckCircle}
                    color="slate"
                    href="/dashboard/my-jobs?filter=completed"
                />
                <StatCard
                    title="Новые отклики"
                    value={stats.bids}
                    icon={Users}
                    color="amber"
                    href="/dashboard/my-jobs?filter=open"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-3xl">
                    <CardHeader>
                        <CardTitle>Последние действия</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.recentActivity && stats.recentActivity.length > 0 ? (
                            <div className="space-y-4">
                                {stats.recentActivity.map((job: any) => (
                                    <div key={job.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 shrink-0 rounded-full bg-white border border-slate-100 flex items-center justify-center text-blue-600">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 text-sm truncate">{job.title}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">
                                                    {new Date(job.created_at).toLocaleDateString('ru-RU')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`text-[10px] font-black px-2 py-1 rounded border uppercase tracking-wider ${job.status === 'open' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                            job.status === 'in_progress' ? 'bg-green-100 text-green-700 border-green-200' :
                                                'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                            {job.status === 'open' ? 'Поиск' :
                                                job.status === 'in_progress' ? 'В работе' : 'Закрыт'}
                                        </div>
                                    </div>
                                ))}
                                <Button variant="ghost" asChild className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    <Link href="/dashboard/my-jobs">Посмотреть все</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                                <p>Здесь будет история ваших действий.</p>
                                <Button variant="link" asChild className="mt-2 text-blue-600">
                                    <Link href="/dashboard/my-jobs/new">Создать первый заказ</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-blue-900 text-white rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -translate-y-10 translate-x-10" />
                    <CardHeader>
                        <CardTitle className="text-white">Помощь</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-blue-100 text-sm">Не знаете с чего начать? Наш гид поможет вам оформить первый заказ.</p>
                        <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border-0">
                            Как это работает?
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function BriefcaseIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            <rect width="20" height="14" x="2" y="6" rx="2" />
        </svg>
    )
}


function StatCard({
    title,
    value,
    icon: Icon,
    color,
    href
}: {
    title: string,
    value: string | number,
    icon: any,
    color: 'blue' | 'green' | 'amber' | 'purple' | 'slate',
    href?: string
}) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        amber: 'bg-amber-50 text-amber-600',
        purple: 'bg-purple-50 text-purple-600',
        slate: 'bg-slate-100 text-slate-600',
    }

    const Content = () => (
        <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer h-full group">
            <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                <div className={`p-3 sm:p-4 shrink-0 rounded-xl sm:rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider truncate">{title}</p>
                    <h3 className="text-lg sm:text-2xl font-black text-slate-900 truncate">{value}</h3>
                </div>
            </CardContent>
        </Card>
    )

    if (href) {
        return (
            <Link href={href} className="block h-full">
                <Content />
            </Link>
        )
    }

    return <Content />
}
