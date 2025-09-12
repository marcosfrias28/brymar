"use client";

import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { LoginWrapper } from "@/components/auth/login-wrapper";

const VerifyEmailPage = () => {
  const params = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const token = params?.get("token");
  const callbackURL = params?.get("callbackURL");
  const email = params?.get("email");

  const title = "Verificar Email";
  const subtitle = "Verificando tu dirección de correo electrónico...";

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    if (!token) return;
    
    setVerificationStatus('loading');
    
    try {
      const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}&callbackURL=${encodeURIComponent(callbackURL || '/dashboard/properties')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setVerificationStatus('success');
        setTimeout(() => {
          router.push(callbackURL || '/dashboard/properties');
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setVerificationStatus('error');
        setErrorMessage(errorData.message || 'Error de verificación');
      }
    } catch (error: any) {
      setVerificationStatus('error');
      setErrorMessage(error?.message || 'Error de red');
    }
  };

  const renderContent = () => {
    if (token) {
      switch (verificationStatus) {
        case 'loading':
          return (
            <>
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
              </div>
              <h1 className="text-4xl font-black text-center">Verificando...</h1>
              <p className="text-lg text-pretty text-center">Por favor espera mientras verificamos tu dirección de correo electrónico.</p>
            </>
          );
        case 'success':
          return (
            <>
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h1 className="text-4xl font-black text-center text-green-600">¡Email Verificado!</h1>
              <p className="text-lg text-pretty text-center">Tu email ha sido verificado exitosamente. Redirigiendo al panel de control...</p>
            </>
          );
        case 'error':
          return (
            <>
              <div className="flex items-center justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <h1 className="text-4xl font-black text-center text-red-600">Verificación Fallida</h1>
              <p className="text-lg text-pretty text-center text-red-500">{errorMessage}</p>
              <Button 
                onClick={() => router.push('/sign-in')} 
                className="w-full mt-4"
              >
                Ir a Iniciar Sesión
              </Button>
            </>
          );
        default:
          return (
            <>
              <h1 className="text-4xl font-black">{title}</h1>
              <p className="text-lg text-pretty">{subtitle}</p>
            </>
          );
      }
    }
    
    return (
      <>
        <h1 className="text-4xl font-black">{title}</h1>
        <p className="text-lg text-pretty">{subtitle}</p>
        {email && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Email de verificación enviado a: <strong>{email}</strong>
          </p>
        )}
      </>
    );
  };

  return (
    <LoginWrapper>
      <div
        className={cn(
          "space-y-6 max-w-md p-10 rounded-lg shadow-2xl shadow-black/40 dark:shadow-white/10",
          "backdrop-blur-xs backdrop-saturate-180 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10",
          "text-gray-800 dark:text-gray-100"
        )}
      >
        {renderContent()}
      </div>
    </LoginWrapper>
  );
};

export default VerifyEmailPage;