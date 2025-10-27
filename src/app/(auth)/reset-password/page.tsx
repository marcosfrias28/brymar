"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
	AuthFormWrapper,
	AuthLink,
	useAuthFields,
} from "@/components/auth/auth-form-wrapper";
import { resetPasswordAction } from "@/lib/actions/auth";

const ResetPasswordPage = () => {
	const searchParams = useSearchParams();
	const token = searchParams?.get("token");
	const { passwordField, confirmPasswordField } = useAuthFields();

	if (!token) {
		return (
			<div className="flex flex-col gap-6 text-center">
				<h1 className="text-2xl font-bold text-destructive">Token Inválido</h1>
				<p className="text-balance text-sm text-muted-foreground">
					El enlace de restablecimiento de contraseña no es válido o ha
					expirado.
				</p>
				<Link href="/forgot-password" className="underline underline-offset-4">
					Solicitar nuevo enlace
				</Link>
			</div>
		);
	}

	const footerContent = (
		<div className="text-center text-sm">
			¿Recordaste tu contraseña?{" "}
			<AuthLink href="/sign-in">Iniciar sesión</AuthLink>
		</div>
	);

	// Use the action directly since it now has the correct signature

	return (
		<AuthFormWrapper
			title="Restablecer Contraseña"
			subtitle="Ingresa tu nueva contraseña"
			action={resetPasswordAction}
			fields={[passwordField, confirmPasswordField]}
			submitText="Restablecer Contraseña"
			loadingText="Restableciendo..."
			footerContent={footerContent}
			hiddenFields={[{ name: "token", value: token }]}
		/>
	);
};

export default ResetPasswordPage;
