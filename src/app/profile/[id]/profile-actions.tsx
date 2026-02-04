'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Briefcase } from 'lucide-react'
import { InviteModal } from '@/components/specialists/invite-modal'

interface ProfileActionsProps {
    specialistId: string
    specialistName: string
    isClient: boolean
}

export function ProfileActions({ specialistId, specialistName, isClient }: ProfileActionsProps) {
    const [isInviteOpen, setIsInviteOpen] = useState(false)

    if (!isClient) return null

    return (
        <div className="mt-6 pt-6 border-t border-white/10">
            <Button
                onClick={() => setIsInviteOpen(true)}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 font-black rounded-xl h-12 gap-2 shadow-lg"
            >
                <Briefcase size={20} />
                Предложить работу
            </Button>

            <InviteModal
                specialistId={specialistId}
                specialistName={specialistName}
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
            />
        </div>
    )
}
