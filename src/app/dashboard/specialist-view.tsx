'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle, Search, Briefcase, TrendingUp, Star } from 'lucide-react'

export function SpecialistDashboardView({ profile, stats }: { profile: any, stats: any }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Кабинет Специалиста</h2>
                    <p className="text-slate-500 text-lg">Отслеживайте работу и доходы</p>
                </div>
                <Button asChild className="bg-slate-900 hover:bg-black text-white rounded-xl shadow-lg">
                    <Link href="/jobs">
                        <Search className="mr-2 h-5 w-5" /> Найти работу
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardStat
                    title="Активные отклики"
                    value={stats.proposals}
                    icon={TrendingUp}
                    color="blue"
                    link="/dashboard/proposals"
                />
                <DashboardStat
                    title="Текущие проекты"
                    value={stats.contracts}
                    icon={Briefcase}
                    color="green"
                    link="/dashboard/contracts"
                />
                <DashboardStat
                    title="Рейтинг"
                    value="New"
                    icon={Star}
                    color="amber"
                    link="/profile"
                />
                <DashboardStat
                    title="Заработано (мес)"
                    value={stats.earnings + " ₸"}
                    icon={WalletIcon}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-3xl">
                    <CardHeader>
                        <CardTitle>Рекомендуемые заказы</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.recommendedJobs && stats.recommendedJobs.length > 0 ? (
                            <div className="space-y-4">
                                {stats.recommendedJobs.map((job: any) => (
                                    <div key={job.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all group gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                                <Briefcase className="w-6 h-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-slate-900 text-base truncate">{job.title}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-200 text-slate-600 uppercase tracking-tighter">
                                                        {job.category || 'Общее'}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                                                        {new Date(job.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                                            <p className="font-black text-slate-900 text-lg">
                                                {job.budget ? job.budget.toLocaleString() + ' ₸' : 'Договорная'}
                                            </p>
                                            <Button variant="link" asChild className="p-0 h-auto text-blue-600 hover:text-blue-700 text-sm font-bold opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                                                <Link href={`/jobs/${job.id}`}>
                                                    Посмотреть <TrendingUp className="w-3 h-3" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="ghost" asChild className="w-full text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                                    <Link href="/jobs">Все заказы</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                                <p>Пока нет доступных заказов.</p>
                                <Button variant="link" asChild className="mt-2 text-blue-600">
                                    <Link href="/jobs">Посмотреть все заказы</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-slate-900 text-white rounded-3xl relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl translate-y-10 -translate-x-10" />
                    <CardHeader>
                        <CardTitle className="text-white">Ваш профиль</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold">
                                {profile?.full_name?.[0] || 'U'}
                            </div>
                            <div>
                                <p className="font-bold">{profile?.full_name || 'Пользователь'}</p>
                                <p className="text-xs text-slate-400">Начинающий специалист</p>
                            </div>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[10%]" />
                        </div>
                        <p className="text-xs text-slate-400">Заполните профиль на 100%, чтобы получать больше заказов.</p>
                        <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border-0">
                            Редактировать
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function WalletIcon(props: any) {
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
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a2 2 0 0 1-2-2V9" />
            <path d="M21 16h-4a2 2 0 0 0 0 4h4" />
        </svg>
    )
}

function DashboardStat({ title, value, icon: Icon, color, link }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600",
        amber: "bg-amber-50 text-amber-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        slate: "bg-slate-50 text-slate-600"
    }

    return (
        <Link href={link || "#"} className="block group">
            <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-white h-full relative overflow-hidden">
                <CardContent className="p-4 sm:p-6 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 truncate">{title}</p>
                        <h3 className="text-lg sm:text-2xl font-black text-slate-900 truncate">{value}</h3>
                    </div>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl sm:rounded-2xl flex items-center justify-center ${colors[color] || colors.slate} group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                </CardContent>
                {link && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-10 text-blue-600 transition-opacity" />
                )}
            </Card>
        </Link>
    )
}
