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

export type SimpleLocationData = {
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
};

type SimpleLocationPickerProps = {
	data: SimpleLocationData;
	onUpdate: (data: Partial<SimpleLocationData>) => void;
	title?: string;
	description?: string;
	errors?: Record<string, string>;
};

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
					`${data.location}, Dominican Republic`
				)}&limit=1&countrycodes=do&addressdetails=1&accept-language=es`,
				{
					headers: {
						"User-Agent": "Brymar-Inmobiliaria/1.0",
					},
				}
			);

			if (!response.ok) {
				throw new Error("Error en el servicio de búsqueda");
			}

			const results = await response.json();

			if (!results || results.length === 0) {
				throw new Error("No se encontraron resultados para esta ubicación");
			}

			const result = results[0];
			const lat = Number.parseFloat(result.lat);
			const lng = Number.parseFloat(result.lon);

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
			setGeocodingError(
				error instanceof Error ? error.message : "Error al buscar la ubicación"
			);
		} finally {
			setIsGeocoding(false);
		}
	};

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
						Ubicación General
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="location">Ubicación *</Label>
						<div className="flex gap-2">
							<Input
								className={errors.location ? "border-destructive" : ""}
								id="location"
								onChange={(e) => handleLocationChange(e.target.value)}
								placeholder="Ej: Punta Cana, La Altagracia"
								value={data.location || ""}
							/>
							<Button
								disabled={!data.location || isGeocoding}
								onClick={searchLocation}
								type="button"
								variant="outline"
							>
								{isGeocoding ? (
									<div className="h-4 w-4 animate-spin rounded-full border-primary border-b-2" />
								) : (
									<Search className="h-4 w-4" />
								)}
							</Button>
						</div>
						{errors.location && (
							<p className="text-destructive text-sm">{errors.location}</p>
						)}
						{geocodingError && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{geocodingError}</AlertDescription>
							</Alert>
						)}
					</div>

					{data.coordinates && (
						<div className="rounded-lg border border-green-200 bg-green-50 p-3">
							<div className="flex items-center gap-2 text-green-700">
								<CheckCircle className="h-4 w-4" />
								<span className="font-medium text-sm">
									Ubicación encontrada
								</span>
							</div>
							<p className="mt-1 text-green-600 text-sm">
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
							<Select
								onValueChange={(value) =>
									handleAddressChange("province", value)
								}
								value={data.address?.province || ""}
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

			<Card>
				<CardHeader>
					<CardTitle>Coordenadas GPS (Opcional)</CardTitle>
					<CardDescription>
						Ingresa las coordenadas exactas si las conoces
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
				</CardContent>
			</Card>
		</div>
	);
}
