import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Chat from "@/components/chat"

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ jobId: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { jobId } = await searchParams

    if (!user) redirect("/login")

    // Мы больше не делаем проверку здесь, так как сам компонент Chat 
    // теперь умеет загружать список всех доступных чатов и проверять права.
    // Если jobId нет, он покажет экран "Выберите чат".

    return (
        <div className="mx-auto max-w-[1400px] h-[calc(100vh-64px)] sm:h-[calc(100vh-100px)] sm:py-6 flex flex-col">
            <div className="flex-1 min-h-0">
                <Chat jobId={jobId} userId={user.id} />
            </div>
        </div>
    )
}
