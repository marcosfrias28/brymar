"use client"

import { useState, useActionState, useCallback, useTransition, useEffect } from "react"
import { getUser as getCurrentUser, updateUserAction, logoutAction } from "@/lib/actions/auth-actions"
import { toast } from "sonner"
import { authClient } from "@/lib/auth/auth-client"
import { useRouter } from "next/navigation"
import { BetterCallAPIError } from "@/utils/types/types"
import { User } from "@/lib/db/schema"
import { ActionState } from "@/lib/validations"

type UserState = {
  user: User | null
  loading: boolean
}

const initialUserState: UserState = {
  user: null,
  loading: true
}

export function useUser() {
  const [userState, setUserState] = useState<UserState>(initialUserState)
  const [_, startTransition] = useTransition()
  const router = useRouter()

  // Action state for user updates
  const [updateState, updateAction] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      return await updateUserAction(formData);
    },
    { success: false } as ActionState
  )

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

  // Handle update state changes
  useEffect(() => {
    if (updateState.success) {
      toast.success(updateState.message || 'Usuario actualizado exitosamente')
      loadUser() // Refresh user data
    } else if (updateState.error) {
      toast.error(updateState.error)
    }
  }, [updateState, loadUser])

  // Cargar usuario al montar el componente
  useEffect(() => {
    loadUser()
  }, [])

  return {
    user: userState.user,
    loading: userState.loading,
    signOut,
    updateUser: updateAction,
    updateState,
    isUpdating: updateState.success === undefined && Object.keys(updateState).length > 1,
    refetch: loadUser,
  }
}