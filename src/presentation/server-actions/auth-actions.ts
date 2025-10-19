"use server";

import { headers } from "next/headers";
import * as logger from "@/lib/logger";
import { auth } from "@/lib/auth/auth";
import {
    createSuccessResponse,
    createErrorResponse,
    type ActionState
} from "@/lib/validations";
import { getRedirectUrlForRole, type UserRole } from "@/lib/auth/admin-config";

/**
 * Acción para iniciar sesión con email y contraseña
 */
export async function signIn(formData: FormData): Promise<ActionState<any>> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        if (!email || !password) {
            return createErrorResponse("Email y contraseña son requeridos");
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return createErrorResponse("Formato de email inválido");
        }

        await logger.info("Intento de inicio de sesión", { email });

        // Usar Better Auth para autenticar
        const result = await auth.api.signInEmail({
            body: {
                email,
                password,
            },
            headers: await headers(),
        });

        if (!result.user) {
            await logger.warning("Credenciales inválidas", { email });
            return createErrorResponse("Credenciales inválidas");
        }

        // El resultado de signInEmail incluye el usuario con el rol
        // Acceder al rol directamente desde el resultado
        const userRole = ((result.user as any).role || 'user') as UserRole;

        await logger.info("Inicio de sesión exitoso", {
            userId: result.user.id,
            email: result.user.email,
            role: userRole
        });

        // Determinar URL de redirección basada en el rol del usuario
        const redirectUrl = getRedirectUrlForRole(userRole);

        // Retornar respuesta exitosa con información de redirección
        return createSuccessResponse(
            { user: result.user },
            "Inicio de sesión exitoso",
            true,
            redirectUrl
        );
    } catch (error: any) {
        await logger.error("Error en inicio de sesión", error, { email });

        if (error.message?.includes("Invalid email or password")) {
            return createErrorResponse("Email o contraseña incorrectos");
        }
        if (error.message?.includes("User not found")) {
            return createErrorResponse("Usuario no encontrado");
        }
        if (error.message?.includes("Account not verified")) {
            return createErrorResponse("Cuenta no verificada. Revisa tu email.");
        }

        return createErrorResponse("Error al iniciar sesión. Inténtalo de nuevo.");
    }
}

/**
 * Acción para registrar un nuevo usuario
 */
export async function signUp(formData: FormData): Promise<ActionState<any>> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    try {
        // Validaciones básicas
        if (!email || !password || !name) {
            return createErrorResponse("Todos los campos son requeridos");
        }

        if (password !== confirmPassword) {
            return createErrorResponse("Las contraseñas no coinciden");
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return createErrorResponse("Formato de email inválido");
        }

        // Validar fortaleza de contraseña
        if (password.length < 8) {
            return createErrorResponse("La contraseña debe tener al menos 8 caracteres");
        }

        await logger.info("Intento de registro", { email, name });

        // Usar Better Auth para registrar
        const result = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            },
            headers: await headers(),
        });

        if (!result.user) {
            return createErrorResponse("Error al crear la cuenta");
        }

        // Con autoSignIn habilitado, el usuario ya está autenticado
        // Obtener la sesión para acceder al rol del usuario
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            await logger.error("Sesión no encontrada después del registro", null, { email });
            return createErrorResponse("Error al crear la sesión");
        }

        const userRole = (session.user as any).role as UserRole;

        await logger.info("Registro exitoso", {
            userId: result.user.id,
            email: result.user.email,
            role: userRole
        });

        // Determinar URL de redirección basada en el rol del usuario
        const redirectUrl = getRedirectUrlForRole(userRole);

        // Retornar respuesta exitosa con información de redirección
        return createSuccessResponse(
            { user: result.user },
            "Cuenta creada exitosamente. ¡Bienvenido!",
            true,
            redirectUrl
        );
    } catch (error: any) {
        await logger.error("Error en registro", error, { email, name });

        // Manejar errores específicos de Better Auth
        if (error.message?.includes("User already exists")) {
            return createErrorResponse("Ya existe una cuenta con este email");
        }
        if (error.message?.includes("Invalid email")) {
            return createErrorResponse("Email inválido");
        }
        if (error.message?.includes("Password too weak")) {
            return createErrorResponse("La contraseña es muy débil");
        }

        return createErrorResponse("Error al crear la cuenta. Inténtalo de nuevo.");
    }
}

/**
 * Acción para cerrar sesión
 */
