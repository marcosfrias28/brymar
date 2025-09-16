"use server"

import { auth } from "../auth/auth"
import { headers } from "next/headers"
import { validatedAction } from "../validations"
import { z } from "zod"
import type { BetterCallAPIError } from "@/utils/types/types"

// Schema para crear organización
const createOrganizationSchema = z.object({
  name: z.string().min(3).max(100).describe("Organization name must be between 3-100 characters"),
  slug: z.string().min(3).max(50).describe("Organization slug must be between 3-50 characters"),
})

// Schema para invitar miembro
const inviteMemberSchema = z.object({
  email: z.string().email().describe("Valid email required"),
  role: z.enum(["admin", "agent", "viewer"]).describe("Valid role required"),
  organizationId: z.string().describe("Organization ID required"),
})

// Schema para actualizar rol de miembro
const updateMemberRoleSchema = z.object({
  memberId: z.string().describe("Member ID required"),
  role: z.enum(["admin", "agent", "viewer"]).describe("Valid role required"),
})

/**
 * Crear una nueva organización
 */
export const createOrganization = validatedAction(
  createOrganizationSchema,
  async (_, formData: FormData) => {
    const name = formData.get("name") as string
    const slug = formData.get("slug") as string

    if (!name || !slug) {
      return { error: "Name and slug are required" }
    }

    try {
      const result = await auth.api.createOrganization({
        method: "POST",
        headers: await headers(),
        body: {
          name,
          slug,
        },
      })

      return {
        success: true,
        message: "Organization created successfully",
        data: result,
      }
    } catch (error) {
      const Error = error as BetterCallAPIError
      return { error: Error?.body?.message || "Error creating organization" }
    }
  }
)

/**
 * Invitar un miembro a la organización
 */
export const inviteMember = validatedAction(
  inviteMemberSchema,
  async (_, formData: FormData) => {
    const email = formData.get("email") as string
    const role = formData.get("role") as string
    const organizationId = formData.get("organizationId") as string

    if (!email || !role || !organizationId) {
      return { error: "All fields are required" }
    }

    try {
      const result = await auth.api.inviteUser({
        method: "POST",
        headers: await headers(),
        body: {
          email,
          role,
          organizationId,
        },
      })

      return {
        success: true,
        message: "Invitation sent successfully",
        data: result,
      }
    } catch (error) {
      const Error = error as BetterCallAPIError
      return { error: Error?.body?.message || "Error sending invitation" }
    }
  }
)

/**
 * Obtener organizaciones del usuario actual
 */
export const getUserOrganizations = async () => {
  try {
    const result = await auth.api.listUserOrganizations({
      headers: await headers(),
    })

    return result
  } catch (error) {
    console.error("Error fetching user organizations:", error)
    return null
  }
}

/**
 * Obtener miembros de una organización
 */
export const getOrganizationMembers = async (organizationId: string) => {
  try {
    const result = await auth.api.listOrganizationMembers({
      headers: await headers(),
      query: {
        organizationId,
      },
    })

    return result
  } catch (error) {
    console.error("Error fetching organization members:", error)
    return null
  }
}

/**
 * Actualizar rol de un miembro
 */
export const updateMemberRole = validatedAction(
  updateMemberRoleSchema,
  async (_, formData: FormData) => {
    const memberId = formData.get("memberId") as string
    const role = formData.get("role") as string

    if (!memberId || !role) {
      return { error: "Member ID and role are required" }
    }

    try {
      const result = await auth.api.updateMemberRole({
        method: "PATCH",
        headers: await headers(),
        body: {
          memberId,
          role,
        },
      })

      return {
        success: true,
        message: "Member role updated successfully",
        data: result,
      }
    } catch (error) {
      const Error = error as BetterCallAPIError
      return { error: Error?.body?.message || "Error updating member role" }
    }
  }
)

/**
 * Remover miembro de la organización
 */
export const removeMember = async (memberId: string) => {
  try {
    const result = await auth.api.removeMember({
      method: "DELETE",
      headers: await headers(),
      body: {
        memberId,
      },
    })

    return {
      success: true,
      message: "Member removed successfully",
      data: result,
    }
  } catch (error) {
    const Error = error as BetterCallAPIError
    return { error: Error?.body?.message || "Error removing member" }
  }
}

/**
 * Obtener rol del usuario en una organización específica
 */
export const getUserRoleInOrganization = async (organizationId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return null
    }

    const organizations = await getUserOrganizations()
    if (!organizations) {
      return null
    }

    const userOrg = organizations.find((org: any) => org.id === organizationId)
    return userOrg?.role || null
  } catch (error) {
    console.error("Error getting user role in organization:", error)
    return null
  }
}