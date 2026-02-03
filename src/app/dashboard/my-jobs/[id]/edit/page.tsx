import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EditJobForm from "./edit-job-form";

export default async function EditPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: job, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !job) return notFound();

    // Проверка прав (только автор может редактировать)
    if (job.client_id !== user.id) {
        return <div className="p-8 text-center text-red-500">У вас нет прав на редактирование этого заказа.</div>;
    }

    // Редактировать можно только активные заказы
    if (job.status !== 'open') {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">Редактирование недоступно</h1>
                <p className="text-slate-500 mb-8">
                    Вы не можете редактировать этот заказ, так как он находится в статусе "{job.status === 'in_progress' ? 'В работе' : 'Завершен'}".
                </p>
                <Link
                    href="/dashboard/my-jobs"
                    className="inline-flex items-center text-blue-600 hover:underline"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Вернуться назад
                </Link>
            </div>
        );
    }

    return <EditJobForm job={job} />;
}
