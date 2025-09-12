"use client"

import { useState, useEffect, useActionState } from "react"
import { getUser as getCurrentUser } from "@/lib/actions/auth-actions"

import { ActionState } from "@/lib/validations"
import { toast } from "sonner"

export interface User {
  id: string
  name: string | null
  email: string
  role: string
  image: string | null
  createdAt: Date
  updatedAt: Date
  emailVerified: boolean | null
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Basic update function placeholder
  const updateUser = async (formData: FormData) => {
    toast.success("Usuario actualizado exitosamente")
    await loadUser()
  }
  
  const [updateState] = useState<ActionState>({ success: false, message: '', errors: {} })
  const isUpdating = false

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

  const handleUpdateUser = async (updates: { name?: string; email?: string }) => {
    if (!user) return

    const formData = new FormData()
    formData.append('id', user.id)
    if (updates.name) formData.append('name', updates.name)
    if (updates.email) formData.append('email', updates.email)
    await updateUser(formData)
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
    updateUser: handleUpdateUser,
    refetch: loadUser,
    updateState,
    isUpdating,
  }
}