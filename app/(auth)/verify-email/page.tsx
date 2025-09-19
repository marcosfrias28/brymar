"use client";

import React, { useEffect, useState } from "react";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { sendVerificationOTPAction, verifyOTPAction } from "@/app/actions/verify-email-actions";

const VerifyEmailPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sesión activa y obtener email
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        
        if (!sessionData?.data?.user) {
          router.push('/sign-in');
          return;
        }

        setSession(sessionData);
        
        // Obtener email de la URL o de la sesión
        const urlEmail = searchParams?.get("email");
        const userEmail = sessionData?.data?.user.email;
        
        if (urlEmail && urlEmail === userEmail) {
          setEmail(urlEmail);
        } else if (userEmail) {
          setEmail(userEmail);
          // Actualizar URL con el email correcto
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('email', userEmail);
          window.history.replaceState({}, '', newUrl.toString());
        } else {
          toast.error('No se pudo obtener el email del usuario');
          router.push('/sign-in');
          return;
        }
        
      } catch (error) {
        console.error('Error checking session:', error);
        router.push('/sign-in');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [searchParams, router]);

  // Función para reenviar código OTP
  const handleResendCode = async () => {
    if (!email || isResending) return;
    
    setIsResending(true);
    try {
      const formData = new FormData();
      formData.append('email', email);
      
      const result = await sendVerificationOTPAction(formData);
      
      if (result.success) {
        toast.success('Código reenviado exitosamente');
      } else {
        toast.error(result.error || 'Error al reenviar el código');
      }
    } catch (error) {
      toast.error('Error al reenviar el código');
    } finally {
      setIsResending(false);
    }
  };

  // Función personalizada para manejar la verificación
  const handleVerifyOTP = async (formData: FormData) => {
    if (!email) {
      return { error: "Email no disponible" };
    }
    
    // Agregar email al formData
    formData.append('email', email);
    
    const result = await verifyOTPAction(formData);
    
    if (result.success) {
      toast.success('Email verificado exitosamente');
      // Refrescar la sesión
      try {
        await authClient.getSession();
      } catch (error) {
        console.error('Error refreshing session:', error);
      }
    }
    
    return result;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!email || !session) {
    return null; // El useEffect manejará la redirección
  }

  const otpField = {
    id: 'otp',
    name: "otp",
    type: "text" as const,
    label: "Código de Verificación",
    placeholder: "Ingresa el código de 6 dígitos",
    required: true,
    maxLength: 6,
    minLength: 6,
    pattern: "[0-9]{6}",
    autoComplete: "one-time-code"
  };

  return (
    <AuthFormWrapper
      title="Verificar Email"
      subtitle={`Ingresa el código de 6 dígitos que enviamos a ${email}`}
      action={handleVerifyOTP}
      fields={[otpField]}
      submitText="Verificar Código"
      loadingText="Verificando código..."
      footerContent={
        <p className="text-sm text-muted-foreground text-center">
          ¿No recibiste el código?{" "}
          <button
            type="button"
            className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleResendCode}
            disabled={isResending}
          >
            {isResending ? 'Reenviando...' : 'Reenviar código'}
          </button>
        </p>
      }
    />
  );
};

export default VerifyEmailPage;
