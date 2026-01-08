'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function CreateJobPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from("jobs")
      .insert({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        budget: Number(formData.get("budget")),
        category: formData.get("category") as string,
        client_id: user.id,
      })

    if (!error) {
      router.push("/dashboard")
      router.refresh()
    } else {
      alert("Ошибка: " + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Разместить новый заказ</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название задачи</Label>
              <Input id="title" name="title" placeholder="Например: Сдача квартальной отчетности" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Input id="category" name="category" placeholder="Налоги, ИП, ТОО..." required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Бюджет (₸)</Label>
              <Input id="budget" name="budget" type="number" placeholder="50000" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Подробное описание</Label>
              <Textarea id="description" name="description" placeholder="Опишите требования и сроки..." className="h-32" required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-blue-600" disabled={loading}>
              {loading ? "Публикация..." : "Опубликовать заказ"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}