import { createClient } from "@/utils/supabase/server"
import { redirect, notFound } from "next/navigation"
import Chat from "@/components/chat"
import { ChevronLeft, Info } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ jobId: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { jobId } = await searchParams

    if (!user) redirect("/login")
    if (!jobId) redirect("/dashboard")

    console.log("💬 ChatPage: Starting fetch for jobId:", jobId)

    // Получаем детали заказа и проверяем права доступа
    const { data: job, error } = await supabase
        .from('jobs')
        .select(`
            id,
            title,
            status,
            client_id,
            accountant_id,
            client:client_id (full_name),
            specialist:accountant_id (full_name)
        `)
        .eq('id', jobId)
        .single()

    console.log("💬 ChatPage: Fetch complete. Job found:", !!job, "Error:", error?.message)

    if (error || !job) {
        return notFound()
    }

    // Проверяем, является ли пользователь участником чата
    const isParticipant = job.client_id === user.id || job.accountant_id === user.id

    if (!isParticipant) {
        return (
            <div className="container max-w-4xl mx-auto py-20 px-4 text-center">
                <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] inline-block">
                    <Info className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-red-900 mb-2">Доступ запрещен</h2>
                    <p className="text-red-700">Вы не являетесь участником этого обсуждения.</p>
                </div>
            </div>
        )
    }

    // Хелпер для безопасного получения имени (может прийти массив или объект)
    const getProfileName = (p: any) => {
        if (!p) return null;
        if (Array.isArray(p)) return p[0]?.full_name;
        return p.full_name;
    }

    const otherParty = job.client_id === user.id
        ? (getProfileName(job.specialist) || "Специалист")
        : (getProfileName(job.client) || "Заказчик")

    return (
        <div className="container max-w-5xl mx-auto py-8 px-4 h-[calc(100vh-100px)] flex flex-col">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <Link
                        href="/dashboard/contracts"
                        className="inline-flex items-center text-slate-500 hover:text-blue-600 font-medium mb-3 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Назад к проектам
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{job.title}</h1>
                        <Badge className={`${job.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} border-none`}>
                            {job.status === 'open' ? 'Обсуждение' : 'В работе'}
                        </Badge>
                    </div>
                    <p className="text-slate-500 font-medium">Чат с: <span className="text-blue-600">{otherParty}</span></p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <Chat jobId={jobId} userId={user.id} />
            </div>
        </div>
    )
}
