'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { User, Briefcase, FileText, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    full_name: "",
    specialization: "",
    bio: ""
  })

  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, specialization, bio")
          .eq("id", user.id)
          .single()
        
        if (data) setProfile(data)
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        specialization: profile.specialization,
        bio: profile.bio
      })
      .eq("id", user?.id)

    if (error) {
      alert("Ошибка при сохранении: " + error.message)
    } else {
      alert("Профиль успешно обновлен!")
    }
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Настройки профиля</h1>
      
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" /> Основная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Ваше имя</label>
            <Input 
              value={profile.full_name} 
              onChange={(e) => setProfile({...profile, full_name: e.target.value})}
              placeholder="Иван Иванов"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Специализация
            </label>
            <Input 
              value={profile.specialization} 
              onChange={(e) => setProfile({...profile, specialization: e.target.value})}
              placeholder="Бухгалтер для ИП, налоговый консультант"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4" /> О себе
            </label>
            <Textarea 
              rows={6}
              value={profile.bio || ""} 
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              placeholder="Расскажите о своем опыте, навыках и с какими компаниями вы работали..."
              className="resize-none"
            />
            <p className="text-[11px] text-slate-400 italic">Этот текст увидят заказчики на странице вашего профиля.</p>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 h-11"
          >
            {saving ? <Loader2 className="animate-spin mr-2" /> : null}
            Сохранить изменения
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}