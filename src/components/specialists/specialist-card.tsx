'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MessageSquare, Briefcase, ChevronRight, UserCircle, MapPin, Clock, DollarSign } from "lucide-react"
import Link from "next/link"

import { useState } from "react"
import { InviteModal } from "./invite-modal"

interface SpecialistCardProps {
    specialist: {
        id: string
        full_name: string
        specialization: string | null
        rating_avg: number | null
        reviews_count: number | null
        bio: string | null
        city: string | null
        experience_years: number | null
        services: any[] | null
        completed_jobs_count?: number
    }
}

export function SpecialistCard({ specialist }: SpecialistCardProps) {
    const [isInviteOpen, setIsInviteOpen] = useState(false)

    return (
        <>
            <Card className="group border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white rounded-[2rem]">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        {/* Аватар и Рейтинг */}
                        <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-3">
                            <div className="relative">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-50 rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-3xl font-black text-blue-600 border-2 border-white shadow-sm ring-1 ring-blue-100/50">
                                    {specialist.full_name?.[0]}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 shadow-md border border-slate-100 flex items-center gap-1">
                                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                    <span className="text-[10px] font-black text-slate-700">
                                        {specialist.rating_avg?.toFixed(1) || "0.0"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:items-center">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <MessageSquare size={13} />
                                    <span className="text-[10px] sm:text-xs font-bold leading-none">{specialist.reviews_count || 0} отзывов</span>
                                </div>
                            </div>
                        </div>

                        {/* Информация */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="mb-4 sm:mb-3">
                                <div className="flex flex-col gap-1 mb-2">
                                    <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                        {specialist.full_name}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-transparent text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 sm:px-3 py-0.5">
                                            {specialist.specialization || "Бухгалтер"}
                                        </Badge>
                                        {specialist.city && (
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                <MapPin size={10} /> {specialist.city}
                                            </div>
                                        )}
                                        {specialist.experience_years && (
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                <Clock size={10} /> {specialist.experience_years} лет
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-2 font-medium">
                                    {specialist.bio || "Специалист еще не заполнил информацию о себе. Свяжитесь, чтобы узнать подробности."}
                                </p>

                                {specialist.services && specialist.services.length > 0 && (
                                    <div className="mt-3 flex items-center gap-1.5">
                                        <div className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
                                            <DollarSign size={10} />
                                            от {Math.min(...specialist.services.map((s: any) => s.price_from)).toLocaleString('ru-RU')} ₸
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">за услугу</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-row sm:flex-wrap items-center gap-2 sm:gap-3">
                                <Link href={`/profile/${specialist.id}`} className="flex-1">
                                    <Button variant="outline" className="w-full h-10 sm:h-11 border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-bold rounded-xl gap-1.5 text-xs sm:text-sm transition-all group/btn px-2">
                                        Профиль
                                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform hidden sm:block" />
                                    </Button>
                                </Link>
                                <Button
                                    onClick={() => setIsInviteOpen(true)}
                                    className="flex-1 h-10 sm:h-11 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-200 gap-1.5 text-xs sm:text-sm transition-all px-2"
                                >
                                    <Briefcase size={14} className="hidden sm:block" />
                                    Предложить
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <InviteModal
                specialistId={specialist.id}
                specialistName={specialist.full_name}
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
            />
        </>
    )
}
