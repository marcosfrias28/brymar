import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { lands, properties } from "../src/lib/db/schema.js";
import "dotenv/config";

// Configuración de la base de datos
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Coordenadas de ejemplo para República Dominicana
const dominicanCoordinates = [
	{ name: "Santo Domingo Centro", lat: 18.4861, lng: -69.9312 },
	{ name: "Santo Domingo Norte", lat: 18.5204, lng: -69.954 },
	{ name: "Santo Domingo Este", lat: 18.4655, lng: -69.9365 },
	{ name: "Santiago de los Caballeros", lat: 19.4515, lng: -70.6969 },
	{ name: "San Juan de la Maguana", lat: 18.2367, lng: -71.0719 },
	{ name: "La Romana", lat: 18.6151, lng: -68.9739 },
	{ name: "Puerto Plata", lat: 19.7892, lng: -70.5348 },
	{ name: "Bonao", lat: 18.807, lng: -70.2204 },
	{ name: "Barahona", lat: 18.0731, lng: -71.2288 },
	{ name: "Nagua", lat: 19.2177, lng: -69.4203 },
	{ name: "San Pedro de Macorís", lat: 18.4539, lng: -69.3087 },
	{ name: "La Vega", lat: 19.2225, lng: -70.5287 },
	{ name: "Moca", lat: 19.3934, lng: -70.5256 },
	{ name: "Higüey", lat: 18.6151, lng: -68.7098 },
	{ name: "Azua", lat: 18.4532, lng: -70.7348 },
	{ name: "Bani", lat: 18.2794, lng: -70.3314 },
	{ name: "Mao", lat: 19.5518, lng: -71.0781 },
	{ name: "Monte Cristi", lat: 19.8467, lng: -71.6518 },
	{ name: "Dajabón", lat: 19.5487, lng: -71.7087 },
	{ name: "Elías Piña", lat: 18.8929, lng: -71.6854 },
];

// Función para obtener coordenadas aleatorias dentro de República Dominicana
function getRandomCoordinates() {
	const baseCoord =
		dominicanCoordinates[
			Math.floor(Math.random() * dominicanCoordinates.length)
		];

	// Agregar una pequeña variación aleatoria para diversificar las ubicaciones
	const latVariation = (Math.random() - 0.5) * 0.1; // ±0.05 grados
	const lngVariation = (Math.random() - 0.5) * 0.1; // ±0.05 grados

	return {
		latitude: baseCoord.lat + latVariation,
		longitude: baseCoord.lng + lngVariation,
		cityName: baseCoord.name,
	};
}

async function addCoordinatesToLands() {
	try {
		console.log("🏞️  Agregando coordenadas a los terrenos...");

		// Obtener todos los terrenos
		const allLands = await db.select().from(lands);
		console.log(`📊 Encontrados ${allLands.length} terrenos`);

		if (allLands.length === 0) {
			console.log("⚠️  No hay terrenos en la base de datos");
			return;
		}

		// Agregar coordenadas a cada terreno
		for (let i = 0; i < allLands.length; i++) {
			const land = allLands[i];
			const coordinates = getRandomCoordinates();

			// Parsear la ubicación actual o crear una nueva
			let currentLocation;
			try {
				currentLocation = land.location ? JSON.parse(land.location) : {};
			} catch (_e) {
				// Si no es JSON válido, tratarlo como string
				currentLocation = {
					address: land.location || `Terreno en ${coordinates.cityName}`,
				};
			}

			// Actualizar la ubicación con coordenadas
			const updatedLocation = {
				...currentLocation,
				address:
					currentLocation.address || `Terreno en ${coordinates.cityName}`,
				city: coordinates.cityName,
				country: "República Dominicana",
				coordinates: {
					latitude: coordinates.latitude,
					longitude: coordinates.longitude,
				},
			};

			await db
				.update(lands)
				.set({
					location: JSON.stringify(updatedLocation),
				})
				.where(eq(lands.id, land.id));

			console.log(
				`✅ Terreno ${land.id}: ${coordinates.cityName} (${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)})`
			);
		}

		console.log(`🎉 ¡Coordenadas agregadas a ${allLands.length} terrenos!`);
	} catch (error) {
		console.error("❌ Error agregando coordenadas a terrenos:", error);
	}
}

async function addCoordinatesToProperties() {
	try {
		console.log("🏠 Agregando coordenadas a las propiedades...");

		// Obtener todas las propiedades
		const allProperties = await db.select().from(properties);
		console.log(`📊 Encontradas ${allProperties.length} propiedades`);

		if (allProperties.length === 0) {
			console.log("⚠️  No hay propiedades en la base de datos");
			return;
		}

		// Agregar coordenadas a cada propiedad
		for (let i = 0; i < allProperties.length; i++) {
			const property = allProperties[i];
			const coordinates = getRandomCoordinates();

			// Parsear la ubicación actual o crear una nueva
			let currentLocation;
			try {
				currentLocation = property.location
					? JSON.parse(property.location)
					: {};
			} catch (_e) {
				// Si no es JSON válido, tratarlo como string
				currentLocation = {
					street:
						property.location || `Calle Principal, ${coordinates.cityName}`,
					city: coordinates.cityName,
					state: coordinates.cityName,
					country: "República Dominicana",
				};
			}

			// Asegurar que tenga la estructura correcta para propiedades
			const updatedLocation = {
				street:
					currentLocation.street || `Calle Principal, ${coordinates.cityName}`,
				city: currentLocation.city || coordinates.cityName,
				state: currentLocation.state || coordinates.cityName,
				country: currentLocation.country || "República Dominicana",
				coordinates: {
					latitude: coordinates.latitude,
					longitude: coordinates.longitude,
				},
			};

			await db
				.update(properties)
				.set({
					location: JSON.stringify(updatedLocation),
				})
				.where(eq(properties.id, property.id));

			console.log(
				`✅ Propiedad ${property.id}: ${coordinates.cityName} (${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)})`
			);
		}

		console.log(
			`🎉 ¡Coordenadas agregadas a ${allProperties.length} propiedades!`
		);
	} catch (error) {
		console.error("❌ Error agregando coordenadas a propiedades:", error);
	}
}

async function main() {
	console.log("🚀 Iniciando proceso de agregar coordenadas...\n");

	try {
		await addCoordinatesToLands();
		console.log(""); // Línea en blanco
		await addCoordinatesToProperties();

		console.log("\n🎊 ¡Proceso completado exitosamente!");
		console.log("📍 Todas las propiedades y terrenos ahora tienen coordenadas");
		console.log("🗺️  Puedes probar el mapa en /search o /test-map");
	} catch (error) {
		console.error("💥 Error en el proceso principal:", error);
		process.exit(1);
	}
}

// Ejecutar el script
main();
