'use client'

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ReviewForm({ 
  jobId, 
  clientId, 
  accountantId 
}: { 
  jobId: string, 
  clientId: string, 
  accountantId: string 
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()
  const router = useRouter()

const handleSubmit = async () => {
  if (rating === 0) return alert("Пожалуйста, выберите оценку")
  setLoading(true)

  const { error } = await supabase
    .from('reviews')
    .insert({
      job_id: jobId,
      client_id: clientId,
      accountant_id: accountantId,
      rating,
      comment
    })

  if (error) {
    // Вместо обычного алерта проверяем на дубликат
    if (error.code === '23505') {
      alert("Вы уже оставили отзыв для этого заказа")
    } else {
      alert(error.message)
    }
  } else {
    setSubmitted(true)
    // Ждем секунду и обновляем данные на странице
    setTimeout(() => {
      router.refresh()
    }, 500)
  }
  setLoading(false)
}

  if (submitted) return (
    <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
      <p className="text-green-700 font-bold">Спасибо за отзыв!</p>
    </div>
  )

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="font-bold text-slate-900 text-lg">Оцените работу специалиста</h3>
      
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className="focus:outline-none transition-transform active:scale-90"
          >
            <Star 
              className={`h-8 w-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
            />
          </button>
        ))}
      </div>

      <Textarea 
        placeholder="Напишите краткий отзыв о сотрудничестве..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[100px]"
      />

      <Button 
        onClick={handleSubmit} 
        disabled={loading || rating === 0}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {loading ? "Отправка..." : "Оставить отзыв"}
      </Button>
    </div>
  )
}