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
				<h1 className="font-bold text-2xl text-destructive">Token Inválido</h1>
				<p className="text-balance text-muted-foreground text-sm">
					El enlace de restablecimiento de contraseña no es válido o ha
					expirado.
				</p>
				<Link className="underline underline-offset-4" href="/forgot-password">
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
			action={resetPasswordAction}
			fields={[passwordField, confirmPasswordField]}
			footerContent={footerContent}
			hiddenFields={[{ name: "token", value: token }]}
			loadingText="Restableciendo..."
			submitText="Restablecer Contraseña"
			subtitle="Ingresa tu nueva contraseña"
			title="Restablecer Contraseña"
		/>
	);
};

export default ResetPasswordPage;
