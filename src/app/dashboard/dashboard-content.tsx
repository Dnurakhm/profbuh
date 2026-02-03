'use client'

import { useUserMode } from '@/context/user-mode-context'
import { ClientDashboardView } from './client-view'
import { SpecialistDashboardView } from './specialist-view'

export default function DashboardContent({ profile, stats }: { profile: any, stats: any }) {
    const { mode } = useUserMode()

    // Если профиль не загружен, показываем скелетон или загрузку
    if (!profile) return <div>Загрузка профиля...</div>

    return (
        <div className="min-h-screen pb-20">
            {mode === 'client' ? (
                <ClientDashboardView profile={profile} stats={stats.client} />
            ) : (
                <SpecialistDashboardView profile={profile} stats={stats.specialist} />
            )}
        </div>
    )
}
