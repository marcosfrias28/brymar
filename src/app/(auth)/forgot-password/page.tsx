"use client";

import React from "react";
import { forgotPassword } from '@/lib/actions/auth-actions';
import { useAuthFields, AuthLink, AuthFormWrapper } from '@/components/auth/auth-form-wrapper';

const ForgotPasswordPage = () => {
  const { emailField } = useAuthFields();

  const footerContent = (
    <div className="text-center text-sm">
      ¿Ya tienes cuenta?{" "}
      <AuthLink href="/sign-in">Iniciar sesión</AuthLink>
    </div>
  );

  return (
    <AuthFormWrapper
      title="Recuperar Contraseña"
      subtitle="Ingresa tu correo para recibir un enlace de recuperación"
      action={forgotPassword}
      fields={[emailField]}
      submitText="Enviar enlace"
      loadingText="Enviando..."
      footerContent={footerContent}
    />
  );
};

export default ForgotPasswordPage;