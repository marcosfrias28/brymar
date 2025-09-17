"use server"

import { put } from "@vercel/blob"
import { auth } from "../auth/auth"
import { validatedAction } from "../validations"
import { z } from "zod"
import type { BetterCallAPIError } from "@/utils/types/types"
import { headers } from "next/headers"
import type { User } from "../db/schema"
import { info, warning, error as logError, getSafeUserMessage } from "../logger"

const signInSchema = z.object({
  email: z.string().email().min(3).max(255).describe("Email must be valid"),
  password: z.string().min(8).max(100).describe("Password must be at least 8 characters long"),
})

export const signIn = validatedAction(signInSchema, async (_: any, formData: FormData) => {
  const email = formData.get("email") as string | null
  const password = formData.get("password") as string | null

  if (!email || !password) {
    return { error: await getSafeUserMessage('VALIDATION_ERROR') }
  }

  try {
    await auth.api.signInEmail({
      method: "POST",
      body: {
        email,
        password,
      },
    })

    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session?.user) {
      await warning('Authentication failed - no user data returned', { email });
      return { error: await getSafeUserMessage('AUTH_ERROR') }
    }

    // Determinar URL de redirección basada en el rol del usuario
    const userRole = session.user.role;
    let redirectUrl = "/dashboard/properties"; // Default para admin y agent
    
    if (userRole === "user") {
      redirectUrl = "/profile";
    }

    await info('User signed in successfully', { email, role: userRole });
    return {
      success: true,
      redirect: true,
      url: redirectUrl,
      message: "Has iniciado sesión exitosamente",
    }
  } catch (error) {
    const Error = error as BetterCallAPIError

    // Log seguro del error para el servidor
    await logError('Sign in failed', Error, { email });

    // Mensaje genérico para el usuario
    return { error: await getSafeUserMessage('AUTH_ERROR') }
  }
})

const signUpSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
  name: z.string().min(3).max(100),
  image: z.instanceof(File).optional(),
})

export const signUp = validatedAction(signUpSchema, async (_: any, formData: FormData) => {
  const email = formData.get("email") as string | null
  const password = formData.get("password") as string | null
  const name = formData.get("name") as string | null
  const image = formData.get("image") as File | null

  let imageUrl = null
  if (!email || !password || !name) {
    return { error: await getSafeUserMessage('VALIDATION_ERROR') }
  }

  if (image?.type?.startsWith("image/")) {
    try {
      const { url } = await put(`user/${email}`, image as File, {
        access: "public",
      })
      imageUrl = url
    } catch (error) {
      await logError('Image upload failed during signup', error, { email });
      return { error: "Error al subir la imagen" }
    }
  }

  try {
    await auth.api.signUpEmail({
      method: "POST",
      body: {
        email,
        password,
        name,
        image: imageUrl,
      },
    })
    await info('User signed up successfully', { email, name });
    return {
      success: true,
      redirect: true,
      url: `/verify-email?email=${email}`,
      message: "Cuenta creada exitosamente. Revisa tu email para verificar tu cuenta.",
    }
  } catch (error) {
    const Error = error as BetterCallAPIError

    // Log seguro del error para el servidor
    await logError('Sign up failed', Error, { email, name });

    // Mensaje genérico para el usuario
    return { error: await getSafeUserMessage('AUTH_ERROR') }
  }
})

export const getUser = async () => {
  const data = (await auth.api.getSession({
    headers: await headers(),
  })) as unknown as { user: User | null }
  if (!data?.user) return null
  return data.user
}

/**
 * Obtener usuario con información de organizaciones
 */
export const getUserWithOrganizations = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) return null

    // Obtener organizaciones del usuario
    const organizations = await auth.api.listOrganizations({
      headers: await headers(),
    })

    return {
      ...session.user,
      organizations: organizations || [],
    }
  } catch (error) {
    console.error("Error fetching user with organizations:", error)
    return null
  }
}

const signOutSchema = z.object({
  redirect: z.string().optional(),
})

export const signOut = validatedAction(signOutSchema, async (_: any, formData: FormData) => {
  try {
    await auth.api.signOut({
      method: "POST",
      headers: await headers(),
    })

    await info('User signed out successfully');
    return {
      success: true,
      redirect: true,
      url: `/`,
      message: "Has cerrado sesión exitosamente",
    }
  } catch (error) {
    const Error = error as BetterCallAPIError

    // Log seguro del error para el servidor
    await logError('Sign out failed', Error);

    // Mensaje genérico para el usuario
    return { error: await getSafeUserMessage('AUTH_ERROR') }
  }
})

const forgotPasswordScherma = z.object({
  email: z.string().email().min(3).max(255).describe("Email must be valid"),
})

export const forgotPassword = validatedAction(forgotPasswordScherma, async (_: any, formData: FormData) => {
  const email = formData.get("email") as string | null

  if (!email) {
    return { error: await getSafeUserMessage('VALIDATION_ERROR') }
  }

  try {
    await auth.api.forgetPassword({
      method: "POST",
      body: {
        email,
        redirectTo: "/dashboard/properties",
      },
    })
    await info('Password reset requested', { email });
    return {
      success: true,
      message: "Si el email existe, recibirás un enlace para restablecer tu contraseña.",
    }
  } catch (error) {
    const Error = error as BetterCallAPIError

    // Log seguro del error para el servidor
    await logError('Password reset failed', Error, { email });

    // Mensaje genérico para el usuario (no revelar si el email existe)
    return { error: "Si el email existe, recibirás un enlace para restablecer tu contraseña." }
  }
})

const sendVerificationOTPSchema = z.object({
  email: z.string().email().min(3).max(255).describe("Email must be valid"),
})

export const sendVerificationOTP = validatedAction(sendVerificationOTPSchema, async (_: any, formData: FormData) => {
  const email = formData.get("email") as string | null

  if (!email) {
    return { error: "Email is required" }
  }

  try {
    await auth.api.sendVerificationOTP({
      method: "POST",
      body: {
        email,
        type: "email-verification",
      },
    })
    return {
      success: true,
      message: "Código de verificación enviado exitosamente",
    }
  } catch (error) {
    const Error = error as BetterCallAPIError

    // Log seguro del error para el servidor
    await logError('Failed to send verification OTP', Error, { email });

    // Mensaje genérico para el usuario
    return { error: await getSafeUserMessage('EMAIL_SEND_ERROR') }
  }
})

const verifyEmailOTPSchema = z.object({
  email: z.string().email().min(3).max(255).describe("Email must be valid"),
  otp: z.string().min(6).max(6).describe("OTP must be 6 digits"),
})

export const verifyEmailOTP = validatedAction(verifyEmailOTPSchema, async (_: any, formData: FormData) => {
  const email = formData.get("email") as string | null
  const otp = formData.get("otp") as string | null

  if (!email || !otp) {
    return { error: "Email y código OTP son requeridos" }
  }

  try {
    await auth.api.verifyEmailOTP({
      body: {
        email,
        otp,
      },
    })
    return {
      success: true,
      redirect: true,
      url: "/dashboard/properties",
      message: "Email verificado exitosamente",
    }
  } catch (error) {
    const Error = error as BetterCallAPIError

    // Log seguro del error para el servidor
    await logError('Failed to verify email OTP', Error, { email });

    // Mensaje genérico para el usuario
    return { error: await getSafeUserMessage('EMAIL_VERIFICATION_ERROR') }
  }
})
