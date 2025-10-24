"use client";

import { AlertCircle, CheckCircle, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DOMINICAN_PROVINCES } from "@/lib/services/map-service";

export interface SimpleLocationData {
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
}

interface SimpleLocationPickerProps {
	data: SimpleLocationData;
	onUpdate: (data: Partial<SimpleLocationData>) => void;
	title?: string;
	description?: string;
	errors?: Record<string, string>;
}

export function SimpleLocationPicker({
	data,
	onUpdate,
	title = "Ubicación",
	description = "Proporciona la ubicación de la propiedad",
	errors = {},
}: SimpleLocationPickerProps) {
	const [isGeocoding, setIsGeocoding] = useState(false);
	const [geocodingError, setGeocodingError] = useState<string | null>(null);

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
		const latNum = parseFloat(lat);
		const lngNum = parseFloat(lng);

		if (!Number.isNaN(latNum) && !Number.isNaN(lngNum)) {
			onUpdate({
				coordinates: {
					lat: latNum,
					lng: lngNum,
				},
			});
		} else {
			onUpdate({ coordinates: undefined });
		}
	};

	const searchLocation = async () => {
		if (!data.location) {
			setGeocodingError("Ingresa una ubicación para buscar");
			return;
		}

		setIsGeocoding(true);
		setGeocodingError(null);

		try {
			// Simple geocoding using Nominatim API
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
					`${data.location}, Dominican Republic`,
				)}&limit=1&countrycodes=do&addressdetails=1&accept-language=es`,
				{
					headers: {
						"User-Agent": "Brymar-Inmobiliaria/1.0",
					},
				},
			);

			if (!response.ok) {
				throw new Error("Error en el servicio de búsqueda");
			}

			const results = await response.json();

			if (!results || results.length === 0) {
				throw new Error("No se encontraron resultados para esta ubicación");
			}

			const result = results[0];
			const lat = parseFloat(result.lat);
			const lng = parseFloat(result.lon);

			// Update coordinates
			onUpdate({
				coordinates: { lat, lng },
			});

			// Update address if available
			if (result.address) {
				const addressComponents = result.address;
				const street =
					[
						addressComponents.house_number,
						addressComponents.road || addressComponents.street,
					]
						.filter(Boolean)
						.join(" ") ||
					addressComponents.neighbourhood ||
					"Dirección no disponible";

				const city =
					addressComponents.city ||
					addressComponents.town ||
					addressComponents.village ||
					addressComponents.municipality ||
					"Ciudad no disponible";

				const province =
					addressComponents.state ||
					addressComponents.province ||
					"Provincia no disponible";

				onUpdate({
					address: {
						street,
						city,
						province,
						postalCode: addressComponents.postcode,
						country: "Dominican Republic",
						formattedAddress: result.display_name,
					},
				});
			}

			setGeocodingError(null);
		} catch (error) {
			console.error("Geocoding error:", error);
			setGeocodingError(
				error instanceof Error ? error.message : "Error al buscar la ubicación",
			);
		} finally {
			setIsGeocoding(false);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold mb-2">{title}</h2>
				<p className="text-muted-foreground">{description}</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MapPin className="h-5 w-5" />
						Ubicación General
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="location">Ubicación *</Label>
						<div className="flex gap-2">
							<Input
								id="location"
								value={data.location || ""}
								onChange={(e) => handleLocationChange(e.target.value)}
								placeholder="Ej: Punta Cana, La Altagracia"
								className={errors.location ? "border-destructive" : ""}
							/>
							<Button
								type="button"
								variant="outline"
								onClick={searchLocation}
								disabled={!data.location || isGeocoding}
							>
								{isGeocoding ? (
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
								) : (
									<Search className="h-4 w-4" />
								)}
							</Button>
						</div>
						{errors.location && (
							<p className="text-sm text-destructive">{errors.location}</p>
						)}
						{geocodingError && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{geocodingError}</AlertDescription>
							</Alert>
						)}
					</div>

					{data.coordinates && (
						<div className="p-3 bg-green-50 border border-green-200 rounded-lg">
							<div className="flex items-center gap-2 text-green-700">
								<CheckCircle className="h-4 w-4" />
								<span className="text-sm font-medium">
									Ubicación encontrada
								</span>
							</div>
							<p className="text-sm text-green-600 mt-1">
								Coordenadas: {data.coordinates.lat.toFixed(4)},{" "}
								{data.coordinates.lng.toFixed(4)}
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Dirección Detallada</CardTitle>
					<CardDescription>
						Completa la información de la dirección
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="street">Calle/Dirección</Label>
							<Input
								id="street"
								value={data.address?.street || ""}
								onChange={(e) => handleAddressChange("street", e.target.value)}
								placeholder="Ej: Carretera Verón-Punta Cana"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="city">Ciudad *</Label>
							<Input
								id="city"
								value={data.address?.city || ""}
								onChange={(e) => handleAddressChange("city", e.target.value)}
								placeholder="Ej: Punta Cana"
								className={errors["address.city"] ? "border-destructive" : ""}
							/>
							{errors["address.city"] && (
								<p className="text-sm text-destructive">
									{errors["address.city"]}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="province">Provincia *</Label>
							<Select
								value={data.address?.province || ""}
								onValueChange={(value) =>
									handleAddressChange("province", value)
								}
							>
								<SelectTrigger
									className={
										errors["address.province"] ? "border-destructive" : ""
									}
								>
									<SelectValue placeholder="Selecciona una provincia" />
								</SelectTrigger>
								<SelectContent>
									{DOMINICAN_PROVINCES.map((province) => (
										<SelectItem key={province} value={province}>
											{province}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors["address.province"] && (
								<p className="text-sm text-destructive">
									{errors["address.province"]}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="postalCode">Código Postal</Label>
							<Input
								id="postalCode"
								value={data.address?.postalCode || ""}
								onChange={(e) =>
									handleAddressChange("postalCode", e.target.value)
								}
								placeholder="Ej: 23000"
							/>
						</div>
					</div>

					{data.address?.formattedAddress && (
						<div className="p-3 bg-muted rounded-lg">
							<Label className="text-sm font-medium">Dirección Completa:</Label>
							<p className="text-sm text-muted-foreground mt-1">
								{data.address.formattedAddress}
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Coordenadas GPS (Opcional)</CardTitle>
					<CardDescription>
						Ingresa las coordenadas exactas si las conoces
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="latitude">Latitud</Label>
							<Input
								id="latitude"
								type="number"
								step="any"
								value={data.coordinates?.lat || ""}
								onChange={(e) =>
									handleCoordinatesChange(
										e.target.value,
										data.coordinates?.lng?.toString() || "",
									)
								}
								placeholder="Ej: 18.5601"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="longitude">Longitud</Label>
							<Input
								id="longitude"
								type="number"
								step="any"
								value={data.coordinates?.lng || ""}
								onChange={(e) =>
									handleCoordinatesChange(
										data.coordinates?.lat?.toString() || "",
										e.target.value,
									)
								}
								placeholder="Ej: -68.3725"
							/>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