export async function signOut(): Promise<ActionState> {
    try {
        await logger.info("Cerrando sesión");

        // Usar Better Auth para cerrar sesión
        await auth.api.signOut({
            headers: await headers(),
        });

        await logger.info("Sesión cerrada exitosamente");

        // Retornar respuesta exitosa con información de redirección
        return createSuccessResponse(
            undefined,
            "Sesión cerrada exitosamente",
            true,
            "/"
        );
    } catch (error) {
        await logger.error("Error al cerrar sesión", error);
        return createErrorResponse("Error al cerrar sesión. Inténtalo de nuevo.");
    }
}

/**
 * Acción para solicitar recuperación de contraseña
 */
export async function forgotPassword(formData: FormData): Promise<ActionState> {
    const email = formData.get("email") as string;

    try {
        if (!email) {
            return createErrorResponse("Email es requerido");
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return createErrorResponse("Formato de email inválido");
        }

        await logger.info("Solicitud de recuperación de contraseña", { email });

        // Usar Better Auth para enviar email de recuperación
        await auth.api.forgetPassword({
            body: { email },
            headers: await headers(),
        });

        await logger.info("Email de recuperación enviado", { email });

        return createSuccessResponse(
            undefined,
            "Se han enviado las instrucciones de recuperación a tu email"
        );
    } catch (error: any) {
        await logger.error("Error en recuperación de contraseña", error, { email });

        // Manejar errores específicos
        if (error.message?.includes("User not found")) {
            // Por seguridad, no revelamos si el usuario existe o no
            return createSuccessResponse(
                undefined,
                "Si el email existe, recibirás las instrucciones de recuperación"
            );
        }

        return createErrorResponse("Error al procesar la solicitud. Inténtalo de nuevo.");
    }
}

/**
 * Acción para restablecer contraseña con token
 */
export async function resetPassword(formData: FormData): Promise<ActionState> {
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    try {
        if (!token || !password || !confirmPassword) {
            return createErrorResponse("Todos los campos son requeridos");
        }

        if (password !== confirmPassword) {
            return createErrorResponse("Las contraseñas no coinciden");
        }

        // Validar fortaleza de contraseña
        if (password.length < 8) {
            return createErrorResponse("La contraseña debe tener al menos 8 caracteres");
        }

        await logger.info("Intento de restablecimiento de contraseña", { token });

        // Usar Better Auth para restablecer contraseña
        await auth.api.resetPassword({
            body: {
                token,
                newPassword: password,
            },
            headers: await headers(),
        });

        await logger.info("Contraseña restablecida exitosamente");

        return createSuccessResponse(
            undefined,
            "Contraseña restablecida exitosamente. Ya puedes iniciar sesión."
        );
    } catch (error: any) {
        await logger.error("Error al restablecer contraseña", error, { token });

        // Manejar errores específicos
        if (error.message?.includes("Invalid token")) {
            return createErrorResponse("Token inválido o expirado");
        }
        if (error.message?.includes("Token expired")) {
            return createErrorResponse("El enlace ha expirado. Solicita uno nuevo.");
        }

        return createErrorResponse("Error al restablecer la contraseña. Inténtalo de nuevo.");
    }
}

/**
 * Acción para enviar código de verificación OTP por email
 */
export async function sendVerificationOTP(formData: FormData): Promise<ActionState> {
    const email = formData.get("email") as string;

    try {
        if (!email) {
            return createErrorResponse("Email es requerido");
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return createErrorResponse("Formato de email inválido");
        }

        await logger.info("Enviando código de verificación OTP", { email });

        // Usar Better Auth para enviar OTP
        await auth.api.sendVerificationOTP({
            body: {
                email,
                type: "email-verification"
            },
            headers: await headers(),
        });

        await logger.info("Código OTP enviado exitosamente", { email });

        return createSuccessResponse(
            undefined,
            "Código de verificación enviado a tu email"
        );
    } catch (error: any) {
        await logger.error("Error al enviar código OTP", error, { email });

        // Manejar errores específicos
        if (error.message?.includes("User not found")) {
            return createErrorResponse("Usuario no encontrado");
        }
        if (error.message?.includes("Too many requests")) {
            return createErrorResponse("Demasiados intentos. Espera unos minutos.");
        }

        return createErrorResponse("Error al enviar el código. Inténtalo de nuevo.");
    }
}

/**
 * Acción para verificar código OTP
 */
