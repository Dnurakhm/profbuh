import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ProposalsList } from "./proposals-list"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function MyProposalsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    // Получаем отклики текущего пользователя с данными о заказе
    const { data: proposals, error } = await supabase
        .from('bids')
        .select(`
            *,
            jobs:job_id (
                id,
                title,
                status,
                budget,
                accountant_id
            )
        `)
        .eq('accountant_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching proposals:", error)
        return <div className="p-10 text-red-500">Ошибка загрузки откликов</div>
    }

    return (
        <div className="container max-w-5xl mx-auto py-8 px-4">
            <div className="mb-10">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-slate-500 hover:text-blue-600 font-medium mb-6 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    В дашборд
                </Link>

                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Мои отклики</h1>
                <p className="text-lg text-slate-500 font-medium">История ваших предложений по заказам</p>
            </div>

            <ProposalsList proposals={proposals || []} />
        </div>
    )
}
