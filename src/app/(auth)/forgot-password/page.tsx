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
			action={forgotPasswordAction}
			fields={[emailField]}
			footerContent={footerContent}
			loadingText="Enviando..."
			submitText="Enviar enlace"
			subtitle="Ingresa tu correo para recibir un enlace de recuperación"
			title="Recuperar Contraseña"
		/>
	);
};

export default ForgotPasswordPage;
