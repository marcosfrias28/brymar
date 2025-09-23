'use client'

import { useState, useEffect, useActionState } from 'react'
import { getProperties, getPropertyById, addProperty, updateProperty, deleteProperty, searchProperties } from '@/lib/actions/property-actions'
import { toast } from 'sonner'
import { ActionState } from '@/lib/validations'

export interface Property {
  id: number
  title: string
  description: string
  price: number
  type: string
  bedrooms: number
  bathrooms: number
  area: number
  location: string
  status: 'sale' | 'rent'
  featured?: boolean
  images: string[]
  createdAt: Date
  updatedAt: Date | null
}

export interface UsePropertiesReturn {
  properties: Property[]
  loading: boolean
  error: string | null
  total: number
  totalPages: number
  currentPage: number
  fetchProperties: (page?: number, filters?: any) => Promise<void>
  searchPropertiesData: (query: string, page?: number) => Promise<void>
  createProperty: (formData: FormData) => void
  updatePropertyById: (id: number, formData: FormData) => void
  deletePropertyById: (id: number) => Promise<boolean>
  refreshProperties: () => Promise<void>
  // Action states for form submissions
  createState: ActionState
  updateState: ActionState
  isCreating: boolean
  isUpdating: boolean
}

export const useProperties = (initialPage = 1, initialFilters?: any): UsePropertiesReturn => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [filters, setFilters] = useState(initialFilters)

  // useActionState for form submissions
  const [createState, createAction] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      return await addProperty(formData);
    },
    { success: false } as ActionState
  )
  const [updateState, updateAction] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      return await updateProperty(formData);
    },
    { success: false } as ActionState
  )

  const isCreating = createState.success === undefined && Object.keys(createState).length > 1
  const isUpdating = updateState.success === undefined && Object.keys(updateState).length > 1

  const fetchProperties = async (page = currentPage, newFilters = filters) => {
    try {
      setLoading(true)
      setError(null)

      const result = await getProperties(page, 12, newFilters)

      setProperties(result.properties as Property[])
      setTotal(result.total)
      setTotalPages(result.totalPages)
      setCurrentPage(page)
      setFilters(newFilters)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar propiedades'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const searchPropertiesData = async (query: string, page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const result = await searchProperties(query, page, 12)

      setProperties(result.properties as Property[])
      setTotal(result.total)
      setTotalPages(result.totalPages)
      setCurrentPage(page)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al buscar propiedades'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createProperty = (formData: FormData) => {
    createAction(formData)
  }

  const updatePropertyById = (id: number, formData: FormData) => {
    formData.append('id', id.toString())
    updateAction(formData)
  }

  // Handle action state changes
  useEffect(() => {
    if (createState.success) {
      toast.success(createState.message || 'Propiedad creada exitosamente')
      refreshProperties()
    } else if (createState.error) {
      toast.error(createState.error)
    }
  }, [createState])

  useEffect(() => {
    if (updateState.success) {
      toast.success(updateState.message || 'Propiedad actualizada exitosamente')
      refreshProperties()
    } else if (updateState.error) {
      toast.error(updateState.error)
    }
  }, [updateState])

  const deletePropertyById = async (id: number): Promise<boolean> => {
    try {
      setError(null)
      const formData = new FormData()
      formData.append('id', id.toString())
      const result = await deleteProperty(formData)

      if (result.success) {
        toast.success(result.message || 'Propiedad eliminada exitosamente')
        await refreshProperties()
        return true
      } else {
        const errorMessage = result.error || 'Error al eliminar propiedad'
        setError(errorMessage)
        toast.error(errorMessage)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar propiedad'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    }
  }

  const refreshProperties = async () => {
    await fetchProperties(currentPage, filters)
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  return {
    properties,
    loading,
    error,
    total,
    totalPages,
    currentPage,
    fetchProperties,
    searchPropertiesData,
    createProperty,
    updatePropertyById,
    deletePropertyById,
    refreshProperties,
    createState,
    updateState,
    isCreating,
    isUpdating,
  }
}

export interface UsePropertyReturn {
  property: Property | null
  loading: boolean
  error: string | null
  fetchProperty: (id: number) => Promise<void>
  updateProperty: (formData: FormData) => void
  deleteProperty: () => Promise<boolean>
  updateState: ActionState
  isUpdating: boolean
}

export const useProperty = (id?: number): UsePropertyReturn => {
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<string | null>(null)

  // useActionState for form submissions
  const [updateState, updateAction] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      return await updateProperty(formData);
    },
    { success: false } as ActionState
  )
  const isUpdating = updateState.success === undefined && Object.keys(updateState).length > 1

  const fetchProperty = async (propertyId: number) => {
    try {
      setLoading(true)
      setError(null)

      const result = await getPropertyById(propertyId.toString())
      setProperty(result as Property)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar propiedad'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updatePropertyData = (formData: FormData) => {
    if (!property?.id) return
    formData.append('id', property.id.toString())
    updateAction(formData)
  }

  // Handle action state changes
  useEffect(() => {
    if (updateState.success) {
      toast.success(updateState.message || 'Propiedad actualizada exitosamente')
      if (property?.id) {
        fetchProperty(property.id)
      }
    } else if (updateState.error) {
      toast.error(updateState.error)
    }
  }, [updateState, property?.id])

  const deletePropertyData = async (): Promise<boolean> => {
    if (!property?.id) return false

    try {
      setError(null)
      const formData = new FormData()
      formData.append('id', property.id.toString())
      const result = await deleteProperty(formData)

      if (result.success) {
        toast.success(result.message || 'Propiedad eliminada exitosamente')
        return true
      } else {
        const errorMessage = result.error || 'Error al eliminar propiedad'
        setError(errorMessage)
        toast.error(errorMessage)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar propiedad'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    }
  }

  useEffect(() => {
    if (id) {
      fetchProperty(id)
    }
  }, [id])

  return {
    property,
    loading,
    error,
    fetchProperty,
    updateProperty: updatePropertyData,
    deleteProperty: deletePropertyData,
    updateState,
    isUpdating,
  }
}