"use server"

import { auth } from "../auth/auth"
import { headers } from "next/headers"
import { createValidatedAction, createErrorResponse, createSuccessResponse } from "../validations"
import { z } from "zod"

// Schema para crear organización
const createOrganizationSchema = z.object({
  name: z.string().min(3).max(100).describe("Organization name must be between 3-100 characters"),
  slug: z.string().min(3).max(50).describe("Organization slug must be between 3-50 characters"),
})

// Schema para invitar miembro
const inviteMemberSchema = z.object({
  email: z.string().email().describe("Valid email address required"),
  role: z.enum(["admin", "agent", "user"]).describe("Role must be admin, agent, or user"),
  organizationId: z.string().min(1).describe("Organization ID is required"),
})

// Schema para actualizar rol de miembro
const updateMemberRoleSchema = z.object({
  memberId: z.string().min(1).describe("Member ID is required"),
  role: z.enum(["admin", "agent", "user"]).describe("Role must be admin, agent, or user"),
  organizationId: z.string().min(1).describe("Organization ID is required"),
})

/**
 * Crear una nueva organización
 * Simplificado por ahora - en el futuro se puede integrar con Better Auth
 */
export const createOrganization = createValidatedAction(
  createOrganizationSchema,
  async (data, user) => {
    const { name, slug } = data

    if (!user) {
      return createErrorResponse("Usuario no autenticado");
    }

    // Por ahora, simplemente retornamos éxito
    // En el futuro se puede integrar con Better Auth o una base de datos
    return createSuccessResponse(
      { id: crypto.randomUUID(), name, slug },
      "Organización creada exitosamente"
    );
  }
)

/**
 * Invitar un miembro a la organización
 * Simplificado por ahora
 */
export const inviteMember = createValidatedAction(
  inviteMemberSchema,
  async (data, user) => {
    const { email, role, organizationId } = data

    if (!user) {
      return createErrorResponse("Usuario no autenticado");
    }

    // Por ahora, simplemente retornamos éxito
    // En el futuro se puede integrar con Better Auth
    return createSuccessResponse(
      { email, role, organizationId },
      "Invitación enviada exitosamente"
    );
  }
)

/**
 * Actualizar rol de un miembro
 * Simplificado por ahora
 */
export const updateMemberRole = createValidatedAction(
  updateMemberRoleSchema,
  async (data, user) => {
    const { memberId, role, organizationId } = data

    if (!user) {
      return createErrorResponse("Usuario no autenticado");
    }

    // Por ahora, simplemente retornamos éxito
    // En el futuro se puede integrar con Better Auth
    return createSuccessResponse(
      { memberId, role, organizationId },
      "Rol de miembro actualizado exitosamente"
    );
  }
)

/**
 * Obtener organizaciones del usuario actual
 * Simplificado por ahora
 */
export const getUserOrganizations = async () => {
  try {
    // Por ahora retornamos una lista vacía
    // En el futuro se puede integrar con Better Auth o base de datos
    return [];
  } catch (error) {
    console.error("Error getting user organizations:", error);
    return [];
  }
}