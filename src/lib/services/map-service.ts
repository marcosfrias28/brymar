import type { Address, Coordinates, MapService } from "@/types/wizard";
import { MapServiceError } from "../errors/wizard-errors";

// Dominican Republic bounds
export const DOMINICAN_REPUBLIC_BOUNDS = {
	north: 19.9,
	south: 17.5,
	east: -68.3,
	west: -72.0,
};

export const DOMINICAN_REPUBLIC_CENTER: Coordinates = {
	latitude: 18.7357,
	longitude: -70.1627,
};

// Dominican Republic provinces for validation
export const DOMINICAN_PROVINCES = [
	"Azua",
	"Baoruco",
	"Barahona",
	"Dajabón",
	"Distrito Nacional",
	"Duarte",
	"El Seibo",
	"Elías Piña",
	"Espaillat",
	"Hato Mayor",
	"Hermanas Mirabal",
	"Independencia",
	"La Altagracia",
	"La Romana",
	"La Vega",
	"María Trinidad Sánchez",
	"Monseñor Nouel",
	"Monte Cristi",
	"Monte Plata",
	"Pedernales",
	"Peravia",
	"Puerto Plata",
	"Samaná",
	"San Cristóbal",
	"San José de Ocoa",
	"San Juan",
	"San Pedro de Macorís",
	"Sánchez Ramírez",
	"Santiago",
	"Santiago Rodríguez",
	"Santo Domingo",
	"Valverde",
];

class MapServiceImpl implements MapService {
	initializeMap(_containerId: string): any {
		// This will be handled by the React component
		// Return a placeholder for now
		return null;
	}

	setDominicanRepublicBounds(): void {
		// This will be handled by the React component
	}

	addMarker(_coordinates: Coordinates): any {
		// This will be handled by the React component
		return null;
	}

	/**
	 * Reverse geocode coordinates to get address information
	 * Uses Nominatim (OpenStreetMap) API for free geocoding
	 */
	async reverseGeocode(coordinates: Coordinates): Promise<Address> {
		try {
			const { latitude, longitude } = coordinates;

			// Validate coordinates are within Dominican Republic bounds
			if (
				latitude < DOMINICAN_REPUBLIC_BOUNDS.south ||
				latitude > DOMINICAN_REPUBLIC_BOUNDS.north ||
				longitude < DOMINICAN_REPUBLIC_BOUNDS.west ||
				longitude > DOMINICAN_REPUBLIC_BOUNDS.east
			) {
				throw new MapServiceError(
					"Coordinates are outside Dominican Republic bounds",
					"COORDINATES_OUT_OF_BOUNDS",
					false,
					{
						coordinates: { latitude, longitude },
						bounds: DOMINICAN_REPUBLIC_BOUNDS,
					}
				);
			}

			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=es`,
				{
					headers: {
						"User-Agent": "Brymar-Inmobiliaria/1.0",
					},
				}
			);

			if (!response.ok) {
				throw new Error("Error en el servicio de geocodificación");
			}

			const data = await response.json();

			if (!data || data.error) {
				throw new Error(
					"No se pudo obtener la dirección para estas coordenadas"
				);
			}

			// Extract address components
			const addressComponents = data.address || {};

			// Build street address from available components
			const streetParts = [
				addressComponents.house_number,
				addressComponents.road || addressComponents.street,
			].filter(Boolean);

			const street =
				streetParts.length > 0
					? streetParts.join(" ")
					: addressComponents.neighbourhood ||
						addressComponents.suburb ||
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
				this.findClosestProvince(city) ||
				"Provincia no disponible";

			const postalCode = addressComponents.postcode;

			const address: Address = {
				street,
				city,
				province,
				postalCode,
				country: "Dominican Republic",
				formattedAddress:
					data.display_name || `${street}, ${city}, ${province}`,
			};

			return address;
		} catch (error) {
			throw new Error(
				error instanceof Error ? error.message : "Error al obtener la dirección"
			);
		}
	}

	/**
	 * Geocode address string to get coordinates
	 * Uses Nominatim (OpenStreetMap) API for free geocoding
	 */
	async geocode(address: string): Promise<Coordinates> {
		try {
			// Add Dominican Republic to the search query for better results
			const searchQuery = `${address}, Dominican Republic`;

			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
					searchQuery
				)}&limit=1&countrycodes=do&addressdetails=1&accept-language=es`,
				{
					headers: {
						"User-Agent": "Brymar-Inmobiliaria/1.0",
					},
				}
			);

			if (!response.ok) {
				throw new Error("Error en el servicio de geocodificación");
			}

			const data = await response.json();

			if (!data || data.length === 0) {
				throw new Error("No se encontraron coordenadas para esta dirección");
			}

			const result = data[0];
			const latitude = Number.parseFloat(result.lat);
			const longitude = Number.parseFloat(result.lon);

			// Validate coordinates are within Dominican Republic bounds
			if (
				latitude < DOMINICAN_REPUBLIC_BOUNDS.south ||
				latitude > DOMINICAN_REPUBLIC_BOUNDS.north ||
				longitude < DOMINICAN_REPUBLIC_BOUNDS.west ||
				longitude > DOMINICAN_REPUBLIC_BOUNDS.east
			) {
				throw new Error("La dirección no se encuentra en República Dominicana");
			}

			return {
				latitude,
				longitude,
			};
		} catch (error) {
			throw new Error(
				error instanceof Error
					? error.message
					: "Error al obtener las coordenadas"
			);
		}
	}

	/**
	 * Find the closest Dominican province based on city name
	 * This is a fallback when the geocoding service doesn't return province info
	 */
	private findClosestProvince(city: string): string | null {
		const cityLower = city.toLowerCase();

		// Common city-province mappings
		const cityProvinceMap: Record<string, string> = {
			"santo domingo": "Santo Domingo",
			santiago: "Santiago",
			"puerto plata": "Puerto Plata",
			"la romana": "La Romana",
			"san pedro de macoris": "San Pedro de Macorís",
			barahona: "Barahona",
			"san cristobal": "San Cristóbal",
			"la vega": "La Vega",
			moca: "Espaillat",
			bonao: "Monseñor Nouel",
			bani: "Peravia",
			azua: "Azua",
			higuey: "La Altagracia",
			samana: "Samaná",
			"monte cristi": "Monte Cristi",
			dajabon: "Dajabón",
			mao: "Valverde",
			nagua: "María Trinidad Sánchez",
		};

		return cityProvinceMap[cityLower] || null;
	}

	/**
	 * Validate if coordinates are within Dominican Republic bounds
	 */
	isWithinDominicanRepublic(coordinates: Coordinates): boolean {
		const { latitude, longitude } = coordinates;
		return (
			latitude >= DOMINICAN_REPUBLIC_BOUNDS.south &&
			latitude <= DOMINICAN_REPUBLIC_BOUNDS.north &&
			longitude >= DOMINICAN_REPUBLIC_BOUNDS.west &&
			longitude <= DOMINICAN_REPUBLIC_BOUNDS.east
		);
	}

	/**
	 * Get Dominican Republic center coordinates
	 */
	getDominicanRepublicCenter(): Coordinates {
		return DOMINICAN_REPUBLIC_CENTER;
	}

	/**
	 * Get Dominican Republic bounds
	 */
	getDominicanRepublicBounds() {
		return DOMINICAN_REPUBLIC_BOUNDS;
	}
}

// Export singleton instance
export const mapService = new MapServiceImpl();
