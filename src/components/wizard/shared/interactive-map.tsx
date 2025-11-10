"use client";

import {
	Icon,
	type LatLngExpression,
	type Map as LeafletMap,
	type LeafletMouseEvent,
} from "leaflet";
import {
	AlertCircle,
	CheckCircle,
	Crosshair,
	MapPin,
	Search,
	PenTool,
	Undo2,
	XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	MapContainer,
	Marker,
	Polygon,
	TileLayer,
	useMapEvents,
} from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DOMINICAN_REPUBLIC_BOUNDS,
	DOMINICAN_REPUBLIC_CENTER,
	mapService,
} from "@/lib/services/map-service";
import { cn } from "@/lib/utils/index";
import {
	isMobile,
	isTouchDevice,
	mobileClasses,
} from "@/lib/utils/mobile-utils";
import type { Coordinates } from "@/types/wizard";
import type {
	Geometry,
	PolygonGeometry,
	PointGeometry,
} from "@/lib/types/shared";

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

type InteractiveMapProps = {
	coordinates?: Coordinates;
	onCoordinatesChange: (coordinates: Coordinates) => void;
	onAddressChange?: (address: any) => void;
	onGeometryChange?: (geometry: Geometry) => void;
	onError?: (error: string) => void;
	className?: string;
	height?: string;
	isMobile?: boolean;
};

