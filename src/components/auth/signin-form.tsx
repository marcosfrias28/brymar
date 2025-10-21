"use client";

import { signInAction } from "@/lib/actions/auth";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuthFields, AuthLink, AuthFormWrapper } from "./auth-form-wrapper";

export function SignInForm() {
  const { emailField, passwordField } = useAuthFields();

  const passwordFieldWithLink = {
    ...passwordField,
    label: (
      <div className="flex items-center">
        <Label htmlFor="password">Contraseña</Label>
        <Link
          href="/forgot-password"
          className="ml-auto text-sm underline-offset-4 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    ),
  };

  const footerContent = (
    <>
      ¿No tienes cuenta? <AuthLink href="/sign-up">Registrarse</AuthLink>
    </>
  );

  return (
    <AuthFormWrapper
      title="Iniciar Sesión"
      subtitle="Ingresa tu email para acceder a tu cuenta"
      action={signInAction}
      fields={[emailField, passwordFieldWithLink]}
      submitText="Iniciar Sesión"
      loadingText="Iniciando sesión..."
      footerContent={footerContent}
    />
  );
}