export async function verifyOTP(formData: FormData): Promise<ActionState> {
    const email = formData.get("email") as string;
    const otp = formData.get("otp") as string;

    try {
        if (!email || !otp) {
            return createErrorResponse("Email y código de verificación son requeridos");
        }

        // Validar formato de OTP (generalmente 6 dígitos)
        if (!/^\d{6}$/.test(otp)) {
            return createErrorResponse("El código debe tener 6 dígitos");
        }

        await logger.info("Verificando código OTP", { email, otp });

        // Usar Better Auth para verificar OTP
        const result = await auth.api.verifyEmailOTP({
            body: { email, otp },
            headers: await headers(),
        });

        if (!result.user) {
            return createErrorResponse("Código inválido o expirado");
        }

        await logger.info("Código OTP verificado exitosamente", {
            email,
            userId: result.user.id
        });

        return createSuccessResponse(
            undefined,
            "Email verificado exitosamente"
        );
    } catch (error: any) {
        await logger.error("Error al verificar código OTP", error, { email, otp });

        // Manejar errores específicos
        if (error.message?.includes("Invalid OTP")) {
            return createErrorResponse("Código inválido");
        }
        if (error.message?.includes("OTP expired")) {
            return createErrorResponse("El código ha expirado. Solicita uno nuevo.");
        }
        if (error.message?.includes("Too many attempts")) {
            return createErrorResponse("Demasiados intentos fallidos. Solicita un nuevo código.");
        }

        return createErrorResponse("Error al verificar el código. Inténtalo de nuevo.");
    }
}

/**
 * Acción para actualizar perfil de usuario
 */
export async function updateUserProfile(formData: FormData): Promise<ActionState> {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    try {
        if (!name && !email) {
            return createErrorResponse("Al menos un campo debe ser proporcionado");
        }

        // Validar email si se proporciona
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return createErrorResponse("Formato de email inválido");
            }
        }

        await logger.info("Actualizando perfil de usuario", { name, email });

        // Usar Better Auth para actualizar perfil
        await auth.api.updateUser({
            body: {
                name: name || undefined,
                email: email || undefined,
            },
            headers: await headers(),
        });

        await logger.info("Perfil actualizado exitosamente", { name, email });

        return createSuccessResponse(
            undefined,
            "Perfil actualizado exitosamente"
        );
    } catch (error: any) {
        await logger.error("Error al actualizar perfil", error, { name, email });

        // Manejar errores específicos
        if (error.message?.includes("Email already exists")) {
            return createErrorResponse("Ya existe una cuenta con este email");
        }
        if (error.message?.includes("Unauthorized")) {
            return createErrorResponse("No autorizado. Inicia sesión de nuevo.");
        }

        return createErrorResponse("Error al actualizar el perfil. Inténtalo de nuevo.");
    }
}

/**
 * Acción para cambiar contraseña (usuario autenticado)
 */
export async function changePassword(formData: FormData): Promise<ActionState> {
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    try {
        if (!currentPassword || !newPassword || !confirmPassword) {
            return createErrorResponse("Todos los campos son requeridos");
        }

        if (newPassword !== confirmPassword) {
            return createErrorResponse("Las nuevas contraseñas no coinciden");
        }

        // Validar fortaleza de nueva contraseña
        if (newPassword.length < 8) {
            return createErrorResponse("La nueva contraseña debe tener al menos 8 caracteres");
        }

        if (currentPassword === newPassword) {
            return createErrorResponse("La nueva contraseña debe ser diferente a la actual");
        }

        await logger.info("Cambiando contraseña de usuario");

        // Usar Better Auth para cambiar contraseña
        await auth.api.changePassword({
            body: {
                currentPassword,
                newPassword,
            },
            headers: await headers(),
        });

        await logger.info("Contraseña cambiada exitosamente");

        return createSuccessResponse(
            undefined,
            "Contraseña cambiada exitosamente"
        );
    } catch (error: any) {
        await logger.error("Error al cambiar contraseña", error);

        // Manejar errores específicos
        if (error.message?.includes("Invalid current password")) {
            return createErrorResponse("Contraseña actual incorrecta");
        }
        if (error.message?.includes("Unauthorized")) {
            return createErrorResponse("No autorizado. Inicia sesión de nuevo.");
        }

        return createErrorResponse("Error al cambiar la contraseña. Inténtalo de nuevo.");
    }
}

// Mantener compatibilidad con el código existente
export async function updateUserAction(formData: FormData): Promise<ActionState> {
    return updateUserProfile(formData);
}