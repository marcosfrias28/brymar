/**
 * Client API per interagire con Payload CMS
 * Sostituisce le server actions esistenti
 */

const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export class PayloadAPIClient {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}/api${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Properties API
  static async getProperties(params?: {
    limit?: number
    page?: number
    where?: any
    sort?: string
  }) {
    const searchParams = new URLSearchParams()
    
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.where) searchParams.set('where', JSON.stringify(params.where))
    if (params?.sort) searchParams.set('sort', params.sort)

    return this.request(`/properties?${searchParams.toString()}`)
  }

  static async getProperty(id: string) {
    return this.request(`/properties/${id}`)
  }

  static async createProperty(data: any) {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  static async updateProperty(id: string, data: any) {
    return this.request(`/properties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  static async deleteProperty(id: string) {
    return this.request(`/properties/${id}`, {
      method: 'DELETE',
    })
  }

  // Blog Posts API
  static async getBlogPosts(params?: {
    limit?: number
    page?: number
    where?: any
    sort?: string
  }) {
    const searchParams = new URLSearchParams()
    
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.where) searchParams.set('where', JSON.stringify(params.where))
    if (params?.sort) searchParams.set('sort', params.sort)

    return this.request(`/blog-posts?${searchParams.toString()}`)
  }

  static async getBlogPost(id: string) {
    return this.request(`/blog-posts/${id}`)
  }

  static async createBlogPost(data: any) {
    return this.request('/blog-posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  static async updateBlogPost(id: string, data: any) {
    return this.request(`/blog-posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  static async deleteBlogPost(id: string) {
    return this.request(`/blog-posts/${id}`, {
      method: 'DELETE',
    })
  }

  // Lands API
  static async getLands(params?: {
    limit?: number
    page?: number
    where?: any
    sort?: string
  }) {
    const searchParams = new URLSearchParams()
    
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.where) searchParams.set('where', JSON.stringify(params.where))
    if (params?.sort) searchParams.set('sort', params.sort)

    return this.request(`/lands?${searchParams.toString()}`)
  }

  static async getLand(id: string) {
    return this.request(`/lands/${id}`)
  }

  static async createLand(data: any) {
    return this.request('/lands', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  static async updateLand(id: string, data: any) {
    return this.request(`/lands/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  static async deleteLand(id: string) {
    return this.request(`/lands/${id}`, {
      method: 'DELETE',
    })
  }

  // Reviews API
  static async getReviews(params?: {
    limit?: number
    page?: number
    where?: any
    sort?: string
  }) {
    const searchParams = new URLSearchParams()
    
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.where) searchParams.set('where', JSON.stringify(params.where))
    if (params?.sort) searchParams.set('sort', params.sort)

    return this.request(`/reviews?${searchParams.toString()}`)
  }

  static async createReview(data: any) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Media API
  static async uploadMedia(file: File, additionalData?: any) {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key])
      })
    }

    const response = await fetch(`${API_BASE}/api/media`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Search API
  static async searchProperties(query: {
    city?: string
    type?: string
    minPrice?: number
    maxPrice?: number
    bedrooms?: number
    bathrooms?: number
    propertyType?: string
  }) {
    const where: any = { status: { equals: 'available' } }

    if (query.city) {
      where['location.city'] = { equals: query.city }
    }
    if (query.type) {
      where.type = { equals: query.type }
    }
    if (query.propertyType) {
      where.propertyType = { equals: query.propertyType }
    }
    if (query.minPrice) {
      where.price = { ...where.price, greater_than_equal: query.minPrice }
    }
    if (query.maxPrice) {
      where.price = { ...where.price, less_than_equal: query.maxPrice }
    }
    if (query.bedrooms) {
      where.bedrooms = { greater_than_equal: query.bedrooms }
    }
    if (query.bathrooms) {
      where.bathrooms = { greater_than_equal: query.bathrooms }
    }

    return this.getProperties({ where, sort: '-createdAt' })
  }

  // Featured content
  static async getFeaturedProperties(limit = 6) {
    return this.getProperties({
      where: { featured: { equals: true }, status: { equals: 'available' } },
      limit,
      sort: '-createdAt'
    })
  }

  static async getFeaturedBlogPosts(limit = 3) {
    return this.getBlogPosts({
      where: { featured: { equals: true }, status: { equals: 'published' } },
      limit,
      sort: '-publishedDate'
    })
  }

  static async getApprovedReviews(limit = 10) {
    return this.getReviews({
      where: { status: { equals: 'approved' } },
      limit,
      sort: '-createdAt'
    })
  }
}

// Hook personalizzati per React
export function useProperties(params?: Parameters<typeof PayloadAPIClient.getProperties>[0]) {
  // Implementazione con SWR o React Query se necessario
  // Per ora ritorna una funzione base
  return {
    data: null,
    error: null,
    isLoading: false,
    mutate: () => PayloadAPIClient.getProperties(params)
  }
}

export function useBlogPosts(params?: Parameters<typeof PayloadAPIClient.getBlogPosts>[0]) {
  return {
    data: null,
    error: null,
    isLoading: false,
    mutate: () => PayloadAPIClient.getBlogPosts(params)
  }
}