"use client";

export default function ErrorPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50">
			<div className="text-center">
				<div className="font-black text-9xl text-black">
					<h1 className="italic">Error</h1>
					<p className="mt-4 text-3xl">
						Algo salió mal. Por favor, inténtalo de nuevo.
					</p>
				</div>
			</div>
		</div>
	);
}
