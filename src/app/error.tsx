"use client";

export default function ErrorPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="text-center">
				<div className="text-black text-9xl font-black">
					<h1 className="italic">Error</h1>
					<p className="text-3xl mt-4">
						Algo salió mal. Por favor, inténtalo de nuevo.
					</p>
				</div>
			</div>
		</div>
	);
}
