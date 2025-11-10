"use client";

import { CheckCircle, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";

const RegistrationSuccessPage = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");

	useEffect(() => {
		// Get email and username from URL params or session
		const emailParam = searchParams?.get("email");
		const usernameParam = searchParams?.get("username");

		if (emailParam) {
			setEmail(decodeURIComponent(emailParam));
		}
		if (usernameParam) {
			setUsername(decodeURIComponent(usernameParam));
		}

		// If no params, try to get from session
		if (!(emailParam && usernameParam)) {
			authClient.getSession().then(({ data }) => {
				if (data?.user) {
					if (!emailParam && data.user.email) {
						setEmail(data.user.email);
					}
					if (!usernameParam && data.user.name) {
						setUsername(data.user.name);
					}
				}
			});
		}
	}, [searchParams]);

	const handleGoToDashboard = () => {
		router.push("/dashboard/properties");
	};

	const handleVerifyEmail = () => {
		router.push(`/verify-email?email=${encodeURIComponent(email)}`);
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mb-4 flex items-center justify-center">
						<div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
							<CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
						</div>
					</div>
					<CardTitle className="font-bold text-2xl text-green-600 dark:text-green-400">
						¡Registro Exitoso!
					</CardTitle>
					<CardDescription>
						{username ? (
							<>
								¡Bienvenido a Marbry, <strong>{username}</strong>!
							</>
						) : (
							"¡Bienvenido a Marbry!"
						)}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-4 text-center">
						<p className="text-muted-foreground text-sm">
							Tu cuenta ha sido creada exitosamente. Para comenzar a usar todas
							las funcionalidades de la plataforma, necesitas verificar tu
							dirección de correo electrónico.
						</p>

						{email && (
							<div className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
								<Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
								<span className="text-blue-700 text-sm dark:text-blue-300">
									Hemos enviado un código de verificación a{" "}
									<strong>{email}</strong>
								</span>
							</div>
						)}
					</div>

					<div className="space-y-3">
						<Button className="w-full" onClick={handleVerifyEmail}>
							<Mail className="mr-2 h-4 w-4" />
							Verificar Email Ahora
						</Button>

						<Button
							className="w-full"
							onClick={handleGoToDashboard}
							variant="outline"
						>
							Continuar al Panel de Control
						</Button>
					</div>

					<div className="text-center">
						<p className="text-muted-foreground text-xs">
							Puedes verificar tu email más tarde desde la configuración de tu
							cuenta.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default RegistrationSuccessPage;
