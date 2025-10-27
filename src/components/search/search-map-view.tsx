"use client";

import { ArrowLeft, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { cn } from "@/lib/utils";

// Importación dinámica de Leaflet para evitar problemas de SSR
const MapContainer = dynamic(
	() => import("react-leaflet").then((mod) => mod.MapContainer),
	{ ssr: false },
);

const TileLayer = dynamic(
	() => import("react-leaflet").then((mod) => mod.TileLayer),
	{ ssr: false },
);

const Marker = dynamic(
	() => import("react-leaflet").then((mod) => mod.Marker),
	{ ssr: false },
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
	ssr: false,
});

// Tipos para las propiedades y terrenos
interface PropertyLocation {
	id: string;
	title: string;
	price: { amount: number; currency: string } | number;
	location?: string;
	address?: {
		street: string;
		city: string;
		state: string;
		country: string;
		coordinates?: {
			latitude: number;
			longitude: number;
		};
	};
	coordinates?: {
		lat: number;
		lng: number;
	};
	mainImage?: string;
	images?: string[];
	type?: string;
	area?: number;
	features?: {
		area: number;
		bedrooms?: number;
		bathrooms?: number;
	};
}

interface SearchMapViewProps {
	properties: PropertyLocation[];
	className?: string;
	onViewChange?: (view: "results" | "map") => void;
	currentView?: "results" | "map";
}

// Componente de carga del mapa
function MapLoading() {
	return (
		<div className="h-full flex items-center justify-center bg-muted">
			<div className="flex flex-col items-center space-y-4">
				<LoadingSpinner />
				<p className="text-muted-foreground">Cargando mapa...</p>
			</div>
		</div>
	);
}

