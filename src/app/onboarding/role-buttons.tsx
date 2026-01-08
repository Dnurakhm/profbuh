'use client'

import { Button } from "@/components/ui/button"
import { Briefcase, UserCircle, Loader2 } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

export default function RoleButtons() {
  const [isPending, setIsPending] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleSelectRole = async (role: 'client' | 'accountant') => {
    setIsPending(role)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, role: role })

      if (!error) {
        router.push("/onboarding/complete")
        router.refresh() // Обновляем состояние сервера
      } else {
        alert("Ошибка сохранения: " + error.message)
        setIsPending(null)
      }
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Button
        variant="outline"
        disabled={!!isPending}
        onClick={() => handleSelectRole('client')}
        className="h-40 flex flex-col gap-4 border-2 hover:border-blue-600 hover:bg-blue-50 transition-all"
      >
        {isPending === 'client' ? <Loader2 className="h-10 w-10 animate-spin text-blue-600" /> : <Briefcase className="h-10 w-10 text-blue-600" />}
        <div className="text-center">
          <p className="font-bold">Я Заказчик</p>
          <p className="text-xs text-muted-foreground">Ищу бухгалтера для задач</p>
        </div>
      </Button>

      <Button
        variant="outline"
        disabled={!!isPending}
        onClick={() => handleSelectRole('accountant')}
        className="h-40 flex flex-col gap-4 border-2 hover:border-blue-600 hover:bg-blue-50 transition-all"
      >
        {isPending === 'accountant' ? <Loader2 className="h-10 w-10 animate-spin text-blue-600" /> : <UserCircle className="h-10 w-10 text-blue-600" />}
        <div className="text-center">
          <p className="font-bold">Я Бухгалтер</p>
          <p className="text-xs text-muted-foreground">Хочу оказывать услуги</p>
        </div>
      </Button>
    </div>
  )
}