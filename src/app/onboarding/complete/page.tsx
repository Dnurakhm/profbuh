'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function CompleteProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)
  
  // Состояния для формы
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [specs, setSpecs] = useState("") // Для бухгалтеров (через запятую)

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (data) setRole(data.role)
      setLoading(false)
    }
    getProfile()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        bio: bio,
        specializations: specs ? specs.split(",").map(s => s.trim()) : [],
      })
      .eq("id", user?.id)

    if (!error) {
      router.push("/dashboard") // Временный редирект на будущее
    } else {
      alert("Ошибка при сохранении")
      setLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center p-10">Загрузка...</div>

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Заполнение профиля</CardTitle>
          <CardDescription>
            {role === 'accountant' 
              ? "Расскажите заказчикам о своем опыте" 
              : "Представьтесь, чтобы бухгалтеры знали, с кем работают"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">ФИО / Название компании</Label>
              <Input 
                id="name" 
                placeholder="Иван Иванов" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">О себе</Label>
              <Textarea 
                id="bio" 
                placeholder="Краткое описание..." 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {role === 'accountant' && (
              <div className="space-y-2">
                <Label htmlFor="specs">Специализации (через запятую)</Label>
                <Input 
                  id="specs" 
                  placeholder="Налоги, Аудит, 1С" 
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-blue-600">
              Сохранить и продолжить
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}