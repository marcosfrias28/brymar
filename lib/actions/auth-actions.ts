"use server"

import { put } from "@vercel/blob"
import { auth } from "@/lib/auth/auth"
import {
  ActionState,
  createValidatedAction,
  handleAPIError,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/validations"
import { z } from "zod"
import type { User } from "@/lib/db/schema"
import { sendVerificationOTP as sendVerificationEmail } from "@/lib/email"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

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

async function signInAction(
  data: { email: string; password: string }
): Promise<ActionState<{ user: User }>> {
  try {
    const { user } = await auth.api.signInEmail({
      method: "POST",
      body: {
        email: data.email,
        password: data.password,
      },
    })

    revalidatePath('/')

    return createSuccessResponse(
      { user: user as User },
      "Has iniciado sesión exitosamente",
      true,
      "/profile"
    );
  } catch (error) {
    return handleAPIError(error, "Error al iniciar sesión");
  }
}

export const signIn = createValidatedAction(signInSchema, signInAction);

export const getUser = async (requestHeaders?: Headers) => {
  return await getUserSession(requestHeaders)
}

/**
 * Server action for logout
 */
export async function logoutAction(): Promise<ActionState> {
  try {
    const requestHeaders = await headers();
    
    await auth.api.signOut({
      headers: requestHeaders,
      method: "POST",
    });

    // Revalidate the home page to update navbar
    revalidatePath('/');

    return createSuccessResponse(
      undefined,
      "Sesión cerrada exitosamente",
      true,
      "/"
    );
  } catch (error) {
    return handleAPIError(error, "Error al cerrar sesión");
  }
}

const updateUserSchema = z.object({
  email: z.string().email().min(3).max(255).optional(),
  password: z.string().min(8).max(100).optional(),
  name: z.string().min(3).max(100).optional(),
  image: z.instanceof(File).optional(),
  role: z.string().optional(),
})

async function updateUserActionFunction(
  data: {
    email?: string;
    password?: string;
    name?: string;
    image?: File;
    role?: string;
  },
  user?: User
): Promise<ActionState> {
  if (!user) {
    return createErrorResponse("User is not authenticated");
  }

  try {
    let imageUrl = data.image?.name || undefined;

    if (data.image?.type?.startsWith("image/")) {
      const { url } = await put(`user/${data.email || user.email}`, data.image, {
        access: "public",
      });
      imageUrl = url;
    }

    await auth.api.updateUser({
      method: "POST",
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
        image: imageUrl,
        role: data.role,
      },
    });

    return createSuccessResponse(
      undefined,
      "Usuario actualizado exitosamente"
    );
  } catch (error) {
    return handleAPIError(error, "Error actualizando el usuario");
  }
}

export const updateUserAction = createValidatedAction(
  updateUserSchema,
  updateUserActionFunction,
  { withUser: true, getUserFn: getUser }
);

const signUpSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
  name: z.string().min(3).max(100),
  image: z.instanceof(File).optional(),
})

async function signUpAction(
  data: { email: string; password: string; name: string; image?: File }
): Promise<ActionState> {
  let imageUrl: string | null = null;

  // Handle image upload if provided
  if (data.image?.type?.startsWith("image/")) {
    try {
      const { url } = await put(`user/${data.email}`, data.image, {
        access: "public",
      });
      imageUrl = url;
    } catch (error) {
      return createErrorResponse("Error during image upload");
    }
  }

  try {
    await auth.api.signUpEmail({
      method: "POST",
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
        image: imageUrl,
      },
    });

    // Send verification email automatically
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?email=${data.email}`;
    await sendVerificationEmail({
      to: data.email,
      subject: "Verifica tu cuenta - Brymar Inmobiliaria",
      url: verificationUrl,
    });

    // Revalidate the home page to update navbar
    revalidatePath('/');

    return createSuccessResponse(
      undefined,
      "Enlace de verificación enviado exitosamente",
      true,
      `/verify-email?email=${data.email}`
    );
  } catch (error) {
    return handleAPIError(error, "Error durante el registro");
  }
}

export const signUp = createValidatedAction(signUpSchema, signUpAction);

const forgotPasswordSchema = z.object({
  email: z.string().email().min(3).max(255).describe("Email es requerido"),
});

async function forgotPasswordAction(
  data: { email: string }
): Promise<ActionState> {
  try {
    await auth.api.forgetPassword({
      method: "POST",
      body: {
        email: data.email,
        redirectTo: "/reset-password",
      },
    });

    return createSuccessResponse(
      undefined,
      "Enlace de restablecimiento de contraseña enviado exitosamente"
    );
  } catch (error) {
    return handleAPIError(error, "Error enviando el enlace de restablecimiento de contraseña");
  }
}

export const forgotPassword = createValidatedAction(forgotPasswordSchema, forgotPasswordAction);

const resetPasswordSchema = z.object({
  password: z.string().min(8).max(100).describe("Contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string().min(8).max(100).describe("Confirmación de contraseña es requerida"),
  token: z.string().min(1).describe("Token es requerido"),
});

async function resetPasswordAction(
  data: { password: string; confirmPassword: string; token: string }
): Promise<ActionState> {
  if (data.password !== data.confirmPassword) {
    return createErrorResponse("Contraseñas no coinciden");
  }

  try {
    await auth.api.resetPassword({
      method: "POST",
      body: {
        newPassword: data.password,
        token: data.token,
      },
    });

    return createSuccessResponse(
      undefined,
      "Password reset successfully. Please sign in with your new password.",
      true,
      "/sign-in"
    );
  } catch (error) {
    return handleAPIError(error, "Error resetting password");
  }
}

export const resetPassword = createValidatedAction(resetPasswordSchema, resetPasswordAction);

const sendVerificationOTPSchema = z.object({
  email: z.string().email().min(3).max(255).describe("Email must be valid"),
});

async function sendVerificationOTPAction(
  data: { email: string }
): Promise<ActionState> {
  try {
    await auth.api.sendVerificationOTP({
      method: "POST",
      body: {
        email: data.email,
        type: "email-verification",
      },
    });

    return createSuccessResponse(
      undefined,
      "Verification code sent successfully to your email"
    );
  } catch (error) {
    return handleAPIError(error, "Error sending verification email");
  }
}

export const sendVerificationOTP = createValidatedAction(sendVerificationOTPSchema, sendVerificationOTPAction);

const verifyOTPSchema = z.object({
  email: z.string().email().min(3).max(255).describe("Email debe ser válido"),
  otp: z.string().min(6, "OTP debe tener 6 caracteres").max(6, "OTP debe tener 6 caracteres"),
});

async function verifyOTPAction(
  data: { email: string; otp: string }
): Promise<ActionState<{ verified: boolean }>> {
  try {
    await auth.api.verifyEmailOTP({
      method: "POST",
      body: {
        email: data.email,
        otp: data.otp
      },
    });

    // Revalidate the home page to update navbar
    revalidatePath('/');

    return createSuccessResponse(
      { verified: true },
      "Email verified successfully",
      true,
      "/dashboard"
    );
  } catch (error) {
    return handleAPIError(error, "Error verifying email");
  }
}

export const verifyOTP = createValidatedAction(verifyOTPSchema, verifyOTPAction);
