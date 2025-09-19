"use server"

import { put } from "@vercel/blob"
import { auth } from "../../lib/auth/auth"
import { ActionState, validatedAction, SignInActionState, SignUpActionState, ForgotPasswordActionState, ResetPasswordActionState, VerifyEmailActionState, SendVerificationActionState, validatedActionWithUser } from "../../lib/validations"
import { z } from "zod"
import type { BetterCallAPIError } from "@/utils/types/types"
// Removed headers import - will be passed as parameter
import type { User } from "../../lib/db/schema"
import { sendVerificationOTP as sendVerificationEmail } from "../../lib/email"
import { redirect } from "next/navigation"
import { role } from "better-auth/plugins/access"
import image from "next/image"

const signInSchema = z.object({
  email: z.string().email().min(3).max(255).describe("Email must be valid"),
  password: z.string().min(8).max(100).describe("Password must be at least 8 characters long"),
})

/**
 * Obtener sesión del usuario con reintentos
 */
export const getUserSession = async (requestHeaders?: Headers, maxRetries = 3, delay = 500) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const headers = requestHeaders || await (await import('next/headers')).headers()
      const sessionData = (await auth.api.getSession({
        headers: headers,
      })) as unknown as { user: User | null }
      
      if (sessionData?.user) {
        return sessionData.user
      }
      
      // Si no hay usuario y no es el último intento, esperar antes del siguiente
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    } catch (error) {
      console.error(`Error obteniendo sesión (intento ${attempt}):`, error)
      if (attempt === maxRetries) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  return null
}

export const signIn = validatedAction(signInSchema, async (formData: FormData): Promise<SignInActionState> => {
  const email = formData?.get('email') as string
  const password = formData?.get('password') as string

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos", user: undefined, redirect: false }
  }

  try {
    const { user } = await auth.api.signInEmail({
      method: "POST",
      body: {
        email,
        password,
      },
    })

    return {
      success: true,
      redirect: true,
      url: "/profile",
      message: "Has iniciado sesión exitosamente",
      user: user as User,
    }
  } catch (error) {
    const Error = error as BetterCallAPIError
    return { 
      error: Error?.body?.message || "Error al iniciar sesión", 
      user: undefined, 
      redirect: false 
    }
  }
})

const updateUserSchema = z.object({
    email: z.string().email().min(3).max(255).optional(),
  password: z.string().min(8).max(100).optional(),
  name: z.string().min(3).max(100).optional(),
  image: z.instanceof(File).optional(),
  role: z.string().optional(),
})

export const updateUserAction = validatedActionWithUser(updateUserSchema, async (formData: FormData, user: User): Promise<ActionState> => {
  const email = formData?.get('email') as string
  const password = formData?.get('password') as string
  const name = formData?.get('name') as string
  const image = formData?.get('image') as File
  const role = formData?.get('role') as string
  try {
    let imageUrl = image?.name || undefined
    if (image?.type?.startsWith("image/")) {
      const { url } = await put(`user/${email}`, image as File, {
        access: "public",
      })
      imageUrl = url
    }

    await auth.api.updateUser({
      method: "POST",
      body: {
        email,
        password,
        name,
        image: imageUrl,
        role,
      },
    })
    return {
      success: true,
      message: "Usuario actualizado exitosamente",
    }
  } catch (error) {
    const Error = error as BetterCallAPIError
    return {
      error: Error?.body?.message || "Error actualizando el usuario",
    }
  }
})

const signUpSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
  name: z.string().min(3).max(100),
  image: z.instanceof(File).optional(),
})

