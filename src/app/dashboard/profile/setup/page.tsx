import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileSetupForm } from '@/components/specialists/profile-setup-form'

export default async function ProfileSetupPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'accountant') {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Настройка <span className="text-blue-600">Профиля</span>
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Заполните информацию о себе, чтобы заказчики могли вас найти и предложить работу.
                    </p>
                </div>

                <ProfileSetupForm />
            </div>
        </div>
    )
}