// Componente de error del mapa
function MapError({ onRetry }: { onRetry?: () => void }) {
	return (
		<div className="h-full flex items-center justify-center bg-muted">
			<div className="text-center space-y-4">
				<div className="mx-auto w-16 h-16 bg-background rounded-full flex items-center justify-center">
					<MapPin className="h-8 w-8 text-muted-foreground" />
				</div>
				<div>
					<h3 className="text-lg font-semibold">Error al cargar el mapa</h3>
					<p className="text-muted-foreground mt-1">
						No se pudo cargar el mapa. Verifica tu conexión a internet.
					</p>
					{onRetry && (
						<Button onClick={onRetry} className="mt-4">
							Reintentar
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

// Componente principal del mapa
export function SearchMapView({
	properties,
	className,
	onViewChange,
	currentView = "map",
}: SearchMapViewProps) {
	const [isMapReady, setIsMapReady] = React.useState(false);
	const [mapError, setMapError] = React.useState(false);

	// Procesar propiedades con coordenadas válidas
	const propertiesWithCoords = useMemo(() => {
		return properties
			.filter((property) => {
				// Si tiene coordenadas explícitas, las usa
				if (property.coordinates?.lat && property.coordinates?.lng) {
					return true;
				}
				// Si tiene coordenadas en address (formato de propiedades)
				if (
					property.address?.coordinates?.latitude &&
					property.address?.coordinates?.longitude
				) {
					return true;
				}
				return false;
			})
			.map((property) => {
				// Normalizar coordenadas
				let normalizedCoords;
				if (property.coordinates?.lat && property.coordinates?.lng) {
					normalizedCoords = property.coordinates;
				} else if (
					property.address?.coordinates?.latitude &&
					property.address?.coordinates?.longitude
				) {
					normalizedCoords = {
						lat: property.address.coordinates.latitude,
						lng: property.address.coordinates.longitude,
					};
				}

				return {
					...property,
					// Normalizar coordenadas
					coordinates: normalizedCoords,
					// Normalizar el precio
					normalizedPrice:
						typeof property.price === "number"
							? property.price
							: property.price?.amount || 0,
					// Normalizar el área
					normalizedArea: property.area || property.features?.area || 0,
					// Normalizar la ubicación
					normalizedLocation:
						property.location ||
						(property.address
							? `${property.address.city}, ${property.address.state}`
							: ""),
					// Normalizar imagen
					normalizedImage:
						property.mainImage ||
						(property.images && property.images.length > 0
							? property.images[0]
							: undefined),
				};
			});
	}, [properties]);

	// Calcular el centro del mapa basado en las propiedades
	const mapCenter = useMemo(() => {
		if (propertiesWithCoords.length === 0) {
			// Centro por defecto (República Dominicana)
			return { lat: 18.7357, lng: -70.1627 }; // Santo Domingo
		}

		const avgLat =
			propertiesWithCoords.reduce(
				(sum, prop) => sum + (prop.coordinates?.lat || 0),
				0,
			) / propertiesWithCoords.length;

		const avgLng =
			propertiesWithCoords.reduce(
				(sum, prop) => sum + (prop.coordinates?.lng || 0),
				0,
			) / propertiesWithCoords.length;

		return { lat: avgLat, lng: avgLng };
	}, [propertiesWithCoords]);

	// Manejar errores del mapa
	const _handleMapError = () => {
		setMapError(true);
	};

	// Reintentar cargar el mapa
	const handleRetry = () => {
		setMapError(false);
		setIsMapReady(false);
	};

	// Efecto para simular la carga del mapa
	React.useEffect(() => {
		const timer = setTimeout(() => {
			setIsMapReady(true);
		}, 1000);

		return () => clearTimeout(timer);
	}, []);

	if (mapError) {
		return (
			<div className={cn("h-full flex flex-col", className)}>
				{/* Header */}
				<div className="flex-shrink-0 border-b bg-background">
					<div className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onViewChange?.("results")}
								>
									<ArrowLeft className="h-4 w-4 mr-2" />
									Volver a resultados
								</Button>
							</div>
							<Badge variant="secondary">Mapa de Propiedades</Badge>
						</div>
					</div>
				</div>

				{/* Error Content */}
				<div className="flex-1">
					<MapError onRetry={handleRetry} />
				</div>
			</div>
		);
	}

	return (
		<div className={cn("h-full flex flex-col", className)}>
			{/* Header */}
			<div className="flex-shrink-0 border-b bg-background">
				<div className="p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onViewChange?.("results")}
							>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Volver a resultados
							</Button>
							<h2 className="text-lg font-semibold">Mapa de Propiedades</h2>
						</div>
						<Badge variant="secondary">
							Mostrando {propertiesWithCoords.length} propiedades en el mapa
						</Badge>
					</div>
				</div>
			</div>

			{/* Map Content */}
			<div className="flex-1 relative">
				{!isMapReady ? (
					<MapLoading />
				) : (
					<MapContainer
						center={[mapCenter.lat, mapCenter.lng]}
						zoom={propertiesWithCoords.length > 0 ? 12 : 8}
						style={{ height: "100%", width: "100%" }}
						className="z-0"
					>
						<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>

						{propertiesWithCoords.map((property) => (
							<Marker
								key={property.id}
								position={[
									property.coordinates?.lat || 0,
									property.coordinates?.lng || 0,
								]}
							>
								<Popup>
									<PropertyPopup property={property} />
								</Popup>
							</Marker>
						))}
					</MapContainer>
				)}

				{/* Overlay con información */}
				{isMapReady && propertiesWithCoords.length === 0 && (
					<div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
						<Card className="max-w-md">
							<CardContent className="p-6 text-center">
								<MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">
									No hay propiedades con ubicación
								</h3>
								<p className="text-muted-foreground">
									Las propiedades encontradas no tienen coordenadas de ubicación
									disponibles para mostrar en el mapa.
								</p>
								<Button
									onClick={() => onViewChange?.("results")}
									className="mt-4"
								>
									Ver resultados en lista
								</Button>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}

// Componente para el popup de cada propiedad
function PropertyPopup({ property }: { property: any }) {
	return (
		<div className="min-w-64 max-w-sm">
			{/* Imagen */}
			{property.normalizedImage && (
				<div className="mb-3">
					<img
						src={property.normalizedImage}
						alt={property.title}
						className="w-full h-32 object-cover rounded"
					/>
				</div>
			)}

			{/* Contenido */}
			<div className="space-y-2">
				<h4 className="font-semibold text-sm line-clamp-2">{property.title}</h4>

				<div className="flex items-center justify-between">
					<span className="text-lg font-bold text-primary">
						${property.normalizedPrice.toLocaleString()}
					</span>
					{property.type && (
						<Badge variant="secondary" className="text-xs">
							{property.type}
						</Badge>
					)}
				</div>

				<div className="flex items-center gap-4 text-xs text-muted-foreground">
					{property.normalizedArea > 0 && (
						<span>{property.normalizedArea.toLocaleString()} m²</span>
					)}
					{property.features?.bedrooms && (
						<span>{property.features.bedrooms} hab.</span>
					)}
					{property.features?.bathrooms && (
						<span>{property.features.bathrooms} baños</span>
					)}
				</div>

				<p className="text-xs text-muted-foreground line-clamp-1">
					{property.normalizedLocation}
				</p>

				<Button size="sm" className="w-full mt-2">
					Ver Detalles
				</Button>
			</div>
		</div>
	);
}
