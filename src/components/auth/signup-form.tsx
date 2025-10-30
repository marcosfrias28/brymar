"use client";

import { signUpAction } from "@/lib/actions/auth";
import { AuthFormWrapper, AuthLink, useAuthFields } from "./auth-form-wrapper";

export function SignUpForm() {
	const { nameField, emailField, newPasswordField, confirmPasswordField } =
		useAuthFields();

	return (
		<AuthFormWrapper
			action={signUpAction}
			fields={[nameField, emailField, newPasswordField, confirmPasswordField]}
			footerContent={FooterContent}
			loadingText="Creando cuenta..."
			onSuccess={() => {
				// La redirección se maneja automáticamente por el wrapper
			}}
			submitText="Crear Cuenta"
			subtitle="Ingresa tus datos para crear una nueva cuenta"
			title="Crear Cuenta"
		/>
	);
}
const FooterContent = (
	<>
		¿Ya tienes cuenta? <AuthLink href="/sign-in">Iniciar Sesión</AuthLink>
	</>
);
