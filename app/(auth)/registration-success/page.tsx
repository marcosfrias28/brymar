"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginWrapper } from "@/components/auth/login-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";

const RegistrationSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Get email and name from URL params or session
    const emailParam = searchParams.get("email");
    const nameParam = searchParams.get("name");
    
    if (emailParam) {
      setUserEmail(decodeURIComponent(emailParam));
    }
    if (nameParam) {
      setUserName(decodeURIComponent(nameParam));
    }

    // If no params, try to get from session
    if (!emailParam || !nameParam) {
      authClient.getSession().then(({ data }) => {
        if (data?.user) {
          if (!emailParam && data.user.email) {
            setUserEmail(data.user.email);
          }
          if (!nameParam && data.user.name) {
            setUserName(data.user.name);
          }
        }
      });
    }
  }, [searchParams]);

  const handleContinueToDashboard = () => {
    router.push("/dashboard/properties");
  };

  const handleVerifyEmail = () => {
    if (userEmail) {
      router.push(`/verify-email?email=${encodeURIComponent(userEmail)}`);
    } else {
      router.push("/verify-email");
    }
  };

  return (
    <LoginWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
                ¡Registro Exitoso!
              </CardTitle>
              <CardDescription className="text-lg">
                {userName ? (
                  <>¡Bienvenido a Brymar, <strong>{userName}</strong>!</>
                ) : (
                  "¡Bienvenido a Brymar!"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Tu cuenta ha sido creada exitosamente. Para comenzar a usar todas las funcionalidades de la plataforma, necesitas verificar tu dirección de correo electrónico.
                </p>
                
                {userEmail && (
                  <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Hemos enviado un código de verificación a <strong>{userEmail}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleVerifyEmail}
                  className={cn(
                    "w-full py-3 px-4 rounded-lg text-sm font-medium",
                    "bg-blue-600 hover:bg-blue-700 text-white",
                    "dark:bg-blue-600 dark:hover:bg-blue-700"
                  )}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Verificar Email Ahora
                </Button>

                <Button
                  variant="outline"
                  onClick={handleContinueToDashboard}
                  className={cn(
                    "w-full py-3 px-4 rounded-lg text-sm font-medium",
                    "border-gray-300 dark:border-gray-600",
                    "hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  <User className="mr-2 h-4 w-4" />
                  Continuar al Panel de Control
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Puedes verificar tu email más tarde desde la configuración de tu cuenta.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information Card */}
          <Card className="w-full">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  ¿Qué puedes hacer ahora?
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Explorar propiedades disponibles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Configurar tu perfil
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Acceder al panel de control
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    Verificar tu email para funciones completas
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LoginWrapper>
  );
};

export default RegistrationSuccessPage;