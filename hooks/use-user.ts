"use client"

import { useState, useEffect, useActionState } from "react"
import { getCurrentUser, updateUser as updateUserAction } from "@/lib/actions/user-actions"
import { ActionState } from "@/lib/validations"
import { toast } from "sonner"

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "agent" | "viewer"
  image?: string
  createdAt: string
  permissions: {
    canCreateProperties: boolean
    canEditProperties: boolean
    canDeleteProperties: boolean
    canManageUsers: boolean
    canViewAnalytics: boolean
    canManageBlog: boolean
  }
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Action state for form submissions
  const [updateState, updateAction] = useActionState(updateUserAction, { success: false, message: '', errors: {} })
  const isUpdating = updateState.success === false && Object.keys(updateState.errors || {}).length === 0 && updateState.message === ''

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const userData = await getCurrentUser()
      setUser(userData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el usuario")
    } finally {
      setLoading(false)
    }
  }

  const updateUser = (updates: { name?: string; email?: string }) => {
    if (!user) return

    const formData = new FormData()
    formData.append('id', user.id)
    if (updates.name) formData.append('name', updates.name)
    if (updates.email) formData.append('email', updates.email)
    updateAction(formData)
  }

  // Handle update state changes
  useEffect(() => {
    if (updateState.success) {
      toast.success(updateState.message || 'Usuario actualizado exitosamente')
      loadUser() // Refresh user data
    } else if (updateState.message && !updateState.success) {
      setError(updateState.message)
      toast.error(updateState.message)
    }
  }, [updateState])

  return {
    user,
    loading,
    error,
    updateUser,
    refetch: loadUser,
    updateState,
    isUpdating,
  }
}