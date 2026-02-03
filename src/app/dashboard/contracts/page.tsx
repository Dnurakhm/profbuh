import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ContractsList } from "./contracts-list"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function MyContractsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    // Получаем проекты, где пользователь является исполнителем
    const { data: contracts, error } = await supabase
        .from('jobs')
        .select(`
            *,
            profiles:client_id (
                full_name,
                avatar_url
            )
        `)
        .eq('accountant_id', user.id)
        .in('status', ['in_progress', 'completed'])
        .order('updated_at', { ascending: false })

    if (error) {
        console.error("Error fetching contracts:", error)
        return <div className="p-10 text-red-500">Ошибка загрузки проектов</div>
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

                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Текущие проекты</h1>
                <p className="text-lg text-slate-500 font-medium">Ваши активные и завершенные контракты</p>
            </div>

            <ContractsList contracts={contracts || []} />
        </div>
    )
}
