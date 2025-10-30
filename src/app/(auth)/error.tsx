"use client";

export default function AuthErrorPage() {
	return (
		<div className="text-center">
			<h1 className="mb-4 font-bold text-4xl">404</h1>
			<p className="mb-6 text-muted-foreground">Página no encontrada</p>
			<a className="text-primary hover:underline" href="/sign-in">
				Volver al inicio de sesión
			</a>
		</div>
	);
}
