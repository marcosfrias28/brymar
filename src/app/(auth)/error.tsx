"use client";

export default function AuthErrorPage() {
	return (
		<div className="text-center">
			<h1 className="text-4xl font-bold mb-4">404</h1>
			<p className="text-muted-foreground mb-6">Página no encontrada</p>
			<a href="/sign-in" className="text-primary hover:underline">
				Volver al inicio de sesión
			</a>
		</div>
	);
}
