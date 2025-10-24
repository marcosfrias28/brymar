/**
 * Database seeding utilities for development
 */

import { db } from "./connection";
import {
	blogCategories,
	blogPosts,
	lands,
	properties,
	users,
} from "./schema/index";

export async function seedDatabase() {
	console.log("🌱 Starting database seeding...");

	try {
		// Seed blog categories first (referenced by blog posts)
		console.log("📝 Seeding blog categories...");
		await db
			.insert(blogCategories)
			.values([
				{
					id: "cat-1",
					name: "Noticias de Propiedades",
					slug: "noticias-propiedades",
					description: "Últimas noticias y actualizaciones sobre propiedades en República Dominicana",
					color: "#3B82F6",
					isActive: true,
				},
				{
					id: "cat-2",
					name: "Análisis del Mercado",
					slug: "analisis-mercado",
					description: "Análisis y tendencias del mercado inmobiliario dominicano",
					color: "#10B981",
					isActive: true,
				},
				{
					id: "cat-3",
					name: "Consejos de Inversión",
					slug: "consejos-inversion",
					description: "Consejos y estrategias para invertir en bienes raíces",
					color: "#F59E0B",
					isActive: true,
				},
				{
					id: "cat-4",
					name: "Zonas de República Dominicana",
					slug: "zonas-republica-dominicana",
					description: "Guías de las mejores zonas para vivir e invertir en RD",
					color: "#8B5CF6",
					isActive: true,
				},
				{
					id: "cat-5",
					name: "Guías Legales",
					slug: "guias-legales",
					description: "Información legal sobre compra y venta de propiedades",
					color: "#EC4899",
					isActive: true,
				},
			])
			.onConflictDoNothing();

		// Seed sample properties
		console.log("🏠 Seeding sample properties...");
		await db
			.insert(properties)
			.values([
				{
					id: "prop-1",
					title: "Villa de Lujo Frente al Mar en Punta Cana",
					description:
						"Espectacular villa de lujo con 5 habitaciones frente al mar Caribe. Cuenta con piscina infinita, jacuzzi, acceso privado a la playa, acabados de primera calidad y vistas panorámicas al océano. Perfecta para familias que buscan el estilo de vida caribeño.",
					price: 1250000,
					currency: "USD",
					address: {
						street: "Playa Blanca, Calle Principal 45",
						city: "Punta Cana",
						state: "La Altagracia",
						country: "República Dominicana",
						postalCode: "23000",
					},
					type: "villa",
					features: {
						bedrooms: 5,
						bathrooms: 6,
						area: 450,
						parking: true,
						balcony: true,
						furnished: true,
						pool: true,
						beachAccess: true,
						security: true,
					},
					images: [
						{
							url: "/optimized_villa/1.webp",
							alt: "Vista frontal de villa de lujo",
							order: 0,
						},
						{
							url: "/optimized_villa/2.webp",
							alt: "Piscina infinita con vista al mar",
							order: 1,
						},
					],
					status: "published",
					featured: true,
					userId: "user-1",
					publishedAt: new Date(),
				},
				{
					id: "prop-2",
					title: "Apartamento Moderno en Bella Vista, Santo Domingo",
					description:
						"Hermoso apartamento de 3 habitaciones en una de las zonas más exclusivas de Santo Domingo. Edificio moderno con áreas comunes, gimnasio, piscina y seguridad 24/7. Cerca de restaurantes, centros comerciales y avenidas principales.",
					price: 185000,
					currency: "USD",
					address: {
						 street: "Av. Sarasota 124, Torre Moderna",
						city: "Santo Domingo",
						state: "Distrito Nacional",
						country: "República Dominicana",
						postalCode: "10407",
					},
					type: "apartment",
					features: {
						bedrooms: 3,
						bathrooms: 2,
						area: 145,
						parking: true,
						balcony: true,
						furnished: false,
						gym: true,
						pool: true,
						security: true,
					},
					images: [
						{
							url: "/hero-grid/house-2.webp",
							alt: "Apartamento moderno en Bella Vista",
							order: 0,
						},
					],
					status: "published",
					featured: true,
					userId: "user-1",
					publishedAt: new Date(),
				},
				{
					id: "prop-3",
					title: "Casa Colonial en Zona Colonial, Santo Domingo",
					description:
						"Encantadora casa colonial completamente restaurada en el corazón de la Zona Colonial. Conserva su arquitectura original con techos altos, patios interiores y detalles coloniales. Ideal para vivienda o negocio turístico.",
					price: 425000,
					currency: "USD",
					address: {
						street: "Calle Las Damas 78",
						city: "Santo Domingo",
						state: "Distrito Nacional",
						country: "República Dominicana",
						postalCode: "10210",
					},
					type: "house",
					features: {
						bedrooms: 4,
						bathrooms: 3,
						area: 280,
						parking: false,
						balcony: false,
						furnished: false,
						historical: true,
						patio: true,
					},
					images: [
						{
							url: "/hero-grid/house-3.avif",
							alt: "Casa colonial restaurada",
							order: 0,
						},
					],
					status: "published",
					featured: false,
					userId: "user-1",
					publishedAt: new Date(),
				},
				{
					id: "prop-4",
					title: "Penthouse de Lujo en Naco",
					description:
						"Impresionante penthouse de 4 habitaciones con terraza privada de 150m2. Vistas espectaculares a la ciudad, acabados de lujo, cocina italiana, sistema de domótica y 3 parqueos. Ubicado en exclusivo edificio con amenidades de primer nivel.",
					price: 550000,
					currency: "USD",
					address: {
						street: "Av. Tiradentes 89, Torre Premium",
						city: "Santo Domingo",
						state: "Distrito Nacional",
						country: "República Dominicana",
						postalCode: "10134",
					},
					type: "penthouse",
					features: {
						bedrooms: 4,
						bathrooms: 4,
						area: 320,
						parking: true,
						balcony: true,
						furnished: true,
						terrace: true,
						gym: true,
						pool: true,
						security: true,
					},
					images: [
						{
							url: "/optimized_villa2/1.webp",
							alt: "Penthouse de lujo",
							order: 0,
						},
					],
					status: "published",
					featured: true,
					userId: "user-1",
					publishedAt: new Date(),
				},
				{
					id: "prop-5",
					title: "Villa en Las Terrenas con Vista al Mar",
					description:
						"Hermosa villa estilo caribeño en Las Terrenas, Samaná. Construcción de madera tropical con amplios espacios abiertos, terraza con vista al mar, jardín tropical y a solo 5 minutos de la playa. Ambiente relajado y paradisíaco.",
					price: 380000,
					currency: "USD",
					address: {
						street: "Cosón, Camino Playa Cosón",
						city: "Las Terrenas",
						state: "Samaná",
						country: "República Dominicana",
						postalCode: "32000",
					},
					type: "villa",
					features: {
						bedrooms: 3,
						bathrooms: 3,
						area: 250,
						parking: true,
						balcony: true,
						furnished: true,
						pool: true,
						garden: true,
						beachAccess: true,
					},
					images: [
						{
							url: "/optimized_villa2/2.webp",
							alt: "Villa tropical en Las Terrenas",
							order: 0,
						},
					],
					status: "published",
					featured: false,
					userId: "user-1",
					publishedAt: new Date(),
				},
				{
					id: "prop-6",
					title: "Apartamento Económico en Los Mina",
					description:
						"Apartamento de 2 habitaciones ideal para primera vivienda o inversión. Ubicado en zona accesible con transporte público, comercios y escuelas cercanas. Excelente oportunidad para familias jóvenes.",
					price: 65000,
					currency: "USD",
					address: {
						street: "Calle Principal 234, Residencial Los Pinos",
						city: "Santo Domingo Este",
						state: "Santo Domingo",
						country: "República Dominicana",
						postalCode: "11501",
					},
					type: "apartment",
					features: {
						bedrooms: 2,
						bathrooms: 1,
						area: 75,
						parking: true,
						balcony: false,
						furnished: false,
					},
					images: [
						{
							url: "/placeholder.svg",
							alt: "Apartamento económico",
							order: 0,
						},
					],
					status: "published",
					featured: false,
					userId: "user-1",
					publishedAt: new Date(),
				},
			])
			.onConflictDoNothing();

		// Seed sample lands
		console.log("🌾 Seeding sample lands...");
		await db
			.insert(lands)
			.values([
				{
					id: "land-1",
					name: "Prime Development Land",
					description:
						"Excellent location for residential or commercial development.",
					area: 5000,
					price: 150000,
					currency: "USD",
					location: "Suburban Area, CA",
					address: {
						street: "456 Development Ave",
						city: "Suburban Area",
						state: "CA",
						country: "USA",
						postalCode: "90211",
					},
					type: "residential",
					features: {
						zoning: "residential",
						utilities: ["water", "electricity"],
						access: "paved road",
						topography: "flat",
					},
					images: [
						{
							url: "/placeholder.svg",
							alt: "Development land overview",
							order: 0,
						},
					],
					status: "available",
					userId: "user-1",
				},
			])
			.onConflictDoNothing();

		// Seed sample blog posts
		console.log("📰 Seeding sample blog posts...");
		await db
			.insert(blogPosts)
			.values([
				{
					id: "blog-1",
					title: "Real Estate Market Trends 2024",
					content:
						"The real estate market continues to evolve with new trends emerging...",
					excerpt:
						"Discover the latest trends shaping the real estate market in 2024.",
					slug: "real-estate-market-trends-2024",
					status: "published",
					category: "market-insights",
					tags: ["market", "trends", "2024"],
					coverImage: {
						url: "/placeholder.svg",
						alt: "Market trends chart",
					},
					authorId: "user-1",
					publishedAt: new Date(),
					readTime: 5,
					views: 0,
				},
			])
			.onConflictDoNothing();

		console.log("✅ Database seeding completed successfully!");
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		throw error;
	}
}

export async function clearDatabase() {
	console.log("🧹 Clearing database...");

	try {
		// Clear in reverse order of dependencies
		await db.delete(blogPosts);
		await db.delete(blogCategories);
		await db.delete(lands);
		await db.delete(properties);
		await db.delete(users);

		console.log("✅ Database cleared successfully!");
	} catch (error) {
		console.error("❌ Error clearing database:", error);
		throw error;
	}
}

// CLI runner
if (require.main === module) {
	const command = process.argv[2];

	if (command === "seed") {
		seedDatabase()
			.then(() => process.exit(0))
			.catch(() => process.exit(1));
	} else if (command === "clear") {
		clearDatabase()
			.then(() => process.exit(0))
			.catch(() => process.exit(1));
	} else {
		console.log("Usage: tsx src/lib/db/seed.ts [seed|clear]");
		process.exit(1);
	}
}
