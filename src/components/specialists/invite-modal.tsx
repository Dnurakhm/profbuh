'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Briefcase, X, Loader2, CheckCircle2, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface InviteModalProps {
    specialistId: string
    specialistName: string
    isOpen: boolean
    onClose: () => void
}

export function InviteModal({ specialistId, specialistName, isOpen, onClose }: InviteModalProps) {
    const [jobs, setJobs] = useState<any[]>([])
    const [existingBids, setExistingBids] = useState<string[]>([])
    const [existingInvites, setExistingInvites] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (!isOpen) {
            setIsSuccess(false)
            setSelectedJobId(null)
            return
        }

        async function fetchMyOpenJobsAndStatus() {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch open jobs
            const { data: jobsData, error: jobsError } = await supabase
                .from('jobs')
                .select('id, title, status')
                .eq('client_id', user.id)
                .eq('status', 'open')
                .order('created_at', { ascending: false })

            if (jobsError) {
                toast.error('Ошибка при загрузке заказов')
                setLoading(false)
                return
            }

            const jobIds = jobsData?.map((j: any) => j.id) || []

            if (jobIds.length > 0) {
                // Fetch existing bids from this specialist on these jobs
                const { data: bidsData } = await supabase
                    .from('bids')
                    .select('job_id')
                    .eq('accountant_id', specialistId)
                    .in('job_id', jobIds)

                // Fetch existing invitations sent to this specialist for these jobs from the NEW table
                const { data: invitesData } = await supabase
                    .from('job_invitations')
                    .select('job_id')
                    .eq('specialist_id', specialistId)
                    .in('job_id', jobIds)

                setExistingBids(bidsData?.map((b: any) => b.job_id) || [])
                setExistingInvites(invitesData?.map((i: any) => i.job_id) || [])
            }

            setJobs(jobsData || [])
            setLoading(false)
        }

        fetchMyOpenJobsAndStatus()
    }, [isOpen, supabase, specialistId])

    const handleInvite = async () => {
        if (!selectedJobId) return

        // Check if already invited or already bid
        if (existingInvites.includes(selectedJobId)) {
            toast.error('Вы уже приглашали этого специалиста')
            return
        }

        if (existingBids.includes(selectedJobId)) {
            toast.error('Специалист уже откликнулся на этот заказ')
            return
        }

        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Создаем запись в таблице приглашений (для надежного отслеживания)
            const { error: inviteError } = await supabase
                .from('job_invitations')
                .insert({
                    job_id: selectedJobId,
                    client_id: user.id,
                    specialist_id: specialistId,
                    status: 'pending'
                })

            if (inviteError) {
                // Если ошибка уникальности (уже есть запись), трактуем как успех или предупреждаем
                if (inviteError.code === '23505') {
                    toast.error('Вы уже приглашали этого специалиста')
                    setSubmitting(false)
                    return
                }
                throw inviteError
            }

            // 2. Создаем уведомление для специалиста
            await supabase
                .from('notifications')
                .insert({
                    user_id: specialistId,
                    type: 'job_invitation',
                    title: 'Новое приглашение в проект! ✉️',
                    content: `Заказчик пригласил вас ознакомиться с проектом и подать отклик.`,
                    link: `/jobs/${selectedJobId}`,
                    job_id: selectedJobId
                })

            setIsSuccess(true)
            setExistingInvites(prev => [...prev, selectedJobId])
            toast.success('Приглашение отправлено!')
        } catch (err: any) {
            console.error('Invite error:', err)
            toast.error('Ошибка при отправке: ' + err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const isAlreadyInvited = selectedJobId ? existingInvites.includes(selectedJobId) : false
    const hasAlreadyBid = selectedJobId ? existingBids.includes(selectedJobId) : false

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">Предложить работу</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                <div className="px-6 sm:px-8 pb-8">
                    {isSuccess ? (
                        <div className="py-8 text-center space-y-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
                                <CheckCircle2 size={32} className="sm:size-[40px]" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Приглашение отправлено!</h3>
                                <p className="text-slate-500 font-medium text-sm">
                                    Мы уведомили {specialistName}. Он сможет изучить ваш заказ и подать отклик.
                                </p>
                            </div>
                            <Button onClick={onClose} className="w-full h-12 bg-slate-900 text-white font-bold rounded-xl mt-4">
                                Закрыть
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 sm:space-y-6">
                            <p className="text-slate-500 font-medium text-xs sm:text-base">
                                Выберите ваш открытый заказ для специалиста <span className="text-slate-900 font-black">{specialistName}</span>.
                            </p>

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                </div>
                            ) : jobs.length > 0 ? (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                                    {jobs.map((job) => {
                                        const jobInvited = existingInvites.includes(job.id)
                                        const jobBid = existingBids.includes(job.id)

                                        return (
                                            <div
                                                key={job.id}
                                                onClick={() => setSelectedJobId(job.id)}
                                                className={`p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedJobId === job.id
                                                    ? 'border-blue-600 bg-blue-50/30'
                                                    : 'border-slate-50 hover:border-blue-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedJobId === job.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                                                            }`}>
                                                            <Briefcase size={16} className="sm:size-5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className={`font-bold block truncate text-sm sm:text-base ${selectedJobId === job.id ? 'text-blue-700' : 'text-slate-700'}`}>
                                                                {job.title}
                                                            </span>
                                                            <div className="flex gap-2">
                                                                {jobBid && (
                                                                    <span className="text-[9px] font-black uppercase text-green-600 bg-green-50 px-1 py-0.5 rounded">Откликнулся</span>
                                                                )}
                                                                {jobInvited && (
                                                                    <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-1 py-0.5 rounded">Приглашен</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {selectedJobId === job.id && (
                                                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                                                            <CheckCircle2 size={12} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="py-6 sm:py-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center px-6">
                                    <h4 className="font-bold text-slate-900 mb-1 sm:mb-2 text-sm sm:text-base">У вас нет открытых заказов</h4>
                                    <p className="text-[10px] sm:text-sm text-slate-500 mb-6 font-medium">
                                        Чтобы пригласить специалиста, сначала создайте описание задачи.
                                    </p>
                                    <Link href="/dashboard/my-jobs/new" className="block">
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl h-11 sm:h-12 gap-2 shadow-lg shadow-blue-200 text-sm">
                                            <PlusCircle size={18} />
                                            Создать заказ
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {jobs.length > 0 && (
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="ghost"
                                        onClick={onClose}
                                        className="flex-1 h-11 sm:h-12 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl text-sm"
                                    >
                                        Отмена
                                    </Button>
                                    <Button
                                        disabled={!selectedJobId || submitting || isAlreadyInvited || hasAlreadyBid}
                                        onClick={handleInvite}
                                        className="flex-1 h-11 sm:h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black rounded-xl shadow-lg shadow-blue-200 transition-all text-sm"
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : isAlreadyInvited ? 'Приглашен' : hasAlreadyBid ? 'Откликнулся' : 'Отправить'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