// Component to handle map clicks with proper event isolation
function MapClickHandler({
	onCoordinatesChange,
	onAddressChange,
	isProcessing,
	onProcessingChange,
	onGeometryChange,
}: {
	onCoordinatesChange: (coordinates: Coordinates) => void;
	onAddressChange?: (address: any) => void;
	isProcessing: boolean;
	onProcessingChange: (processing: boolean) => void;
	onGeometryChange?: (geometry: Geometry) => void;
}) {
	// Use ref to prevent stale closures and ensure latest callback is used
	const onCoordinatesChangeRef = useRef(onCoordinatesChange);
	const onAddressChangeRef = useRef(onAddressChange);
	const onGeometryChangeRef = useRef(onGeometryChange);

	useEffect(() => {
		onCoordinatesChangeRef.current = onCoordinatesChange;
		onAddressChangeRef.current = onAddressChange;
	}, [onCoordinatesChange, onAddressChange]);
	useEffect(() => {
		onGeometryChangeRef.current = onGeometryChange;
	}, [onGeometryChange]);

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
				return;
			}

			const coordinates: Coordinates = {
				latitude: lat,
				longitude: lng,
			};

			// Update coordinates immediately
			onCoordinatesChangeRef.current(coordinates);

			// Also emit point geometry if requested
			if (onGeometryChangeRef.current) {
				const point: PointGeometry = {
					type: "Point",
					coordinates: [lng, lat],
				};
				onGeometryChangeRef.current(point);
			}

			// Reverse geocode to get address if callback provided
			if (onAddressChangeRef.current) {
				onProcessingChange(true);
				try {
					const address = await mapService.reverseGeocode(coordinates);
					onAddressChangeRef.current(address);
				} catch (_error) {
					// Don't show error to user, just log it
				} finally {
					onProcessingChange(false);
				}
			}
		},
		[isProcessing, onProcessingChange]
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
	onGeometryChange,
	onError,
	className,
	height = "400px",
	isMobile: propIsMobile,
}: InteractiveMapProps) {
	const mapRef = useRef<LeafletMap | null>(null);
	const [isClient, setIsClient] = useState(false);
	const [mapError, setMapError] = useState<string | null>(null);
	const [isLocating, setIsLocating] = useState(false);
	const [isProcessingClick, setIsProcessingClick] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [isDrawing, setIsDrawing] = useState(false);
	const [polygonPoints, setPolygonPoints] = useState<Coordinates[]>([]);

	// Detect mobile if not provided as prop
	const isMobileDevice =
		propIsMobile ?? (typeof window !== "undefined" && isMobile());
	const isTouch = typeof window !== "undefined" && isTouchDevice();

	// Error handler
	const handleError = useCallback((error: string) => {
		setMapError(error);
		if (onError) {
			onError(error);
		}
	}, [onError]);

	// Memoize map configuration to prevent unnecessary re-renders (must be before any conditional returns)
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

	// Memoize callbacks to prevent unnecessary re-renders
	const stableOnCoordinatesChange = useCallback(
		(coords: Coordinates) => {
			onCoordinatesChange(coords);
		},
		[onCoordinatesChange]
	);

	const stableOnAddressChange = useCallback(
		(address: any) => {
			if (onAddressChange) {
				onAddressChange(address);
			}
		},
		[onAddressChange]
	);

	const stableOnGeometryChange = useCallback(
		(geometry: Geometry) => {
			if (onGeometryChange) {
				onGeometryChange(geometry);
			}
		},
		[onGeometryChange]
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
					15
				);
			} catch (_error) {}
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
		}, 15_000); // 15 second timeout

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
					} catch (_error) {
						// Don't set error for reverse geocoding failure
					}
				}

				// Emit point geometry
				stableOnGeometryChange({
					type: "Point",
					coordinates: [coordinates.longitude, coordinates.latitude],
				});

				setIsLocating(false);
			},
			(error) => {
				clearTimeout(timeoutId);

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
				timeout: 10_000,
				maximumAge: 300_000, // 5 minutes
			}
		);
	}, [
		isLocating,
		stableOnCoordinatesChange,
		stableOnAddressChange,
		onAddressChange,
		stableOnGeometryChange,
	]);

	// Search address -> coordinates
	const handleSearch = useCallback(async () => {
		if (!searchQuery.trim() || isSearching) {
			return;
		}
		try {
			setIsSearching(true);
			setMapError(null);
			const coords = await mapService.geocode(searchQuery.trim());
			stableOnCoordinatesChange(coords);
			try {
				const address = await mapService.reverseGeocode(coords);
				stableOnAddressChange(address);
			} catch (_error) {}
			stableOnGeometryChange({
				type: "Point",
				coordinates: [coords.longitude, coords.latitude],
			});
		} catch (error) {
			setMapError(
				error instanceof Error
					? error.message
					: "No se pudo buscar la dirección"
			);
		} finally {
			setIsSearching(false);
		}
	}, [
		searchQuery,
		isSearching,
		stableOnCoordinatesChange,
		stableOnAddressChange,
		stableOnGeometryChange,
	]);

	// Polygon drawing handler
	function PolygonDrawHandler() {
		useMapEvents({
			click: async (e) => {
				if (!isDrawing) {
					return;
				}
				const { lat, lng } = e.latlng;
				const coords: Coordinates = { latitude: lat, longitude: lng };
				if (!mapService.isWithinDominicanRepublic(coords)) {
					return;
				}
				setPolygonPoints((prev) => [...prev, coords]);
			},
		});
		return null;
	}

	const undoLastPoint = useCallback(() => {
		setPolygonPoints((prev) => prev.slice(0, -1));
	}, []);

	const clearPolygon = useCallback(() => {
		setPolygonPoints([]);
	}, []);

	const finishPolygon = useCallback(() => {
		if (polygonPoints.length < 3) {
			setMapError("El polígono requiere al menos 3 puntos");
			return;
		}
		setIsDrawing(false);
		// Build GeoJSON polygon (close ring)
		const ring = polygonPoints.map<[number, number]>((p) => [
			p.longitude,
			p.latitude,
		]);
		if (
			ring.length &&
			(ring[0][0] !== ring.at(-1)?.[0] || ring[0][1] !== ring.at(-1)?.[1])
		) {
			ring.push(ring[0]);
		}
		const polygon: PolygonGeometry = { type: "Polygon", coordinates: [ring] };
		stableOnGeometryChange(polygon);
	}, [polygonPoints, stableOnGeometryChange]);

	// Don't render on server side - show loading state
	if (!isClient) {
		return (
			<Card className={className}>
				<CardContent className="p-6">
					<div
						className="flex animate-pulse items-center justify-center rounded-lg bg-muted"
						style={{ height }}
					>
						<div className="text-center">
							<div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
							<p className="text-muted-foreground text-sm">
								Inicializando mapa...
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card
			className={cn(
				className,
				isMobileDevice && "border-0 bg-transparent shadow-none"
			)}
		>
			<CardContent className={cn(isMobileDevice ? "p-0" : "p-6")}>
				<div className={cn(isMobileDevice ? "space-y-3" : "space-y-4")}>
					{/* Map controls */}
					<div
						className={cn(
							isMobileDevice
								? "flex flex-col space-y-2"
								: "flex items-center justify-between"
						)}
					>
						{/* Search input */}
						<div
							className={cn(
								"flex items-center",
								isMobileDevice ? "space-x-1" : "space-x-2"
							)}
						>
							<div
								className={cn(
									"flex items-center rounded-md border px-2",
									isMobileDevice ? "h-9 w-full" : "h-8 w-80"
								)}
								role="search"
							>
								<Search
									className={cn(
										"text-muted-foreground",
										isMobileDevice ? "h-4 w-4" : "h-4 w-4"
									)}
								/>
								<input
									className={cn(
										"ml-2 flex-1 bg-transparent outline-none",
										isMobileDevice ? "text-xs" : "text-sm"
									)}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleSearch();
										}
									}}
									placeholder={
										isMobileDevice
											? "Buscar dirección"
											: "Buscar dirección en RD"
									}
									type="text"
									value={searchQuery}
								/>
								<Button
									disabled={isSearching}
									onClick={handleSearch}
									size={isMobileDevice ? "default" : "sm"}
									variant="outline"
								>
									{isSearching ? "Buscando..." : "Buscar"}
								</Button>
							</div>
						</div>

						<div
							className={cn(
								"flex items-center",
								isMobileDevice ? "space-x-1" : "space-x-2"
							)}
						>
							{coordinates ? (
								<CheckCircle
									className={cn(
										"text-green-600",
										isMobileDevice ? "h-4 w-4" : "h-5 w-5"
									)}
								/>
							) : (
								<MapPin
									className={cn(
										"text-primary",
										isMobileDevice ? "h-4 w-4" : "h-5 w-5"
									)}
								/>
							)}
							<span
								className={cn(
									"font-medium",
									isMobileDevice ? "text-xs" : "text-sm"
								)}
							>
								{coordinates
									? `${coordinates.latitude.toFixed(
											4
										)}, ${coordinates.longitude.toFixed(4)}`
									: "Toca el mapa para seleccionar ubicación"}
							</span>
							{isProcessingClick && (
								<div className="h-3 w-3 animate-spin rounded-full border-primary border-b-2" />
							)}
						</div>

						<Button
							className={cn(
								"flex items-center space-x-2",
								isMobileDevice &&
									`${mobileClasses.touchButton} min-h-[44px] w-full`
							)}
							disabled={isLocating || isProcessingClick}
							onClick={getCurrentLocation}
							size={isMobileDevice ? "default" : "sm"}
							variant="outline"
						>
							<Crosshair
								className={cn(
									isLocating && "animate-spin",
									isMobileDevice ? "h-5 w-5" : "h-4 w-4"
								)}
							/>
							<span className={cn(isMobileDevice ? "text-base" : "text-sm")}>
								{isLocating ? "Ubicando..." : "Mi ubicación"}
							</span>
						</Button>
						<div
							className={cn(
								"flex items-center",
								isMobileDevice ? "mt-2 space-x-1" : "ml-4 space-x-2"
							)}
						>
							<Button
								className={cn(isMobileDevice && `${mobileClasses.touchButton}`)}
								disabled={isProcessingClick}
								onClick={() => setIsDrawing((v) => !v)}
								size={isMobileDevice ? "default" : "sm"}
								variant={isDrawing ? "default" : "outline"}
							>
								<PenTool
									className={cn(isMobileDevice ? "h-5 w-5" : "h-4 w-4")}
								/>
								<span
									className={cn(
										isMobileDevice ? "ml-2 text-base" : "ml-2 text-sm"
									)}
								>
									{isDrawing ? "Dibujando..." : "Dibujar polígono"}
								</span>
							</Button>
							<Button
								disabled={!isDrawing && polygonPoints.length === 0}
								onClick={undoLastPoint}
								size={isMobileDevice ? "default" : "sm"}
								variant="outline"
							>
								<Undo2 className={cn(isMobileDevice ? "h-5 w-5" : "h-4 w-4")} />
								<span
									className={cn(
										isMobileDevice ? "ml-2 text-base" : "ml-2 text-sm"
									)}
								>
									Deshacer
								</span>
							</Button>
							<Button
								disabled={polygonPoints.length === 0}
								onClick={clearPolygon}
								size={isMobileDevice ? "default" : "sm"}
								variant="outline"
							>
								<XCircle
									className={cn(isMobileDevice ? "h-5 w-5" : "h-4 w-4")}
								/>
								<span
									className={cn(
										isMobileDevice ? "ml-2 text-base" : "ml-2 text-sm"
									)}
								>
									Limpiar
								</span>
							</Button>
							<Button
								disabled={polygonPoints.length < 3}
								onClick={finishPolygon}
								size={isMobileDevice ? "default" : "sm"}
								variant="default"
							>
								Guardar polígono
							</Button>
						</div>
					</div>

					{/* Error message */}
					{mapError && (
						<div
							className={cn(
								"flex items-center rounded-lg border border-destructive/20 bg-destructive/10",
								isMobileDevice ? "space-x-1 p-2" : "space-x-2 p-3"
							)}
						>
							<AlertCircle
								className={cn(
									"text-destructive",
									isMobileDevice ? "h-4 w-4" : "h-4 w-4"
								)}
							/>
							<span
								className={cn(
									"text-destructive",
									isMobileDevice ? "text-xs" : "text-sm"
								)}
							>
								{mapError}
							</span>
						</div>
					)}

					{/* Map container */}
					<div
						className="relative overflow-hidden rounded-lg border"
						style={{ height }}
					>
						<MapContainer
							center={mapConfig.center}
							className={cn(
								"z-0",
								isMobileDevice && "touch-pan-y touch-pinch-zoom"
							)}
							doubleClickZoom={true}
							dragging={true}
							maxBounds={mapConfig.bounds}
							maxBoundsViscosity={1.0}
							ref={mapRef}
							scrollWheelZoom={!isMobileDevice}
							style={{ height: "100%", width: "100%" }}
							touchZoom={isTouch}
							whenReady={() => {
								// Ensure map is properly initialized
								if (mapRef.current && isClient) {
									try {
										setTimeout(() => {
											if (mapRef.current) {
												mapRef.current.invalidateSize();
											}
										}, 100);
									} catch (_error) {}
								}
							}}
							zoom={mapConfig.zoom}
							zoomControl={!isMobileDevice}
						>
							<TileLayer
								attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
								maxZoom={18}
								url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							/>

							{/* Map click handler with improved event isolation */}
							<MapClickHandler
								isProcessing={isProcessingClick}
								onAddressChange={stableOnAddressChange}
								onCoordinatesChange={stableOnCoordinatesChange}
								onGeometryChange={stableOnGeometryChange}
								onProcessingChange={setIsProcessingClick}
							/>

							{/* Polygon drawing handler */}
							{isDrawing && <PolygonDrawHandler />}

							{/* Marker for selected coordinates */}
							{coordinates && (
								<Marker
									icon={markerIcon}
									position={[coordinates.latitude, coordinates.longitude]}
								/>
							)}

							{/* Polygon display */}
							{polygonPoints.length >= 2 && (
								<Polygon
									pathOptions={{ color: "#2563eb", weight: 3 }}
									positions={polygonPoints.map((p) => [
										p.latitude,
										p.longitude,
									])}
								/>
							)}
						</MapContainer>

						{/* Improved overlay instructions that don't interfere with clicks */}
						{!(coordinates || isProcessingClick) && (
							<div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/10">
								<div
									className={cn(
										"rounded-lg border bg-white/95 text-center shadow-lg backdrop-blur-sm",
										isMobileDevice ? "mx-4 p-3" : "p-4"
									)}
								>
									<MapPin
										className={cn(
											"mx-auto mb-2 text-primary",
											isMobileDevice ? "h-6 w-6" : "h-8 w-8"
										)}
									/>
									<p
										className={cn(
											"font-medium",
											isMobileDevice ? "text-xs" : "text-sm"
										)}
									>
										{isMobileDevice ? "Toca el mapa" : "Haz clic en el mapa"}
									</p>
									<p
										className={cn(
											"text-muted-foreground",
											isMobileDevice ? "text-xs" : "text-xs"
										)}
									>
										para seleccionar la ubicación
									</p>
									{isDrawing && (
										<p
											className={cn(
												"mt-2 text-primary",
												isMobileDevice ? "text-xs" : "text-xs"
											)}
										>
											Modo dibujo: agrega puntos para crear el polígono.
										</p>
									)}
								</div>
							</div>
						)}

						{/* Processing indicator */}
						{isProcessingClick && (
							<div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/10">
								<div
									className={cn(
										"rounded-lg border bg-white/95 text-center shadow-lg backdrop-blur-sm",
										isMobileDevice ? "mx-4 p-3" : "p-4"
									)}
								>
									<div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-primary border-b-2" />
									<p
										className={cn(
											"font-medium text-primary",
											isMobileDevice ? "text-xs" : "text-sm"
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
							"space-y-1 text-muted-foreground",
							isMobileDevice ? "px-2 text-xs" : "text-xs"
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
							<p className="font-medium text-green-600">
								✓ Ubicación seleccionada correctamente
							</p>
						)}
						{mapError && (
							<p className="font-medium text-destructive">⚠ {mapError}</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
