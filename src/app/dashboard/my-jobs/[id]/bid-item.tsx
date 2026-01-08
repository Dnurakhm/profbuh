'use client'

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Star, Check, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function BidItem({ bid, jobId }: { bid: any, jobId: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleAccept = async () => {
    if (!confirm(`Вы действительно хотите выбрать ${bid.profiles.full_name} исполнителем?`)) return
    
    setLoading(true)
    
    // Обновляем заказ: меняем статус и назначаем бухгалтера
    const { error } = await supabase
      .from("jobs")
      .update({ 
        status: 'in_progress',
        accountant_id: bid.accountant_id 
      })
      .eq("id", jobId)

    if (error) {
      alert("Ошибка: " + error.message)
      setLoading(false)
    } else {
      router.refresh() // Обновляем данные на странице
    }
  }

return (
    <Card className="border-slate-200 hover:border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md">
      <CardHeader className="flex flex-row items-center gap-4">
        {/* Кликабельный аватар */}
        <Link 
          href={`/profile/${bid.accountant_id}`}
          className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white uppercase shadow-lg shadow-blue-100 shrink-0 hover:scale-105 transition-transform"
        >
          {bid.profiles?.full_name?.[0]}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
              <Link 
                href={`/profile/${bid.accountant_id}`}
                className="group flex items-center gap-2"
              >
                <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-600 group-hover:underline transition-all truncate">
                  {bid.profiles?.full_name}
                </CardTitle>
                <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-blue-600 shrink-0" />
              </Link>
              
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center text-amber-600 text-sm font-black bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                  <Star className="h-3.5 w-3.5 fill-amber-500 mr-1.5" />
                  {bid.profiles?.rating_avg ? bid.profiles.rating_avg.toFixed(1) : '0.0'}
                </div>
                <div className="flex items-center text-xs text-slate-400 font-medium">
                  <span className="w-1 h-1 bg-slate-300 rounded-full mr-2" />
                  {bid.profiles?.reviews_count || 0} отзывов
                </div>
              </div>
            </div>

            <Button 
              onClick={handleAccept} 
              disabled={loading}
              size="sm" 
              className="bg-green-600 hover:bg-green-700 shadow-sm px-6 h-9 rounded-xl font-bold transition-all active:scale-95"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Жду...
                </span>
              ) : (
                <span className="flex items-center"><Check className="mr-2 h-4 w-4" /> Выбрать</span>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative mt-2">
          <div className="absolute -top-2 left-4 bg-white px-2 text-[10px] text-blue-500 font-black uppercase tracking-widest z-10">
            Сопроводительное письмо
          </div>
          <div className="text-slate-600 italic bg-slate-50/80 p-5 rounded-2xl text-sm border border-slate-100 leading-relaxed">
            "{bid.content}"
          </div>
        </div>
      </CardContent>
    </Card>
  )
}