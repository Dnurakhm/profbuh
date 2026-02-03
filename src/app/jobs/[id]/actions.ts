'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function submitProposal(formData: FormData) {
    const supabase = await createClient()

    // Проверка авторизации
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: "Пользователь не авторизован" }
    }

    const price = formData.get('price')
    const coverLetter = formData.get('coverLetter')
    const jobId = formData.get('jobId')

    if (!price || !coverLetter || !jobId) {
        return { error: "Все поля обязательны для заполнения" }
    }

    try {
        console.log(`Server Action: Submitting proposal for Job ${jobId} by User ${user.id}`)

        const { error } = await supabase
            .from('bids')
            .insert({
                job_id: jobId,
                accountant_id: user.id,
                content: coverLetter,
                proposed_price: parseInt(price.toString()),
                status: 'pending'
            })

        if (error) {
            console.error("Server Action Error:", error)
            return { error: error.message }
        }

        revalidatePath(`/jobs/${jobId}`)
        return { success: true }
    } catch (e: any) {
        console.error("Server Action Exception:", e)
        return { error: e.message }
    }
}
