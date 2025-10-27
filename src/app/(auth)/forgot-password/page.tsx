"use client";

import {
	AuthFormWrapper,
	AuthLink,
	useAuthFields,
} from "@/components/auth/auth-form-wrapper";
import { forgotPasswordAction } from "@/lib/actions/auth";

const ForgotPasswordPage = () => {
	const { emailField } = useAuthFields();

	const footerContent = (
		<div className="text-center text-sm">
			¿Ya tienes cuenta? <AuthLink href="/sign-in">Iniciar sesión</AuthLink>
		</div>
	);

	// Use the action directly since it now has the correct signature

	return (
		<AuthFormWrapper
			title="Recuperar Contraseña"
			subtitle="Ingresa tu correo para recibir un enlace de recuperación"
			action={forgotPasswordAction}
			fields={[emailField]}
			submitText="Enviar enlace"
			loadingText="Enviando..."
			footerContent={footerContent}
		/>
	);
};

export default ForgotPasswordPage;
