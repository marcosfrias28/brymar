"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";

type SectionsManagerProps = {
	page: "home" | "contact";
};

export function SectionsManager({ page }: SectionsManagerProps) {
	return (
		<div className="space-y-4">
			<Alert>
				<AlertDescription>
					{page === "home"
						? "Gestión de secciones de la página principal - En desarrollo"
						: "Gestión de información de contacto - En desarrollo"}
				</AlertDescription>
			</Alert>
		</div>
	);
}
