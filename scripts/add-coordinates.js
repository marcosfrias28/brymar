const { drizzle } = require("drizzle-orm/neon-http");
const { neon } = require("@neondatabase/serverless");
const { lands } = require("../src/lib/db/schema");
const { eq } = require("drizzle-orm");

// Configuración de la base de datos
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Coordenadas de ejemplo para República Dominicana
const sampleCoordinates = [
	{ lat: 18.4861, lng: -69.9312 }, // Santo Domingo
	{ lat: 18.5204, lng: -69.954 }, // Santo Domingo Norte
	{ lat: 18.4655, lng: -69.9365 }, // Santo Domingo Este
	{ lat: 19.4515, lng: -70.6969 }, // Santiago
	{ lat: 18.2367, lng: -71.0719 }, // San Juan
	{ lat: 18.6151, lng: -68.9739 }, // La Romana
	{ lat: 19.7892, lng: -70.5348 }, // Puerto Plata
	{ lat: 18.807, lng: -70.2204 }, // Bonao
	{ lat: 18.0731, lng: -71.2288 }, // Barahona
	{ lat: 19.2177, lng: -69.4203 }, // Nagua
];

async function addCoordinatesToLands() {
	try {
		console.log("Agregando coordenadas a los terrenos...");

		// Obtener todos los terrenos
		const allLands = await db.select().from(lands).limit(10);

		console.log(`Encontrados ${allLands.length} terrenos`);

		// Agregar coordenadas a cada terreno
		for (let i = 0; i < allLands.length; i++) {
			const land = allLands[i];
			const coordinates = sampleCoordinates[i % sampleCoordinates.length];

			// Actualizar la ubicación con coordenadas
			const currentLocation = JSON.parse(land.location || "{}");
			const updatedLocation = {
				...currentLocation,
				coordinates: {
					latitude: coordinates.lat,
					longitude: coordinates.lng,
				},
			};

			await db
				.update(lands)
				.set({
					location: JSON.stringify(updatedLocation),
				})
				.where(eq(lands.id, land.id));

			console.log(
				`Actualizado terreno ${land.id} con coordenadas ${coordinates.lat}, ${coordinates.lng}`
			);
		}

		console.log("¡Coordenadas agregadas exitosamente!");
	} catch (error) {
		console.error("Error agregando coordenadas:", error);
	}
}

// Ejecutar el script
addCoordinatesToLands();
