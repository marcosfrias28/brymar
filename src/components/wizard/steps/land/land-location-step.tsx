"use client";

import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LandLocationData {
	location?: string;
	city?: string;
	state?: string;
	country?: string;
}

interface LandLocationStepProps {
	data: LandLocationData;
	onChange: (data: LandLocationData) => void;
	errors?: Record<string, string>;
}

export function LandLocationStep({
	data,
	onChange,
	errors,
}: LandLocationStepProps) {
	const handleChange = (field: keyof LandLocationData, value: string) => {
		onChange({ ...data, [field]: value });
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MapPin className="h-5 w-5" />
						Ubicación del Terreno
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="location">Ubicación</Label>
							<Input
								id="location"
								value={data.location || ""}
								onChange={(e) => handleChange("location", e.target.value)}
								placeholder="Ubicación del terreno"
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
