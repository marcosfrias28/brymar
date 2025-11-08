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

type LandLocationData = {
	location?: string;
	city?: string;
	state?: string;
	country?: string;
};

type LandLocationStepProps = {
	data: LandLocationData;
	onChange: (data: LandLocationData) => void;
	errors?: Record<string, string>;
};

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
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="location">Ubicación</Label>
							<Input
								id="location"
								onChange={(e) => handleChange("location", e.target.value)}
								placeholder="Ubicación del terreno"
								value={data.location || ""}
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
