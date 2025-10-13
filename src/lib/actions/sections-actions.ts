"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { eq, and, desc } from "drizzle-orm"
import {
    type ActionState,
    createValidatedAction,
    createSuccessResponse,
    createErrorResponse
} from "../validations"
import db from "../db/drizzle"
import { pageSections, contactInfo } from "../db/schema"

// Schema para secciones de página
const pageSectionSchema = z.object({
    page: z.string().min(1, "La página es requerida"),
    section: z.string().min(1, "La sección es requerida"),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    content: z.record(z.any()).optional(),
    images: z.array(z.string()).optional(),
    settings: z.record(z.any()).optional(),
    isActive: z.boolean().optional(),
    order: z.number().optional(),
})

const updatePageSectionSchema = pageSectionSchema.extend({
    id: z.number().min(1, "ID es requerido")
})

// Schema para información de contacto
const contactInfoSchema = z.object({
    type: z.string().min(1, "El tipo es requerido"),
    label: z.string().min(1, "La etiqueta es requerida"),
    value: z.string().min(1, "El valor es requerido"),
    icon: z.string().optional(),
    isActive: z.boolean().optional(),
    order: z.number().optional(),
})

const updateContactInfoSchema = contactInfoSchema.extend({
    id: z.number().min(1, "ID es requerido")
})

// Acciones para Page Sections
async function createPageSectionAction(data: z.infer<typeof pageSectionSchema>): Promise<ActionState> {
    try {
        await db.insert(pageSections).values({
            page: data.page,
            section: data.section,
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            content: data.content || {},
            images: data.images || [],
            settings: data.settings || {},
            isActive: data.isActive ?? true,
            order: data.order ?? 0,
            createdAt: new Date(),
        })

        revalidatePath("/dashboard/sections")
        revalidatePath("/") // Revalidar homepage
        return createSuccessResponse(undefined, "Sección creada exitosamente")
    } catch (error) {
        console.error("Error creating page section:", error)
        return createErrorResponse("Error al crear la sección")
    }
}

async function updatePageSectionAction(data: z.infer<typeof updatePageSectionSchema>): Promise<ActionState> {
    try {
        await db.update(pageSections)
            .set({
                page: data.page,
                section: data.section,
                title: data.title,
                subtitle: data.subtitle,
                description: data.description,
                content: data.content,
                images: data.images,
                settings: data.settings,
                isActive: data.isActive,
                order: data.order,
                updatedAt: new Date(),
            })
            .where(eq(pageSections.id, data.id))

        revalidatePath("/dashboard/sections")
        revalidatePath("/") // Revalidar homepage
        return createSuccessResponse(undefined, "Sección actualizada exitosamente")
    } catch (error) {
        console.error("Error updating page section:", error)
        return createErrorResponse("Error al actualizar la sección")
    }
}

// Acciones para Contact Info
async function createContactInfoAction(data: z.infer<typeof contactInfoSchema>): Promise<ActionState> {
    try {
        await db.insert(contactInfo).values({
            type: data.type,
            label: data.label,
            value: data.value,
            icon: data.icon,
            isActive: data.isActive ?? true,
            order: data.order ?? 0,
            createdAt: new Date(),
        })

        revalidatePath("/dashboard/sections")
        revalidatePath("/contact") // Revalidar página de contacto
        return createSuccessResponse(undefined, "Información de contacto creada exitosamente")
    } catch (error) {
        console.error("Error creating contact info:", error)
        return createErrorResponse("Error al crear la información de contacto")
    }
}

async function updateContactInfoAction(data: z.infer<typeof updateContactInfoSchema>): Promise<ActionState> {
    try {
        await db.update(contactInfo)
            .set({
                type: data.type,
                label: data.label,
                value: data.value,
                icon: data.icon,
                isActive: data.isActive,
                order: data.order,
                updatedAt: new Date(),
            })
            .where(eq(contactInfo.id, data.id))

        revalidatePath("/dashboard/sections")
        revalidatePath("/contact") // Revalidar página de contacto
        return createSuccessResponse(undefined, "Información de contacto actualizada exitosamente")
    } catch (error) {
        console.error("Error updating contact info:", error)
        return createErrorResponse("Error al actualizar la información de contacto")
    }
}

// Funciones de lectura
export const getPageSections = async (page?: string) => {
    try {
        const query = db.select().from(pageSections)

        if (page) {
            query.where(eq(pageSections.page, page))
        }

        const sections = await query.orderBy(pageSections.order, pageSections.id)
        return sections
    } catch (error) {
        console.error("Error fetching page sections:", error)
        return []
    }
}

export const getPageSection = async (page: string, section: string) => {
    try {
        const result = await db.select()
            .from(pageSections)
            .where(and(
                eq(pageSections.page, page),
                eq(pageSections.section, section)
            ))
            .limit(1)

        return result[0] || null
    } catch (error) {
        console.error("Error fetching page section:", error)
        return null
    }
}

export const getContactInfo = async () => {
    try {
        const contacts = await db.select()
            .from(contactInfo)
            .where(eq(contactInfo.isActive, true))
            .orderBy(contactInfo.order, contactInfo.id)

        return contacts
    } catch (error) {
        console.error("Error fetching contact info:", error)
        return []
    }
}

export const getContactInfoById = async (id: number) => {
    try {
        const result = await db.select()
            .from(contactInfo)
            .where(eq(contactInfo.id, id))
            .limit(1)

        return result[0] || null
    } catch (error) {
        console.error("Error fetching contact info:", error)
        return null
    }
}

// Función para eliminar sección
const deletePageSectionSchema = z.object({
    id: z.number().min(1, "ID es requerido")
})

async function deletePageSectionAction(data: z.infer<typeof deletePageSectionSchema>): Promise<ActionState> {
    try {
        await db.delete(pageSections).where(eq(pageSections.id, data.id))

        revalidatePath("/dashboard/sections")
        revalidatePath("/")
        return createSuccessResponse(undefined, "Sección eliminada exitosamente")
    } catch (error) {
        console.error("Error deleting page section:", error)
        return createErrorResponse("Error al eliminar la sección")
    }
}

// Función para eliminar contacto
const deleteContactInfoSchema = z.object({
    id: z.number().min(1, "ID es requerido")
})

async function deleteContactInfoAction(data: z.infer<typeof deleteContactInfoSchema>): Promise<ActionState> {
    try {
        await db.delete(contactInfo).where(eq(contactInfo.id, data.id))

        revalidatePath("/dashboard/sections")
        revalidatePath("/contact")
        return createSuccessResponse(undefined, "Información de contacto eliminada exitosamente")
    } catch (error) {
        console.error("Error deleting contact info:", error)
        return createErrorResponse("Error al eliminar la información de contacto")
    }
}

// Exportar acciones validadas
export const createPageSection = createValidatedAction(pageSectionSchema, createPageSectionAction)
export const updatePageSection = createValidatedAction(updatePageSectionSchema, updatePageSectionAction)
export const deletePageSection = createValidatedAction(deletePageSectionSchema, deletePageSectionAction)

export const createContactInfo = createValidatedAction(contactInfoSchema, createContactInfoAction)
export const updateContactInfo = createValidatedAction(updateContactInfoSchema, updateContactInfoAction)
export const deleteContactInfo = createValidatedAction(deleteContactInfoSchema, deleteContactInfoAction)