"use client";

import { AuthFormWrapper, useAuthFields, AuthLink } from "./auth-form-wrapper";
import { signUp } from "@/app/actions/auth-actions";

export function SignUpForm() {
  const { nameField, emailField, newPasswordField, confirmPasswordField } = useAuthFields();



  return (
    <AuthFormWrapper
      title="Crear Cuenta"
      subtitle="Ingresa tus datos para crear una nueva cuenta"
      action={signUp}
      fields={[nameField, emailField, newPasswordField, confirmPasswordField]}
      submitText="Crear Cuenta"
      loadingText="Creando cuenta..."
      footerContent={FooterContent}
      onSuccess={() => {
        // La redirección se maneja automáticamente por el wrapper
      }}
    />
  );
}
  const FooterContent = (
    <>
      ¿Ya tienes cuenta?{" "}
      <AuthLink href="/sign-in">Iniciar Sesión</AuthLink>
    </>
  );