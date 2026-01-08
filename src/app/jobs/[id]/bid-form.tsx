'use client'

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SendHorizontal, Loader2, CheckCircle } from "lucide-react"

export default function BidForm({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState("")
  const supabase = createClient()

  const submitBid = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from("bids")
      .insert({
        job_id: jobId,
        accountant_id: user?.id,
        content: message,
      })

    if (error) {
      alert("Ошибка: " + error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-green-50 rounded-xl border border-green-100 text-center animate-in fade-in zoom-in duration-300">
        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
        <h4 className="text-lg font-bold text-green-900">Отклик отправлен!</h4>
        <p className="text-green-700 text-sm">Заказчик получит уведомление и свяжется с вами, если ваше предложение его заинтересует.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submitBid} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content" className="text-slate-700 font-medium">Текст вашего предложения</Label>
        <Textarea 
          id="content" 
          placeholder="Напишите, почему вы подходите для этой задачи, какой у вас опыт и когда готовы приступить..." 
          required
          className="min-h-[150px] focus-visible:ring-blue-600 border-slate-200"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-semibold shadow-lg shadow-blue-100" disabled={loading}>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Отправить отклик <SendHorizontal className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
    </form>
  )
}