"use client"

import { useState, useActionState, useCallback, useTransition, useEffect } from "react"
import { getUser as getCurrentUser, updateUserAction } from "@/app/actions/auth-actions"
import { toast } from "sonner"
import { authClient } from "@/lib/auth/auth-client"
import { useRouter } from "next/navigation"
import { BetterCallAPIError } from "@/utils/types/types"
import { User } from "@/lib/db/schema"

type UserState = {
  user: User | null
  loading: boolean
}

type UpdateUserState = {
  success: boolean
  error: string | null
}

const initialUserState: UserState = {
  user: null,
  loading: true
}

export function useUser() {
  const [userState, setUserState] = useState<UserState>(initialUserState)
  const [_, startTransition] = useTransition()
  const router = useRouter()

  const loadUser = useCallback(async () => {
    setUserState(prev => ({ ...prev, loading: true }))
    try {
      const userData = await getCurrentUser()
      setUserState({ user: userData, loading: false })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar el usuario"
      toast.error(errorMessage)
      setUserState({ user: null, loading: false })
    }
  }, [])

  const signOut = useCallback(async () => {
    startTransition(async () => {
      try {
        await authClient.signOut()
        setUserState({ user: null, loading: false })
        toast.success('Sesión cerrada exitosamente')
        router.refresh()
      } catch (error) {
         const errorMessage = (error as BetterCallAPIError)?.body?.message || "Error cerrando sesión"
         toast.error(errorMessage)
       }
    })
  }, [router])

  // Cargar usuario al montar el componente
  useEffect(() => {
    loadUser()
  }, [])

  return {
    user: userState.user,
    loading: userState.loading,
    signOut,
    updateUser: updateUserAction,
    refetch: loadUser,
  }
}