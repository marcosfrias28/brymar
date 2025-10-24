"use client";

import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PropertyLocationData {
	address?: string;
	city?: string;
	state?: string;
	country?: string;
}

interface PropertyLocationStepProps {
	data: PropertyLocationData;
	onChange: (data: PropertyLocationData) => void;
	errors?: Record<string, string>;
}

export function PropertyLocationStep({
	data,
	onChange,
	errors,
}: PropertyLocationStepProps) {
	const handleChange = (field: keyof PropertyLocationData, value: string) => {
		onChange({ ...data, [field]: value });
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MapPin className="h-5 w-5" />
						Ubicación de la Propiedad
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="address">Dirección</Label>
							<Input
								id="address"
								value={data.address || ""}
								onChange={(e) => handleChange("address", e.target.value)}
								placeholder="Calle y número"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="city">Ciudad</Label>
							<Input
								id="city"
								value={data.city || ""}
								onChange={(e) => handleChange("city", e.target.value)}
								placeholder="Ciudad"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="state">Provincia/Estado</Label>
							<Input
								id="state"
								value={data.state || ""}
								onChange={(e) => handleChange("state", e.target.value)}
								placeholder="Provincia o Estado"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="country">País</Label>
							<Input
								id="country"
								value={data.country || ""}
								onChange={(e) => handleChange("country", e.target.value)}
								placeholder="País"
							/>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
