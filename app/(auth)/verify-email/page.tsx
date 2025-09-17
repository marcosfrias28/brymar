"use client";

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import { LoginWrapper } from "@/components/auth/login-wrapper";
import { toast } from "sonner";
import {
  sendVerificationOTP,
  verifyEmailOTP,
} from "@/lib/actions/auth-actions";
import { authClient } from "@/lib/auth/auth-client";

const VerifyEmailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationState, setVerificationState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [otpValue, setOtpValue] = useState("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get email from URL params or session
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      // Try to get email from session or redirect to sign-in
      authClient.getSession().then(({ data }) => {
        if (data?.user?.email) {
          setEmail(data.user.email);
        } else {
          router.push("/sign-in");
        }
      });
    }
  }, [searchParams, router]);

  const handleVerifyOTP = async () => {
    if (!email || !otpValue || otpValue.length !== 6) {
      setError("Por favor ingresa un código válido de 6 dígitos");
      return;
    }

    setVerificationState("loading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("otp", otpValue);

      const result = await verifyEmailOTP({}, formData);

      if (result.error) {
        setError(result.error);
        setVerificationState("error");
        return;
      }

      setVerificationState("success");
      toast.success("Email verificado exitosamente");

      // Redirect after a short delay
      setTimeout(() => {
        router.push(result.url || "/dashboard/properties");
      }, 1500);
    } catch (err) {
      console.error("Verification error:", err);
      setError("Error inesperado al verificar el código");
      setVerificationState("error");
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError("Email no disponible");
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", email);

      const result = await sendVerificationOTP({}, formData);

      if (result.error) {
        setError(result.error);
      } else {
        toast.success("Nuevo código enviado a tu email");
        setOtpValue(""); // Clear current OTP
      }
    } catch (err) {
      console.error("Resend error:", err);
      setError("Error al reenviar el código");
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (verificationState) {
      case "loading":
        return (
          <>
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
            </div>
            <h1 className="text-4xl font-black text-center">Verificando...</h1>
            <p className="text-lg text-pretty text-center">
              Por favor espera mientras verificamos tu código.
            </p>
          </>
        );
      case "success":
        return (
          <>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-4xl font-black text-center text-green-600">
              ¡Email Verificado!
            </h1>
            <p className="text-lg text-pretty text-center">
              Tu email ha sido verificado exitosamente. Redirigiendo al panel de
              control...
            </p>
          </>
        );
      case "error":
        return (
          <>
            <div className="flex items-center justify-center mb-4">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-4xl font-black text-center text-red-600">
              Verificación Fallida
            </h1>
            <p className="text-lg text-pretty text-center text-red-500">
              {error}
            </p>
            <Button
              onClick={() => router.push("/sign-in")}
              className="w-full mt-4"
            >
              Ir a Iniciar Sesión
            </Button>
          </>
        );
      default:
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Mail className="h-12 w-12 text-blue-500" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Verificar Email
              </CardTitle>
              <CardDescription>
                Ingresa el código de 6 dígitos que enviamos a tu email
                {email && (
                  <div className="mt-2">
                    <strong>{email}</strong>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpValue}
                  onChange={(value) => {
                    setOtpValue(value);
                    setError(null);
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <Button
                onClick={handleVerifyOTP}
                disabled={
                  otpValue.length !== 6 ||
                  (verificationState as string) === "loading"
                }
                className="w-full"
              >
                {(verificationState as string) === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar Código"
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={isResending || !email}
                  className="text-sm"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    "¿No recibiste el código? Reenviar"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <LoginWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6">{renderContent()}</div>
      </div>
    </LoginWrapper>
  );
};

export default VerifyEmailPage;
