'use client'

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"

export default function CompleteJobButton({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleComplete = async () => {
    if (!confirm("Вы подтверждаете выполнение работы? Заказ будет закрыт.")) return
    
    setLoading(true)
    const { error } = await supabase
      .from("jobs")
      .update({ status: 'completed' })
      .eq("id", jobId)

    if (error) {
      alert(error.message)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Button 
      onClick={handleComplete} 
      disabled={loading}
      className="bg-slate-900 hover:bg-black text-white"
    >
      <CheckCircle className="mr-2 h-4 w-4" />
      Завершить проект
    </Button>
  )
}