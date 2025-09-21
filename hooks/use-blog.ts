'use client'

import { useState, useEffect, useActionState } from 'react'
import { getBlogPosts, getBlogPostByIdDirect, addBlogPost, updateBlogPost, deleteBlogPostById } from '@/app/actions/blog-actions'
import { toast } from 'sonner'
import { ActionState } from '@/lib/validations'

export interface BlogPost {
  id: number
  title: string
  content: string
  author: string
  category: string
  status: string
  image: string | null
  readingTime: number
  createdAt: Date
  updatedAt: Date | null
}

export interface UseBlogPostsReturn {
  blogPosts: BlogPost[]
  loading: boolean
  error: string | null
  total: number
  totalPages: number
  currentPage: number
  fetchBlogPosts: (page?: number, filters?: any) => Promise<void>
  createBlogPost: (formData: FormData) => void
  updateBlogPostById: (id: string, formData: FormData) => void
  deleteBlogPostById: (id: string) => Promise<boolean>
  refreshBlogPosts: () => Promise<void>
  // Action states for form submissions
  createState: ActionState<{ blogPost: BlogPost }>
  updateState: ActionState<{ blogPost: BlogPost }>
  isCreating: boolean
  isUpdating: boolean
}

export const useBlogPosts = (initialPage = 1, initialFilters?: any): UseBlogPostsReturn => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [filters, setFilters] = useState(initialFilters)

  // Action states for form submissions
  const [createState, createAction] = useActionState(
    async (prevState: ActionState<{ blogPost: BlogPost }>, formData: FormData) => {
      return await addBlogPost(formData);
    },
    { success: false, message: '' } as ActionState<{ blogPost: BlogPost }>
  )
  const [updateState, updateAction] = useActionState(
    async (prevState: ActionState<{ blogPost: BlogPost }>, formData: FormData) => {
      return await updateBlogPost(formData);
    },
    { success: false, message: '' } as ActionState<{ blogPost: BlogPost }>
  )
  
  const isCreating = createState.success === undefined && Object.keys(createState).length > 1
  const isUpdating = updateState.success === undefined && Object.keys(updateState).length > 1

  const fetchBlogPosts = async (page = currentPage, newFilters = filters) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await getBlogPosts(page, 12, newFilters)
      
      setBlogPosts(result.blogPosts as BlogPost[])
      setTotal(result.total)
      setTotalPages(result.totalPages)
      setCurrentPage(page)
      setFilters(newFilters)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar posts'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createBlogPost = (formData: FormData): void => {
    createAction(formData)
  }

  const updateBlogPostById = (id: string, formData: FormData): void => {
    formData.append('id', id)
    updateAction(formData)
  }

  // Handle action state changes
  useEffect(() => {
    if (createState.success) {
      toast.success(createState.message || 'Post creado exitosamente')
      refreshBlogPosts()
    } else if (createState.error) {
      toast.error(createState.error)
      setError(createState.error)
    }
  }, [createState])

  useEffect(() => {
    if (updateState.success) {
      toast.success(updateState.message || 'Post actualizado exitosamente')
      refreshBlogPosts()
    } else if (updateState.error) {
      toast.error(updateState.error)
      setError(updateState.error)
    }
  }, [updateState])

  const deleteBlogPostByIdAction = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      const result = await deleteBlogPostById(id)
      
      if (result.success) {
        toast.success(result.message || 'Post eliminado exitosamente')
        await refreshBlogPosts()
        return true
      } else {
        const errorMessage = result.error || 'Error al eliminar post'
        setError(errorMessage)
        toast.error(errorMessage)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar post'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    }
  }

  const refreshBlogPosts = async () => {
    await fetchBlogPosts(currentPage, filters)
  }

  useEffect(() => {
    fetchBlogPosts()
  }, [])

  return {
    blogPosts,
    loading,
    error,
    total,
    totalPages,
    currentPage,
    fetchBlogPosts,
    createBlogPost,
    updateBlogPostById,
    deleteBlogPostById: deleteBlogPostByIdAction,
    refreshBlogPosts,
    createState,
    updateState,
    isCreating,
    isUpdating,
  }
}

export interface UseBlogPostReturn {
  blogPost: BlogPost | null
  loading: boolean
  error: string | null
  fetchBlogPost: (id: string) => Promise<void>
  updateBlogPost: (formData: FormData) => void
  deleteBlogPost: () => Promise<boolean>
  updateState: ActionState<{ blogPost: BlogPost }>
  isUpdating: boolean
}

export const useBlogPost = (id?: string): UseBlogPostReturn => {
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<string | null>(null)

  // Action state for form submissions
  const [updateState, updateAction] = useActionState(
    async (prevState: ActionState<{ blogPost: BlogPost }>, formData: FormData) => {
      return await updateBlogPost(formData);
    },
    { success: false, message: '' } as ActionState<{ blogPost: BlogPost }>
  )
  const isUpdating = updateState.success === undefined && Object.keys(updateState).length > 1

  const fetchBlogPost = async (postId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await getBlogPostByIdDirect(postId)
      setBlogPost(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar post'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateBlogPostData = (formData: FormData) => {
    if (!blogPost?.id) return
    formData.append('id', blogPost.id.toString())
    updateAction(formData)
  }

  // Handle update state changes
  useEffect(() => {
    if (updateState.success) {
      toast.success(updateState.message || 'Post actualizado exitosamente')
      if (blogPost?.id) {
        fetchBlogPost(blogPost.id.toString())
      }
    } else if (updateState.error) {
      setError(updateState.error)
      toast.error(updateState.error)
    }
  }, [updateState, blogPost?.id])

  const deleteBlogPostData = async (): Promise<boolean> => {
    if (!blogPost?.id) return false
    
    try {
      setError(null)
      const result = await deleteBlogPostById(blogPost.id.toString())
      
      if (result.success) {
        toast.success(result.message || 'Post eliminado exitosamente')
        return true
      } else {
        const errorMessage = result.error || 'Error al eliminar post'
        setError(errorMessage)
        toast.error(errorMessage)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar post'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    }
  }

  useEffect(() => {
    if (id) {
      fetchBlogPost(id)
    }
  }, [id])

  return {
    blogPost,
    loading,
    error,
    fetchBlogPost,
    updateBlogPost: updateBlogPostData,
    deleteBlogPost: deleteBlogPostData,
    updateState,
    isUpdating
  }
}