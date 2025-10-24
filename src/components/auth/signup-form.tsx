"use client";

import { signUpAction } from "@/lib/actions/auth";
import { AuthFormWrapper, AuthLink, useAuthFields } from "./auth-form-wrapper";

export function SignUpForm() {
	const { nameField, emailField, newPasswordField, confirmPasswordField } =
		useAuthFields();

	return (
		<AuthFormWrapper
			title="Crear Cuenta"
			subtitle="Ingresa tus datos para crear una nueva cuenta"
			action={signUpAction}
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
		¿Ya tienes cuenta? <AuthLink href="/sign-in">Iniciar Sesión</AuthLink>
	</>
);
