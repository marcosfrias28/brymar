"use client";

import {
	Icon,
	type LatLngExpression,
	type Map as LeafletMap,
	type LeafletMouseEvent,
} from "leaflet";
import { AlertCircle, CheckCircle, Crosshair, MapPin } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DOMINICAN_REPUBLIC_BOUNDS,
	DOMINICAN_REPUBLIC_CENTER,
	mapService,
} from "@/lib/services/map-service";
import { cn } from "@/lib/utils";
import {
	isMobile,
	isTouchDevice,
	mobileClasses,
} from "@/lib/utils/mobile-utils";
import type { Coordinates } from "@/types/wizard";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

// Fix for default markers in Next.js - use CDN icons
const markerIcon = new Icon({
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

interface InteractiveMapProps {
	coordinates?: Coordinates;
	onCoordinatesChange: (coordinates: Coordinates) => void;
	onAddressChange?: (address: any) => void;
	className?: string;
	height?: string;
	isMobile?: boolean;
}

// Component to handle map clicks with proper event isolation
function MapClickHandler({
	onCoordinatesChange,
	onAddressChange,
	isProcessing,
	onProcessingChange,
}: {
	onCoordinatesChange: (coordinates: Coordinates) => void;
	onAddressChange?: (address: any) => void;
	isProcessing: boolean;
	onProcessingChange: (processing: boolean) => void;
}) {
	// Use ref to prevent stale closures and ensure latest callback is used
	const onCoordinatesChangeRef = useRef(onCoordinatesChange);
	const onAddressChangeRef = useRef(onAddressChange);

	useEffect(() => {
		onCoordinatesChangeRef.current = onCoordinatesChange;
		onAddressChangeRef.current = onAddressChange;
	}, [onCoordinatesChange, onAddressChange]);

	const handleMapClick = useCallback(
		async (e: LeafletMouseEvent) => {
			// Prevent multiple simultaneous clicks
			if (isProcessing) {
				return;
			}

			// Stop event propagation to prevent bubbling
			e.originalEvent?.stopPropagation();
			e.originalEvent?.preventDefault();

			const { lat, lng } = e.latlng;

			// Validate coordinates are within Dominican Republic bounds
			if (
				!mapService.isWithinDominicanRepublic({ latitude: lat, longitude: lng })
			) {
				console.warn("Click outside Dominican Republic bounds:", { lat, lng });
				return;
			}

			const coordinates: Coordinates = {
				latitude: lat,
				longitude: lng,
			};

			// Update coordinates immediately
			onCoordinatesChangeRef.current(coordinates);

			// Reverse geocode to get address if callback provided
			if (onAddressChangeRef.current) {
				onProcessingChange(true);
				try {
					const address = await mapService.reverseGeocode(coordinates);
					onAddressChangeRef.current(address);
				} catch (error) {
					console.error("Error reverse geocoding:", error);
					// Don't show error to user, just log it
				} finally {
					onProcessingChange(false);
				}
			}
		},
		[isProcessing, onProcessingChange],
	);

	const _map = useMapEvents({
		click: handleMapClick,
	});

	return null;
}

export function InteractiveMap({
	coordinates,
	onCoordinatesChange,
	onAddressChange,
	className,
	height = "400px",
	isMobile: propIsMobile,
}: InteractiveMapProps) {
	const mapRef = useRef<LeafletMap | null>(null);
	const [isClient, setIsClient] = useState(false);
	const [mapError, setMapError] = useState<string | null>(null);
	const [isLocating, setIsLocating] = useState(false);
	const [isProcessingClick, setIsProcessingClick] = useState(false);

	// Detect mobile if not provided as prop
	const isMobileDevice =
		propIsMobile ?? (typeof window !== "undefined" && isMobile());
	const isTouch = typeof window !== "undefined" && isTouchDevice();

	// Memoize callbacks to prevent unnecessary re-renders
	const stableOnCoordinatesChange = useCallback(
		(coords: Coordinates) => {
			onCoordinatesChange(coords);
		},
		[onCoordinatesChange],
	);

	const stableOnAddressChange = useCallback(
		(address: any) => {
			if (onAddressChange) {
				onAddressChange(address);
			}
		},
		[onAddressChange],
	);

	// Ensure component only renders on client side with proper hydration
	useEffect(() => {
		// Prevent infinite loops by checking if already set
		if (!isClient) {
			const timer = setTimeout(() => {
				setIsClient(true);
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [isClient]);

	// Center map on coordinates when they change
	useEffect(() => {
		if (mapRef.current && coordinates && isClient) {
			try {
				mapRef.current.setView(
					[coordinates.latitude, coordinates.longitude],
					15,
				);
			} catch (error) {
				console.warn("Error setting map view:", error);
			}
		}
	}, [coordinates, isClient]);

	// Get user's current location with improved error handling
	const getCurrentLocation = useCallback(() => {
		if (!navigator.geolocation) {
			setMapError("La geolocalización no está disponible en este navegador");
			return;
		}

		if (isLocating) {
			return; // Prevent multiple simultaneous location requests
		}

		setIsLocating(true);
		setMapError(null);

		const timeoutId = setTimeout(() => {
			setMapError("Tiempo de espera agotado para obtener la ubicación");
			setIsLocating(false);
		}, 15000); // 15 second timeout

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				clearTimeout(timeoutId);

				const coordinates: Coordinates = {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
				};

				// Check if location is within Dominican Republic bounds
				if (!mapService.isWithinDominicanRepublic(coordinates)) {
					setMapError("Tu ubicación actual está fuera de República Dominicana");
					setIsLocating(false);
					return;
				}

				stableOnCoordinatesChange(coordinates);

				// Reverse geocode to get address
				if (onAddressChange) {
					try {
						const address = await mapService.reverseGeocode(coordinates);
						stableOnAddressChange(address);
					} catch (error) {
						console.error("Error reverse geocoding current location:", error);
						// Don't set error for reverse geocoding failure
					}
				}

				setIsLocating(false);
			},
			(error) => {
				clearTimeout(timeoutId);
				console.error("Geolocation error:", error);

				let errorMessage = "No se pudo obtener tu ubicación actual";
				switch (error.code) {
					case error.PERMISSION_DENIED:
						errorMessage = "Permiso de ubicación denegado";
						break;
					case error.POSITION_UNAVAILABLE:
						errorMessage = "Ubicación no disponible";
						break;
					case error.TIMEOUT:
						errorMessage = "Tiempo de espera agotado";
						break;
				}

				setMapError(errorMessage);
				setIsLocating(false);
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 300000, // 5 minutes
			},
		);
	}, [
		isLocating,
		stableOnCoordinatesChange,
		stableOnAddressChange,
		onAddressChange,
	]);

	// Don't render on server side - show loading state
	if (!isClient) {
		return (
			<Card className={className}>
				<CardContent className="p-6">
					<div
						className="bg-muted rounded-lg flex items-center justify-center animate-pulse"
						style={{ height }}
					>
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
							<p className="text-sm text-muted-foreground">
								Inicializando mapa...
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Memoize map configuration to prevent unnecessary re-renders
	const mapConfig = useMemo(() => {
		const center: LatLngExpression = coordinates
			? [coordinates.latitude, coordinates.longitude]
			: [
					DOMINICAN_REPUBLIC_CENTER.latitude,
					DOMINICAN_REPUBLIC_CENTER.longitude,
				];

		const bounds: [[number, number], [number, number]] = [
			[DOMINICAN_REPUBLIC_BOUNDS.south, DOMINICAN_REPUBLIC_BOUNDS.west], // Southwest corner
			[DOMINICAN_REPUBLIC_BOUNDS.north, DOMINICAN_REPUBLIC_BOUNDS.east], // Northeast corner
		];

		const zoom = coordinates
			? isMobileDevice
				? 14
				: 15
			: isMobileDevice
				? 7
				: 8;

		return { center, bounds, zoom };
	}, [coordinates, isMobileDevice]);

	return (
		<Card
			className={cn(
				className,
				isMobileDevice && "border-0 shadow-none bg-transparent",
			)}
		>
			<CardContent className={cn(isMobileDevice ? "p-0" : "p-6")}>
				<div className={cn(isMobileDevice ? "space-y-3" : "space-y-4")}>
					{/* Map controls */}
					<div
						className={cn(
							isMobileDevice
								? "flex flex-col space-y-2"
								: "flex items-center justify-between",
						)}
					>
						<div
							className={cn(
								"flex items-center",
								isMobileDevice ? "space-x-1" : "space-x-2",
							)}
						>
							{coordinates ? (
								<CheckCircle
									className={cn(
										"text-green-600",
										isMobileDevice ? "w-4 h-4" : "w-5 h-5",
									)}
								/>
							) : (
								<MapPin
									className={cn(
										"text-primary",
										isMobileDevice ? "w-4 h-4" : "w-5 h-5",
									)}
								/>
							)}
							<span
								className={cn(
									"font-medium",
									isMobileDevice ? "text-xs" : "text-sm",
								)}
							>
								{coordinates
									? `${coordinates.latitude.toFixed(
											4,
										)}, ${coordinates.longitude.toFixed(4)}`
									: "Toca el mapa para seleccionar ubicación"}
							</span>
							{isProcessingClick && (
								<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
							)}
						</div>

						<Button
							variant="outline"
							size={isMobileDevice ? "default" : "sm"}
							onClick={getCurrentLocation}
							disabled={isLocating || isProcessingClick}
							className={cn(
								"flex items-center space-x-2",
								isMobileDevice &&
									`${mobileClasses.touchButton} w-full min-h-[44px]`,
							)}
						>
							<Crosshair
								className={cn(
									isLocating && "animate-spin",
									isMobileDevice ? "w-5 h-5" : "w-4 h-4",
								)}
							/>
							<span className={cn(isMobileDevice ? "text-base" : "text-sm")}>
								{isLocating ? "Ubicando..." : "Mi ubicación"}
							</span>
						</Button>
					</div>

					{/* Error message */}
					{mapError && (
						<div
							className={cn(
								"flex items-center bg-destructive/10 border border-destructive/20 rounded-lg",
								isMobileDevice ? "space-x-1 p-2" : "space-x-2 p-3",
							)}
						>
							<AlertCircle
								className={cn(
									"text-destructive",
									isMobileDevice ? "w-4 h-4" : "w-4 h-4",
								)}
							/>
							<span
								className={cn(
									"text-destructive",
									isMobileDevice ? "text-xs" : "text-sm",
								)}
							>
								{mapError}
							</span>
						</div>
					)}

					{/* Map container */}
					<div
						className="relative rounded-lg overflow-hidden border"
						style={{ height }}
					>
						<MapContainer
							ref={mapRef}
							center={mapConfig.center}
							zoom={mapConfig.zoom}
							maxBounds={mapConfig.bounds}
							maxBoundsViscosity={1.0}
							style={{ height: "100%", width: "100%" }}
							className={cn(
								"z-0",
								isMobileDevice && "touch-pan-y touch-pinch-zoom",
							)}
							touchZoom={isTouch}
							scrollWheelZoom={!isMobileDevice}
							doubleClickZoom={true}
							dragging={true}
							zoomControl={!isMobileDevice}
							whenReady={() => {
								// Ensure map is properly initialized
								if (mapRef.current && isClient) {
									try {
										setTimeout(() => {
											if (mapRef.current) {
												mapRef.current.invalidateSize();
											}
										}, 100);
									} catch (error) {
										console.warn("Error initializing map:", error);
									}
								}
							}}
						>
							<TileLayer
								attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
								url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
								maxZoom={18}
							/>

							{/* Map click handler with improved event isolation */}
							<MapClickHandler
								onCoordinatesChange={stableOnCoordinatesChange}
								onAddressChange={stableOnAddressChange}
								isProcessing={isProcessingClick}
								onProcessingChange={setIsProcessingClick}
							/>

							{/* Marker for selected coordinates */}
							{coordinates && (
								<Marker
									position={[coordinates.latitude, coordinates.longitude]}
									icon={markerIcon}
								/>
							)}
						</MapContainer>

						{/* Improved overlay instructions that don't interfere with clicks */}
						{!coordinates && !isProcessingClick && (
							<div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none z-10">
								<div
									className={cn(
										"bg-white/95 backdrop-blur-sm rounded-lg shadow-lg text-center border",
										isMobileDevice ? "p-3 mx-4" : "p-4",
									)}
								>
									<MapPin
										className={cn(
											"mx-auto mb-2 text-primary",
											isMobileDevice ? "w-6 h-6" : "w-8 h-8",
										)}
									/>
									<p
										className={cn(
											"font-medium",
											isMobileDevice ? "text-xs" : "text-sm",
										)}
									>
										{isMobileDevice ? "Toca el mapa" : "Haz clic en el mapa"}
									</p>
									<p
										className={cn(
											"text-muted-foreground",
											isMobileDevice ? "text-xs" : "text-xs",
										)}
									>
										para seleccionar la ubicación
									</p>
								</div>
							</div>
						)}

						{/* Processing indicator */}
						{isProcessingClick && (
							<div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none z-10">
								<div
									className={cn(
										"bg-white/95 backdrop-blur-sm rounded-lg shadow-lg text-center border",
										isMobileDevice ? "p-3 mx-4" : "p-4",
									)}
								>
									<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
									<p
										className={cn(
											"font-medium text-primary",
											isMobileDevice ? "text-xs" : "text-sm",
										)}
									>
										Procesando ubicación...
									</p>
								</div>
							</div>
						)}
					</div>

					{/* Map instructions with better feedback */}
					<div
						className={cn(
							"text-muted-foreground space-y-1",
							isMobileDevice ? "text-xs px-2" : "text-xs",
						)}
					>
						<p>
							• {isMobileDevice ? "Toca" : "Haz clic en"} cualquier punto del
							mapa para seleccionar la ubicación
						</p>
						<p>• Usa el botón "Mi ubicación" para usar tu ubicación actual</p>
						{isMobileDevice && (
							<p>• Pellizca para hacer zoom, arrastra para mover el mapa</p>
						)}
						<p>• El mapa está limitado a República Dominicana</p>
						{coordinates && (
							<p className="text-green-600 font-medium">
								✓ Ubicación seleccionada correctamente
							</p>
						)}
						{mapError && (
							<p className="text-destructive font-medium">⚠ {mapError}</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
