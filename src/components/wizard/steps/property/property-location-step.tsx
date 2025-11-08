"use client";

import { MapPin } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PropertyLocationData = {
	address?: string;
	city?: string;
	state?: string;
	country?: string;
};

type PropertyLocationStepProps = {
	data: PropertyLocationData;
	onChange: (data: PropertyLocationData) => void;
	errors?: Record<string, string>;
};

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
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="address">Dirección</Label>
							<Input
								id="address"
								onChange={(e) => handleChange("address", e.target.value)}
								placeholder="Calle y número"
								value={data.address || ""}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="city">Ciudad</Label>
							<Input
								id="city"
								onChange={(e) => handleChange("city", e.target.value)}
								placeholder="Ciudad"
								value={data.city || ""}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="state">Provincia/Estado</Label>
							<Input
								id="state"
								onChange={(e) => handleChange("state", e.target.value)}
								placeholder="Provincia o Estado"
								value={data.state || ""}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="country">País</Label>
							<Input
								id="country"
								onChange={(e) => handleChange("country", e.target.value)}
								placeholder="País"
								value={data.country || ""}
							/>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
