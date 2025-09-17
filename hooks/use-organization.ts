"use client"

import { useState, useEffect } from "react"
import { getUserWithOrganizations } from "@/lib/actions/auth-actions"
import {
  getUserOrganizations,
  getOrganizationMembers,
  getUserRoleInOrganization,
} from "@/lib/actions/organization-actions"

export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface Member {
  id: string
  userId: string
  organizationId: string
  role: string
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface UserWithOrganizations {
  id: string
  name: string | null
  email: string
  role: string
  image: string | null
  organizations: Organization[]
  createdAt: Date
  updatedAt: Date
  emailVerified: boolean | null
}

/**
 * Hook para gestionar organizaciones del usuario
 */
export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getUserOrganizations()
      if (result) {
        setOrganizations(result as Organization[])
      }
    } catch (err) {
      setError("Error fetching organizations")
      console.error("Error fetching organizations:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizations()
  }, [])

  return {
    organizations,
    loading,
    error,
    refetch: fetchOrganizations,
  }
}

/**
 * Hook para gestionar miembros de una organización
 */
export function useOrganizationMembers(organizationId: string) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = async () => {
    if (!organizationId) return

    try {
      setLoading(true)
      setError(null)
      const result = await getOrganizationMembers(organizationId)
      if (result && result.members) {
        setMembers(result.members as Member[])
      }
    } catch (err) {
      setError("Error fetching members")
      console.error("Error fetching members:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [organizationId])

  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
  }
}

/**
 * Hook para obtener el rol del usuario en una organización específica
 */
export function useUserRoleInOrganization(organizationId: string) {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRole = async () => {
    if (!organizationId) return

    try {
      setLoading(true)
      setError(null)
      const userRole = await getUserRoleInOrganization(organizationId)
      setRole(userRole)
    } catch (err) {
      setError("Error fetching user role")
      console.error("Error fetching user role:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRole()
  }, [organizationId])

  return {
    role,
    loading,
    error,
    refetch: fetchRole,
  }
}

/**
 * Hook para obtener usuario con organizaciones
 */
export function useUserWithOrganizations() {
  const [user, setUser] = useState<UserWithOrganizations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getUserWithOrganizations()
      setUser(result as UserWithOrganizations)
    } catch (err) {
      setError("Error fetching user with organizations")
      console.error("Error fetching user with organizations:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  }
}

/**
 * Utilidad para verificar si el usuario tiene un rol específico en una organización
 */
export function hasRoleInOrganization(
  organizations: Organization[],
  organizationId: string,
  requiredRole: string | string[]
): boolean {
  const org = organizations.find((o) => o.id === organizationId)
  if (!org) return false

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(org.role)
  }

  return org.role === requiredRole
}

/**
 * Utilidad para verificar si el usuario es admin en alguna organización
 */
export function isAdminInAnyOrganization(organizations: Organization[]): boolean {
  return organizations.some((org) => org.role === "admin")
}

/**
 * Utilidad para obtener la organización principal del usuario (primera como admin, o primera disponible)
 */
export function getPrimaryOrganization(organizations: Organization[]): Organization | null {
  if (organizations.length === 0) return null

  // Buscar primera organización donde es admin
  const adminOrg = organizations.find((org) => org.role === "admin")
  if (adminOrg) return adminOrg

  // Si no es admin en ninguna, devolver la primera
  return organizations[0]
}