"use client";

import Link from "next/link";
import { Label } from "@/components/ui/label";
import { signInAction } from "@/lib/actions/auth";
import { AuthFormWrapper, AuthLink, useAuthFields } from "./auth-form-wrapper";

export function SignInForm() {
	const { emailField, passwordField } = useAuthFields();

	const passwordFieldWithLink = {
		...passwordField,
		label: (
			<div className="flex items-center">
				<Label htmlFor="password">Contraseña</Label>
				<Link
					className="ml-auto text-sm underline-offset-4 hover:underline"
					href="/forgot-password"
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
			action={signInAction}
			fields={[emailField, passwordFieldWithLink]}
			footerContent={footerContent}
			loadingText="Iniciando sesión..."
			submitText="Iniciar Sesión"
			subtitle="Ingresa tu email para acceder a tu cuenta"
			title="Iniciar Sesión"
		/>
	);
}
