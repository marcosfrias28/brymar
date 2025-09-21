'use client'

import { useState, useEffect, useActionState } from 'react'
import { getLands, getLandById, addLand, updateLand, deleteLandById as deleteLandAction } from '@/app/actions/land-actions'
import { toast } from 'sonner'
import { ActionState } from '@/lib/validations'

export interface Land {
  id: number
  name: string
  description: string
  area: number
  price: number
  location: string
  type: string
  images: string[]
  createdAt: Date
  updatedAt: Date | null
}

export interface UseLandsReturn {
  lands: Land[]
  loading: boolean
  error: string | null
  total: number
  totalPages: number
  currentPage: number
  fetchLands: (page?: number, filters?: any) => Promise<void>
  createLand: (formData: FormData) => void
  updateLandById: (id: number, formData: FormData) => void
  deleteLandById: (id: number) => Promise<boolean>
  refreshLands: () => Promise<void>
  // Action states for form submissions
  createState: ActionState
  updateState: ActionState
  isCreating: boolean
  isUpdating: boolean
}

export const useLands = (initialPage = 1, initialFilters?: any): UseLandsReturn => {
  const [lands, setLands] = useState<Land[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [filters, setFilters] = useState(initialFilters)

  // Action states for form submissions
  const [createState, createAction] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      return await addLand(formData);
    },
    { success: false, message: '' } as ActionState
  )
  const [updateState, updateAction] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      return await updateLand(formData);
    },
    { success: false, message: '' } as ActionState
  )
  
  const isCreating = createState.success === undefined && Object.keys(createState).length > 1
  const isUpdating = updateState.success === undefined && Object.keys(updateState).length > 1

  const fetchLands = async (page = currentPage, newFilters = filters) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await getLands(page, 12, newFilters)
      
      setLands(result.lands as Land[])
      setTotal(result.total)
      setTotalPages(result.totalPages)
      setCurrentPage(page)
      setFilters(newFilters)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar terrenos'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createLand = (formData: FormData): void => {
    createAction(formData)
  }

  const updateLandById = (id: number, formData: FormData): void => {
    formData.append('id', id.toString())
    updateAction(formData)
  }

  // Handle action state changes
  useEffect(() => {
    if (createState.success) {
      toast.success(createState.message || 'Terreno creado exitosamente')
      refreshLands()
    } else if (createState.error) {
      toast.error(createState.error)
      setError(createState.error)
    }
  }, [createState])

  useEffect(() => {
    if (updateState.success) {
      toast.success(updateState.message || 'Terreno actualizado exitosamente')
      refreshLands()
    } else if (updateState.error) {
      toast.error(updateState.error)
      setError(updateState.error)
    }
  }, [updateState])

  const deleteLandById = async (id: number): Promise<boolean> => {
    try {
      setError(null)
      const result = await deleteLandAction(id.toString())
      
      if (result.success) {
        toast.success(result.message || 'Terreno eliminado exitosamente')
        await refreshLands()
        return true
      } else {
        const errorMessage = result.error || 'Error al eliminar terreno'
        setError(errorMessage)
        toast.error(errorMessage)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar terreno'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    }
  }

  const refreshLands = async () => {
    await fetchLands(currentPage, filters)
  }

  useEffect(() => {
    fetchLands()
  }, [])

  return {
    lands,
    loading,
    error,
    total,
    totalPages,
    currentPage,
    fetchLands,
    createLand,
    updateLandById,
    deleteLandById,
    refreshLands,
    createState,
    updateState,
    isCreating,
    isUpdating,
  }
}

export interface UseLandReturn {
  land: Land | null
  loading: boolean
  isLoading: boolean
  error: string | null
  fetchLand: (id: number) => Promise<void>
  updateLand: (formData: FormData) => void
  deleteLand: () => Promise<boolean>
  updateState: ActionState
  isUpdating: boolean
}

export const useLand = (id?: number): UseLandReturn => {
  const [land, setLand] = useState<Land | null>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<string | null>(null)

  // Action state for form submissions
  const [updateState, updateAction] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      return await updateLand(formData);
    },
    { success: false, message: '' } as ActionState
  )
  const isUpdating = updateState.success === undefined && Object.keys(updateState).length > 1

  const fetchLand = async (landId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await getLandById(landId.toString())
      setLand(result as Land)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar terreno'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateLandData = (formData: FormData): void => {
    if (!land?.id) return
    formData.append('id', land.id.toString())
    updateAction(formData)
  }

  // Handle action state changes
  useEffect(() => {
    if (updateState.success && land?.id) {
      toast.success(updateState.message || 'Terreno actualizado exitosamente')
      fetchLand(land.id)
    } else if (updateState.error) {
      toast.error(updateState.error)
      setError(updateState.error)
    }
  }, [updateState, land?.id])

  const deleteLandData = async (): Promise<boolean> => {
    if (!land?.id) return false
    
    try {
      setError(null)
      const result = await deleteLandAction(land.id.toString())
      
      if (result.success) {
        toast.success(result.message || 'Terreno eliminado exitosamente')
        return true
      } else {
        const errorMessage = result.error || 'Error al eliminar terreno'
        setError(errorMessage)
        toast.error(errorMessage)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar terreno'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    }
  }

  useEffect(() => {
    if (id) {
      fetchLand(id)
    }
  }, [id])

  return {
    land,
    loading,
    isLoading: loading,
    error,
    fetchLand,
    updateLand: updateLandData,
    deleteLand: deleteLandData,
    updateState,
    isUpdating,
  }
}