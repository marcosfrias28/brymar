"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type SimpleLocationData,
	SimpleLocationPicker,
} from "./simple-location-picker";

export function LocationTest() {
	const [locationData, setLocationData] = useState<SimpleLocationData>({
		location: "",
		coordinates: undefined,
		address: undefined,
	});

	return (
		<div className="mx-auto max-w-4xl space-y-6 p-6">
			<Card>
				<CardHeader>
					<CardTitle>Test de Ubicación Simple</CardTitle>
				</CardHeader>
				<CardContent>
					<SimpleLocationPicker
						data={locationData}
						description="Prueba el selector de ubicación simple"
						onUpdate={(data) => {
							setLocationData((prev) => ({ ...prev, ...data }));
						}}
						title="Ubicación de Prueba"
					/>

					<div className="mt-6 rounded-lg bg-muted p-4">
						<h4 className="mb-2 font-medium">Datos actuales:</h4>
						<pre className="overflow-auto text-xs">
							{JSON.stringify(locationData, null, 2)}
						</pre>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
