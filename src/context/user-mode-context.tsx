'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

type UserMode = 'client' | 'specialist'

interface UserModeContextType {
  mode: UserMode
  toggleMode: () => void
  setMode: (mode: UserMode) => void
  isLoading: boolean
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined)

export function UserModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<UserMode>('client')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const initMode = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Получаем роль пользователя из профиля, чтобы установить начальный режим
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
            
          if (profile?.role === 'accountant') {
            setMode('specialist')
          } else {
            setMode('client')
          }
        }
      } catch (e) {
        console.error('Failed to init mode', e)
      } finally {
        setIsLoading(false)
      }
    }

    initMode()
  }, [])

  const toggleMode = () => {
    setMode((prev) => (prev === 'client' ? 'specialist' : 'client'))
  }

  return (
    <UserModeContext.Provider value={{ mode, toggleMode, setMode, isLoading }}>
      {children}
    </UserModeContext.Provider>
  )
}

export function useUserMode() {
  const context = useContext(UserModeContext)
  if (context === undefined) {
    throw new Error('useUserMode must be used within a UserModeProvider')
  }
  return context
}
