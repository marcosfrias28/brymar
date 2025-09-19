"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { validatedAction, BaseActionState } from "@/lib/validations";
import { auth } from "@/lib/auth/auth";
import type { BetterCallAPIError } from "@/utils/types/types";

// Schema para verificación de OTP
const verifyOTPSchema = z.object({
  email: z.string().email("Email debe ser válido"),
  otp: z.string().min(6, "OTP debe tener 6 caracteres").max(6, "OTP debe tener 6 caracteres"),
});

// Schema para envío de OTP
const sendVerificationOTPSchema = z.object({
  email: z.string().email("Email debe ser válido"),
});

export type VerifyEmailActionState = BaseActionState & {
  redirect?: boolean;
  url?: string;
};

export type SendVerificationActionState = BaseActionState;

// Función interna para verificar OTP
async function verifyEmailOTP(
  formData: FormData
): Promise<VerifyEmailActionState> {
  const email = formData.get('email') as string;
  const otp = formData.get('otp') as string;

  try {
    await auth.api.verifyEmailOTP({
      method: "POST",
      body: {
        email,
        otp
      },
    });
    
    revalidatePath("/dashboard");
    
    return {
      success: true,
      redirect: true,
      url: "/dashboard",
      message: "Email verificado exitosamente",
    };
  } catch (error) {
    const apiError = error as BetterCallAPIError;
    return { 
      success: false,
      error: apiError.body?.message || "Error al verificar el email" 
    };
  }
}

// Función interna para enviar OTP
async function sendVerificationCode(
  formData: FormData
): Promise<SendVerificationActionState> {
  const email = formData.get('email') as string;

  try {
    await auth.api.sendVerificationOTP({
      method: "POST",
      body: {
        email,
        type: "email-verification",
      },
    });
    
    return {
      success: true,
      message: "Código de verificación enviado exitosamente",
    };
  } catch (error) {
    const apiError = error as BetterCallAPIError;
    return { 
      success: false,
      error: apiError.body?.message || "Error al enviar el código de verificación" 
    };
  }
}

// Actions exportadas con validación
export const verifyOTPAction = validatedAction(
  verifyOTPSchema,
  verifyEmailOTP
);

export const sendVerificationOTPAction = validatedAction(
  sendVerificationOTPSchema,
  sendVerificationCode
);