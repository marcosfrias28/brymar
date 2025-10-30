"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { useVerifyOTP } from "@/hooks/use-auth-actions";
import { sendVerificationOTPAction } from "@/lib/actions/auth";
import { authClient } from "@/lib/auth/auth-client";

const VerifyEmailPage = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [email, setEmail] = useState<string | null>(null);
	const [isResending, setIsResending] = useState(false);
	const [session, setSession] = useState<unknown>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Use the verify OTP hook that handles query invalidation
	const verifyOTPMutation = useVerifyOTP();

	// Verificar sesión activa y obtener email
	useEffect(() => {
		const checkSession = async () => {
			try {
				const sessionData = await authClient.getSession();

				if (!sessionData?.data?.user) {
					router.push("/sign-in");
					return;
				}

				setSession(sessionData);

				// Obtener email de la URL o de la sesión
				const urlEmail = searchParams?.get("email");
				const userEmail = sessionData?.data?.user.email;

				if (urlEmail && urlEmail === userEmail) {
					setEmail(urlEmail);
				} else if (userEmail) {
					setEmail(userEmail);
					// Actualizar URL con el email correcto
					const newUrl = new URL(window.location.href);
					newUrl.searchParams.set("email", userEmail);
					window.history.replaceState({}, "", newUrl.toString());
				} else {
					toast.error("No se pudo obtener el email del usuario");
					router.push("/sign-in");
					return;
				}
			} catch (_error) {
				router.push("/sign-in");
			} finally {
				setIsLoading(false);
			}
		};

		checkSession();
	}, [searchParams, router]);

	// Función para reenviar código OTP
	const handleResendCode = async () => {
		if (!email || isResending) {
			return;
		}

		setIsResending(true);
		try {
			const formData = new FormData();
			formData.append("email", email);

			const result = await sendVerificationOTPAction(formData);

			if (result.success) {
				toast.success("Código reenviado exitosamente");
			} else {
				toast.error(result.error || "Error al reenviar el código");
			}
		} catch (_error) {
			toast.error("Error al reenviar el código");
		} finally {
			setIsResending(false);
		}
	};

	// Función personalizada para manejar la verificación usando el hook
	const handleVerifyOTP = async (_prevState: unknown, formData: FormData) => {
		if (!email) {
			return { error: "Email no disponible", success: false };
		}
		formData.append("email", email);

		try {
			const result = await verifyOTPMutation.mutateAsync({
				email,
				otp: formData.get("otp") as string,
			});

			if (result.success) {
				// Wait a bit for the query to refetch before redirecting
				await new Promise((resolve) => setTimeout(resolve, 500));
				// Redirect to profile after successful verification
				router.push("/profile");
			}

			return result;
		} catch (error: any) {
			return {
				success: false,
				error: error.message || "Error al verificar el código",
			};
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
					<p>Verificando sesión...</p>
				</div>
			</div>
		);
	}

	if (!(email && session)) {
		return null; // El useEffect manejará la redirección
	}

	const otpField = {
		id: "otp",
		name: "otp",
		type: "text" as const,
		label: "Código de Verificación",
		placeholder: "Ingresa el código de 6 dígitos",
		required: true,
		maxLength: 6,
		minLength: 6,
		pattern: "[0-9]{6}",
		autoComplete: "one-time-code",
	};

	return (
		<AuthFormWrapper
			action={handleVerifyOTP}
			fields={[otpField]}
			footerContent={
				<p className="text-center text-muted-foreground text-sm">
					¿No recibiste el código?{" "}
					<button
						className="text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
						disabled={isResending}
						onClick={handleResendCode}
						type="button"
					>
						{isResending ? "Reenviando..." : "Reenviar código"}
					</button>
				</p>
			}
			isLoading={verifyOTPMutation.isPending}
			loadingText="Verificando código..."
			onError={(error) => {
				toast.error(error);
			}}
			onSuccess={() => {
				// This won't be called since we're handling success in the mutation
			}}
			submitText="Verificar Código"
			subtitle={`Ingresa el código de 6 dígitos que enviamos a ${email}`}
			title="Verificar Email"
		/>
	);
};

export default VerifyEmailPage;
