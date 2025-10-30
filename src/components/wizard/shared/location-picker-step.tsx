"use client";

import { MapPin, Navigation, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export type LocationData = {
	location: string;
	coordinates?: {
		lat: number;
		lng: number;
	};
	address?: {
		street?: string;
		city: string;
		province: string;
		postalCode?: string;
		country: string;
		formattedAddress: string;
	};
	accessRoads?: string[];
	nearbyLandmarks?: string[];
};

type LocationPickerStepProps = {
	data: LocationData;
	onUpdate: (data: Partial<LocationData>) => void;
	title?: string;
	description?: string;
	showAccessRoads?: boolean;
	showLandmarks?: boolean;
	showCoordinates?: boolean;
	errors?: Record<string, string>;
};

export function LocationPickerStep({
	data,
	onUpdate,
	title = "Ubicación",
	description = "Proporciona la ubicación exacta",
	showAccessRoads = true,
	showLandmarks = true,
	showCoordinates = true,
	errors = {},
}: LocationPickerStepProps) {
	const [newAccessRoad, setNewAccessRoad] = useState("");
	const [newLandmark, setNewLandmark] = useState("");

	const handleLocationChange = (value: string) => {
		onUpdate({ location: value });
	};

	const handleAddressChange = (field: string, value: string) => {
		const currentAddress = data.address || {
			street: "",
			city: "",
			province: "",
			postalCode: "",
			country: "Dominican Republic",
			formattedAddress: "",
		};

		const updatedAddress = {
			...currentAddress,
			[field]: value,
		};

		// Update formatted address
		const parts = [
			updatedAddress.street,
			updatedAddress.city,
			updatedAddress.province,
			updatedAddress.country,
		].filter(Boolean);
		updatedAddress.formattedAddress = parts.join(", ");

		onUpdate({ address: updatedAddress });
	};

	const handleCoordinatesChange = (lat: string, lng: string) => {
		const latNum = Number.parseFloat(lat);
		const lngNum = Number.parseFloat(lng);

		if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
			onUpdate({ coordinates: undefined });
		} else {
			onUpdate({
				coordinates: {
					lat: latNum,
					lng: lngNum,
				},
			});
		}
	};

	const addAccessRoad = () => {
		if (newAccessRoad.trim()) {
			const currentRoads = data.accessRoads || [];
			onUpdate({ accessRoads: [...currentRoads, newAccessRoad.trim()] });
			setNewAccessRoad("");
		}
	};

	const removeAccessRoad = (index: number) => {
		const currentRoads = data.accessRoads || [];
		onUpdate({ accessRoads: currentRoads.filter((_, i) => i !== index) });
	};

	const addLandmark = () => {
		if (newLandmark.trim()) {
			const currentLandmarks = data.nearbyLandmarks || [];
			onUpdate({ nearbyLandmarks: [...currentLandmarks, newLandmark.trim()] });
			setNewLandmark("");
		}
	};

	const removeLandmark = (index: number) => {
		const currentLandmarks = data.nearbyLandmarks || [];
		onUpdate({
			nearbyLandmarks: currentLandmarks.filter((_, i) => i !== index),
		});
	};

	const searchLocation = () => {};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="mb-2 font-bold text-2xl">{title}</h2>
				<p className="text-muted-foreground">{description}</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MapPin className="h-5 w-5" />
						Dirección Principal
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="location">Ubicación General *</Label>
						<div className="flex gap-2">
							<Input
								className={errors.location ? "border-destructive" : ""}
								id="location"
								onChange={(e) => handleLocationChange(e.target.value)}
								placeholder="Ej: Punta Cana, La Altagracia"
								value={data.location || ""}
							/>
							<Button
								disabled={!data.location}
								onClick={searchLocation}
								type="button"
								variant="outline"
							>
								<Search className="h-4 w-4" />
							</Button>
						</div>
						{errors.location && (
							<p className="text-destructive text-sm">{errors.location}</p>
						)}
					</div>

					<Separator />

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="street">Calle/Dirección</Label>
							<Input
								id="street"
								onChange={(e) => handleAddressChange("street", e.target.value)}
								placeholder="Ej: Carretera Verón-Punta Cana"
								value={data.address?.street || ""}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="city">Ciudad *</Label>
							<Input
								className={errors["address.city"] ? "border-destructive" : ""}
								id="city"
								onChange={(e) => handleAddressChange("city", e.target.value)}
								placeholder="Ej: Punta Cana"
								value={data.address?.city || ""}
							/>
							{errors["address.city"] && (
								<p className="text-destructive text-sm">
									{errors["address.city"]}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="province">Provincia *</Label>
							<Input
								className={
									errors["address.province"] ? "border-destructive" : ""
								}
								id="province"
								onChange={(e) =>
									handleAddressChange("province", e.target.value)
								}
								placeholder="Ej: La Altagracia"
								value={data.address?.province || ""}
							/>
							{errors["address.province"] && (
								<p className="text-destructive text-sm">
									{errors["address.province"]}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="postalCode">Código Postal</Label>
							<Input
								id="postalCode"
								onChange={(e) =>
									handleAddressChange("postalCode", e.target.value)
								}
								placeholder="Ej: 23000"
								value={data.address?.postalCode || ""}
							/>
						</div>
					</div>

					{data.address?.formattedAddress && (
						<div className="rounded-lg bg-muted p-3">
							<Label className="font-medium text-sm">Dirección Completa:</Label>
							<p className="mt-1 text-muted-foreground text-sm">
								{data.address.formattedAddress}
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{showCoordinates && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Navigation className="h-5 w-5" />
							Coordenadas GPS
						</CardTitle>
						<CardDescription>
							Opcional: Proporciona las coordenadas exactas
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="latitude">Latitud</Label>
								<Input
									id="latitude"
									onChange={(e) =>
										handleCoordinatesChange(
											e.target.value,
											data.coordinates?.lng?.toString() || ""
										)
									}
									placeholder="Ej: 18.5601"
									step="any"
									type="number"
									value={data.coordinates?.lat || ""}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="longitude">Longitud</Label>
								<Input
									id="longitude"
									onChange={(e) =>
										handleCoordinatesChange(
											data.coordinates?.lat?.toString() || "",
											e.target.value
										)
									}
									placeholder="Ej: -68.3725"
									step="any"
									type="number"
									value={data.coordinates?.lng || ""}
								/>
							</div>
						</div>

						{data.coordinates && (
							<div className="mt-4 rounded-lg bg-muted p-3">
								<Label className="font-medium text-sm">Coordenadas:</Label>
								<p className="mt-1 text-muted-foreground text-sm">
									{data.coordinates.lat}, {data.coordinates.lng}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{showAccessRoads && (
				<Card>
					<CardHeader>
						<CardTitle>Vías de Acceso</CardTitle>
						<CardDescription>
							Describe las carreteras o caminos para llegar
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex gap-2">
							<Input
								onChange={(e) => setNewAccessRoad(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && addAccessRoad()}
								placeholder="Ej: Autopista del Este, Km 28"
								value={newAccessRoad}
							/>
							<Button
								disabled={!newAccessRoad.trim()}
								onClick={addAccessRoad}
								type="button"
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>

						{data.accessRoads && data.accessRoads.length > 0 && (
							<div className="space-y-2">
								<Label>Vías de acceso agregadas:</Label>
								<div className="flex flex-wrap gap-2">
									{data.accessRoads.map((road, index) => (
										<Badge
											className="cursor-pointer"
											key={index}
											onClick={() => removeAccessRoad(index)}
											variant="secondary"
										>
											{road}
											<X className="ml-1 h-3 w-3" />
										</Badge>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{showLandmarks && (
				<Card>
					<CardHeader>
						<CardTitle>Puntos de Referencia</CardTitle>
						<CardDescription>
							Lugares conocidos cerca de la ubicación
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex gap-2">
							<Input
								onChange={(e) => setNewLandmark(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && addLandmark()}
								placeholder="Ej: Hard Rock Hotel, Aeropuerto de Punta Cana"
								value={newLandmark}
							/>
							<Button
								disabled={!newLandmark.trim()}
								onClick={addLandmark}
								type="button"
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>

						{data.nearbyLandmarks && data.nearbyLandmarks.length > 0 && (
							<div className="space-y-2">
								<Label>Puntos de referencia agregados:</Label>
								<div className="flex flex-wrap gap-2">
									{data.nearbyLandmarks.map((landmark, index) => (
										<Badge
											className="cursor-pointer"
											key={index}
											onClick={() => removeLandmark(index)}
											variant="secondary"
										>
											{landmark}
											<X className="ml-1 h-3 w-3" />
										</Badge>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