export const signUp = validatedAction(signUpSchema, async (formData: FormData): Promise<SignUpActionState> => {
  const email = formData?.get('email') as string
  const password = formData?.get('password') as string
  const name = formData?.get('name') as string
  const image = formData?.get('image') as File

  let imageUrl = null

  if (image?.type?.startsWith("image/")) {
    try {
      const { url } = await put(`user/${email}`, image as File, {
        access: "public",
      })
      imageUrl = url
    } catch (error) {
      return { error: "Error during image upload" }
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

    // Enviar email de verificación automáticamente
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?email=${email}`
    await sendVerificationEmail({
      to: email,
      subject: "Verifica tu cuenta - Brymar Inmobiliaria",
      url: verificationUrl,
    })

    return {
      success: true,
      redirect: true,
      url: `/verify-email?email=${email}`,
      message: "Enlace de verificación enviado exitosamente",
    }
  } catch (error) {
    const Error = error as BetterCallAPIError
    return { error: Error.body?.message || "Error durante el registro", success: false, user: undefined, redirect: false }
  }
})

export const getUser = async (requestHeaders?: Headers) => {
  return await getUserSession(requestHeaders)
}




const forgotPasswordScherma = z.object({
  email: z.string().email().min(3).max(255).describe("Email es requerido"),
})

export const forgotPassword = validatedAction(forgotPasswordScherma, async (formData: FormData): Promise<ForgotPasswordActionState> => {
  const email = formData?.get('email') as string;

  try {
    await auth.api.forgetPassword({
      method: "POST",
      body: {
        email,
        redirectTo: "/reset-password",
      },
    })
    return {
      success: true,
      message: "Enlace de restablecimiento de contraseña enviado exitosamente",
    }
  } catch (error) {
    const Error = error as BetterCallAPIError
    return { error: Error.body?.message || "Error enviando el enlace de restablecimiento de contraseña", success: false }
  }
})

const resetPasswordSchema = z.object({
  password: z.string().min(8).max(100).describe("Contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string().min(8).max(100).describe("Confirmación de contraseña es requerida"),
  token: z.string().min(1).describe("Token es requerido"),
})

export const resetPassword = validatedAction(resetPasswordSchema, async (formData: FormData): Promise<ResetPasswordActionState> => {
  const password = formData?.get('password') as string
  const confirmPassword = formData?.get('confirmPassword') as string
  const token = formData?.get('token') as string

  if (password !== confirmPassword) {
    return { error: "Contraseñas no coinciden", success: false }
  }

  try {
    await auth.api.resetPassword({
      method: "POST",
      body: {
        newPassword: password,
        token,
      },
    })
    return {
      success: true,
      redirect: true,
      url: "/sign-in",
      message: "Password reset successfully. Please sign in with your new password.",
    }
  } catch (error) {
    const Error = error as BetterCallAPIError
    return { error: Error.body?.message || "Error resetting password" }
  }
})

const sendVerificationOTPSchema = z.object({
  email: z.string().email().min(3).max(255).describe("Email must be valid"),
})

export const sendVerificationOTP = validatedAction(sendVerificationOTPSchema, async (formData: FormData): Promise<SendVerificationActionState> => {
  const email = formData?.get('email') as string;

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
      message: "Verification code sent successfully to your email",
    }
  } catch (error) {
    const Error = error as BetterCallAPIError
    return { error: Error.body?.message || "Error sending verification email" }
  }
})

const verifyOTPSchema = z.object({
  email: z.string().email().min(3).max(255).describe("Email debe ser válido"),
  otp: z.string().min(6, "OTP debe tener 6 caracteres").max(6, "OTP debe tener 6 caracteres"),
})

export const verifyOTP = validatedAction(verifyOTPSchema, async (formData: FormData): Promise<VerifyEmailActionState> => {
  const email = formData?.get('email') as string;
  const otp = formData?.get('otp') as string;

  try {
    await auth.api.verifyEmailOTP({
      method: "POST",
      body: {
        email,
        otp
      },
    })
    return {
      success: true,
      redirect: true,
      url: "/dashboard",
      message: "Email verified successfully",
    }
  } catch (error) {
    const Error = error as BetterCallAPIError
    return { error: Error.body?.message || "Error verifying email" }
  }
})
