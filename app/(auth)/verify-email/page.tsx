"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { AuthWrapperLayout } from "@/components/auth/auth-wrapper-layout";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const VerifyEmailPage = () => {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const title = "Verificar Email";
  const subtitle = "Ingresa el código de 6 dígitos enviado a tu correo electrónico";

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      verifyOtp(value);
    }
  };

  const verifyOtp = async (otpCode: string) => {
    setVerificationStatus('loading');
    
    try {
      // Simulate OTP verification - replace with actual API call
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp: otpCode }),
      });
      
      if (response.ok) {
        setVerificationStatus('success');
        setTimeout(() => {
          router.push('/dashboard/properties');
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setVerificationStatus('error');
        setErrorMessage(errorData.message || 'Código OTP inválido');
        setOtp(''); // Clear OTP on error
      }
    } catch (error: any) {
      setVerificationStatus('error');
      setErrorMessage(error?.message || 'Error de verificación');
      setOtp(''); // Clear OTP on error
    }
  };

  const handleResendOtp = async () => {
    try {
      await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // Show success message or toast
    } catch (error) {
      // Handle error
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <>
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
            </div>
            <h1 className="text-4xl font-black text-center">Verificando...</h1>
            <p className="text-lg text-pretty text-center">Validando tu código OTP...</p>
          </>
        );
      case 'success':
        return (
          <>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-4xl font-black text-center text-green-600">¡Código Verificado!</h1>
            <p className="text-lg text-pretty text-center">Tu código ha sido verificado exitosamente. Redirigiendo al panel de control...</p>
          </>
        );
      case 'error':
        return (
          <>
            <div className="flex items-center justify-center mb-4">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-4xl font-black text-center text-red-600">Código Inválido</h1>
            <p className="text-lg text-pretty text-center text-red-500 mb-4">{errorMessage}</p>
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={handleOtpChange}>
                  <InputOTPGroup className="space-x-1">
                    <InputOTPSlot index={0} className="rounded-md border-l" />
                    <InputOTPSlot index={1} className="rounded-md border-l" />
                    <InputOTPSlot index={2} className="rounded-md border-l" />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup className="space-x-1">
                    <InputOTPSlot index={3} className="rounded-md border-l" />
                    <InputOTPSlot index={4} className="rounded-md border-l" />
                    <InputOTPSlot index={5} className="rounded-md border-l" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button onClick={handleResendOtp} variant="outline" className="w-full">
                  Reenviar Código
                </Button>
                <Button onClick={() => router.push('/sign-in')} className="w-full">
                  Volver a Iniciar Sesión
                </Button>
              </div>
            </div>
          </>
        );
      default:
        return (
          <>
            <h1 className="text-4xl font-black text-center">{title}</h1>
            <p className="text-lg text-pretty text-center mb-6">{subtitle}</p>
            
            <div className="flex justify-center mb-6">
              <InputOTP maxLength={6} value={otp} onChange={handleOtpChange}>
                <InputOTPGroup className="space-x-1">
                  <InputOTPSlot index={0} className="rounded-md border-l" />
                  <InputOTPSlot index={1} className="rounded-md border-l" />
                  <InputOTPSlot index={2} className="rounded-md border-l" />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup className="space-x-1">
                  <InputOTPSlot index={3} className="rounded-md border-l" />
                  <InputOTPSlot index={4} className="rounded-md border-l" />
                  <InputOTPSlot index={5} className="rounded-md border-l" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                ¿No recibiste el código?
              </p>
              <Button onClick={handleResendOtp} variant="link" className="text-sm">
                Reenviar código
              </Button>
            </div>
          </>
        );
    }
  };

  return (
    <AuthWrapperLayout>
      <div className={cn("flex flex-col gap-6")}>
        {renderContent()}
      </div>
    </AuthWrapperLayout>
  );
};

export default VerifyEmailPage;