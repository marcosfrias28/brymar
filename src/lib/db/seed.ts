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
    await db
        .insert(users)
        .values([
            {
                id: "user-1",
                name: "Seeder User",
                email: "seed@example.com",
                emailVerified: true,
                role: "admin",
                image: null,
                firstName: "Seed",
                lastName: "User",
                phone: null,
                bio: null,
                location: "República Dominicana",
            },
        ])
        .onConflictDoNothing();
	await db
		.insert(blogCategories)
		.values([
			{
				id: "cat-1",
				name: "Noticias de Propiedades",
				slug: "noticias-propiedades",
				description:
					"Últimas noticias y actualizaciones sobre propiedades en República Dominicana",
				color: "#3B82F6",
				isActive: true,
			},
			{
				id: "cat-2",
				name: "Análisis del Mercado",
				slug: "analisis-mercado",
				description:
					"Análisis y tendencias del mercado inmobiliario dominicano",
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
	await db
		.insert(properties)
		.values([
			{
				id: "prop-1",
				title: "Villa de Lujo Frente al Mar en Punta Cana",
				description:
					"Espectacular villa de lujo con 5 habitaciones frente al mar Caribe. Cuenta con piscina infinita, jacuzzi, acceso privado a la playa, acabados de primera calidad y vistas panorámicas al océano. Perfecta para familias que buscan el estilo de vida caribeño.",
				price: 1_250_000,
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
				price: 185_000,
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
				price: 425_000,
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
				price: 550_000,
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
				price: 380_000,
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
				price: 65_000,
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
			{
				id: "prop-7",
				title: "Casa moderna en Punta Cana",
				description:
					"Residencia moderna con espacios abiertos y acabados premium, cerca de zonas turísticas.",
				price: 350_000,
				currency: "USD",
				address: {
					street: "Av. Barceló 45",
					city: "Punta Cana",
					state: "La Altagracia",
					country: "República Dominicana",
					postalCode: "23000",
				},
				type: "house",
				features: {
					bedrooms: 4,
					bathrooms: 3,
					area: 220,
					parking: true,
					balcony: true,
					furnished: false,
					pool: true,
				},
				images: [
					{
						url: "https://source.unsplash.com/random/1200x800/?punta-cana,house&sig=301",
						alt: "Casa moderna en Punta Cana",
						order: 0,
					},
				],
				status: "published",
				featured: false,
				userId: "user-1",
				publishedAt: new Date(),
			},
			{
				id: "prop-8",
				title: "Apartamento en Piantini",
				description:
					"Apartamento de lujo cerca de centros comerciales y restaurantes.",
				price: 285_000,
				currency: "USD",
				address: {
					street: "Calle Gustavo Mejía Ricart 120",
					city: "Santo Domingo",
					state: "Distrito Nacional",
					country: "República Dominicana",
					postalCode: "10148",
				},
				type: "apartment",
				features: {
					bedrooms: 2,
					bathrooms: 2,
					area: 140,
					parking: true,
					balcony: true,
					furnished: false,
					gym: true,
					pool: true,
				},
				images: [
					{
						url: "https://source.unsplash.com/random/1200x800/?piantini,apartment&sig=302",
						alt: "Apartamento en Piantini",
						order: 0,
					},
				],
				status: "published",
				featured: true,
				userId: "user-1",
				publishedAt: new Date(),
			},
			{
				id: "prop-9",
				title: "Casa con jardín en La Romana",
				description:
					"Hermosa casa con amplio jardín y área social.",
				price: 210_000,
				currency: "USD",
				address: {
					street: "Calle Duarte 56",
					city: "La Romana",
					state: "La Romana",
					country: "República Dominicana",
					postalCode: "22000",
				},
				type: "house",
				features: {
					bedrooms: 3,
					bathrooms: 2,
					area: 170,
					parking: true,
					garden: true,
					furnished: false,
				},
				images: [
					{
						url: "https://source.unsplash.com/random/1200x800/?la-romana,house&sig=303",
						alt: "Casa con jardín en La Romana",
						order: 0,
					},
				],
				status: "published",
				featured: false,
				userId: "user-1",
				publishedAt: new Date(),
			},
			{
				id: "prop-10",
				title: "Villa en Casa de Campo",
				description:
					"Villa de lujo con piscina y acabados de alta gama en exclusivo complejo.",
				price: 980_000,
				currency: "USD",
				address: {
					street: "Casa de Campo",
					city: "La Romana",
					state: "La Romana",
					country: "República Dominicana",
					postalCode: "22000",
				},
				type: "villa",
				features: {
					bedrooms: 5,
					bathrooms: 5,
					area: 450,
					parking: true,
					pool: true,
					furnished: true,
					security: true,
				},
				images: [
					{
						url: "https://source.unsplash.com/random/1200x800/?villa,luxury&sig=304",
						alt: "Villa en Casa de Campo",
						order: 0,
					},
				],
				status: "published",
				featured: true,
				userId: "user-1",
				publishedAt: new Date(),
			},
		])
		.onConflictDoNothing();
	await db
		.insert(lands)
		.values([
			{
				id: "land-1",
				name: "Terreno residencial en Santo Domingo Este",
				description:
					"Parcela ideal para construir vivienda, cerca de avenidas principales y servicios.",
				area: 380,
				price: 65_000,
				currency: "USD",
				location: "Santo Domingo Este, Santo Domingo",
				address: {
					street: "Calle Principal 12",
					city: "Santo Domingo Este",
					state: "Santo Domingo",
					country: "República Dominicana",
					postalCode: "11501",
				},
				type: "residential",
				features: {
					zoning: "residential",
					utilities: ["water", "electricity"],
					access: "calle asfaltada",
					topography: "plano",
				},
				images: [
					{
						url: "https://source.unsplash.com/random/1200x800/?dominican,land&sig=101",
						alt: "Terreno residencial en Santo Domingo Este",
						order: 0,
					},
				],
				status: "published",
				userId: "user-1",
			},
			{
				id: "land-2",
				name: "Solar en Punta Cana cerca de la playa",
				description:
					"Terreno a pocos minutos del mar, ideal para proyecto turístico o residencial.",
				area: 520,
				price: 130_000,
				currency: "USD",
				location: "Punta Cana, La Altagracia",
				address: {
					street: "Carretera Coral",
					city: "Punta Cana",
					state: "La Altagracia",
					country: "República Dominicana",
					postalCode: "23000",
				},
				type: "touristic",
				features: {
					nearBeach: true,
					zoning: "turístico",
					access: "calle asfaltada",
					topography: "plano",
				},
				images: [
					{
						url: "https://source.unsplash.com/random/1200x800/?punta-cana,land&sig=103",
						alt: "Solar en Punta Cana",
						order: 0,
					},
				],
				status: "published",
				userId: "user-1",
			},
			{
				id: "land-3",
				name: "Lote en Bávaro con servicios",
				description:
					"Parcela con acceso a agua y electricidad, excelente para inversión.",
				area: 400,
				price: 90_000,
				currency: "USD",
				location: "Bávaro, La Altagracia",
				address: {
					street: "Av. España",
					city: "Bávaro",
					state: "La Altagracia",
					country: "República Dominicana",
					postalCode: "23301",
				},
				type: "residential",
				features: {
					utilities: ["water", "electricity"],
					access: "calle asfaltada",
					topography: "ligeramente ondulada",
				},
				images: [
					{
						url: "https://source.unsplash.com/random/1200x800/?bavaro,land&sig=105",
						alt: "Lote en Bávaro",
						order: 0,
					},
				],
				status: "published",
				userId: "user-1",
			},
			{
				id: "land-4",
				name: "Terreno agrícola en La Vega",
				description:
					"Suelo fértil ideal para cultivos diversos, acceso a camino vecinal.",
				area: 1500,
				price: 45_000,
				currency: "USD",
				location: "La Vega",
				address: {
					street: "Camino a Jarabacoa",
					city: "La Vega",
					state: "La Vega",
					country: "República Dominicana",
					postalCode: "41000",
				},
				type: "agricultural",
				features: {
					soil: "fértil",
					irrigation: false,
					access: "camino vecinal",
					topography: "mixta",
				},
				images: [
					{
						url: "https://source.unsplash.com/random/1200x800/?agriculture,field&sig=107",
						alt: "Terreno agrícola en La Vega",
						order: 0,
					},
				],
				status: "published",
				userId: "user-1",
			},
			{
				id: "land-5",
				name: "Parcelas en San Cristóbal",
				description:
					"Terrenos con acceso a carretera y servicios básicos, listos para construir.",
				area: 600,
				price: 55_000,
				currency: "USD",
				location: "San Cristóbal",
				address: {
					street: "Carretera Sánchez",
					city: "San Cristóbal",
					state: "San Cristóbal",
					country: "República Dominicana",
					postalCode: "91000",
				},
				type: "residential",
				features: {
					utilities: ["water", "electricity"],
					access: "carretera principal",
					topography: "plano",
				},
				images: [
					{
						url: "https://source.unsplash.com/random/1200x800/?san-cristobal,land&sig=109",
						alt: "Parcelas en San Cristóbal",
						order: 0,
					},
				],
				status: "published",
				userId: "user-1",
			},
			{
				id: "land-6",
				name: "Terreno comercial en Santiago",
				description:
					"Ubicado en zona de alto tráfico, perfecto para locales comerciales o plazas.",
				area: 700,
				price: 180_000,
				currency: "USD",
				location: "Santiago",
				address: {
					street: "Av. Juan Pablo Duarte",
					city: "Santiago",
					state: "Santiago",
					country: "República Dominicana",
					postalCode: "51000",
				},
				type: "commercial",
				features: {
					zoning: "comercial",
					cornerLot: true,
					access: "avenida principal",
					topography: "plano",
				},
				images: [
					{
						url: "https://source.unsplash.com/random/1200x800/?santiago,commercial&sig=111",
						alt: "Terreno comercial en Santiago",
						order: 0,
					},
				],
				status: "published",
				userId: "user-1",
			},
			{
				id: "land-7",
				name: "Solar en Juan Dolio a pasos del mar",
				description:
					"Terreno con gran potencial para proyecto residencial vacacional.",
				area: 620,
				price: 160_000,
				currency: "USD",
				location: "Juan Dolio",
				address: {
					street: "Calle Costera",
					city: "Juan Dolio",
					state: "San Pedro de Macorís",
					country: "República Dominicana",
					postalCode: "21000",
				},
				type: "touristic",
				features: {
					nearBeach: true,
					security: true,
					access: "calle asfaltada",
					topography: "plano",
				},
				images: [
					{
						url: "https://source.unsplash.com/random/1200x800/?juan-dolio,beach&sig=113",
						alt: "Solar en Juan Dolio",
						order: 0,
					},
				],
				status: "published",
				userId: "user-1",
			},
			{
				id: "land-8",
				name: "Terreno en Cabarete cerca de deportes acuáticos",
				description:
					"Ideal para villas o pequeños hoteles, ambiente turístico activo.",
				area: 800,
				price: 210_000,
				currency: "USD",
				location: "Cabarete",
				address: {
					street: "Carretera Principal",
					city: "Cabarete",
					state: "Puerto Plata",
					country: "República Dominicana",
					postalCode: "57000",
				},
				type: "touristic",
				features: {
					nearBeach: true,
					waterSports: true,
					access: "carretera",
					topography: "mixta",
				},
				images: [
					{
						url: "https://source.unsplash.com/random/1200x800/?cabarete,beach&sig=115",
						alt: "Terreno en Cabarete",
						order: 0,
					},
				],
				status: "published",
				userId: "user-1",
			},
			{
				id: "land-9",
				name: "Lote en Jarabacoa con vista a montañas",
				description:
					"Clima agradable, ideal para cabañas y desarrollos ecoturísticos.",
				area: 900,
				price: 120_000,
				currency: "USD",
				location: "Jarabacoa",
				address: {
					street: "Camino al Salto",
					city: "Jarabacoa",
					state: "La Vega",
					country: "República Dominicana",
					postalCode: "41000",
				},
				type: "ecotourism",
				features: {
					mountainView: true,
					coolClimate: true,
					access: "camino vecinal",
					topography: "montañoso",
				},
				images: [
					{
						url: "https://source.unsplash.com/random/1200x800/?jarabacoa,mountain&sig=117",
						alt: "Lote en Jarabacoa",
						order: 0,
					},
				],
				status: "published",
				userId: "user-1",
			},
			{
				id: "land-10",
				name: "Parcela en Barahona cerca de playas vírgenes",
				description:
					"Gran potencial ecoturístico y de desarrollo sostenible.",
				area: 1000,
				price: 80_000,
				currency: "USD",
				location: "Barahona",
				address: {
					street: "Carretera Enriquillo",
					city: "Barahona",
					state: "Barahona",
					country: "República Dominicana",
					postalCode: "81000",
				},
				type: "ecotourism",
				features: {
					ecoPotential: true,
					nearBeach: true,
					access: "carretera",
					topography: "mixta",
				},
				images: [
					{
						url: "https://source.unsplash.com/random/1200x800/?barahona,beach&sig=119",
						alt: "Parcela en Barahona",
						order: 0,
					},
				],
				status: "published",
				userId: "user-1",
			},
		])
		.onConflictDoNothing();
	await db
		.insert(blogPosts)
		.values([
			{
				id: "blog-1",
				title: "Guía para comprar vivienda en República Dominicana",
				content:
					"Comprar vivienda en RD requiere evaluar ubicación, presupuesto y tipo de propiedad. Recomendamos análisis de mercado y asesoría legal.",
				excerpt:
					"Consejos claves para adquirir tu hogar en RD.",
				slug: "guia-comprar-vivienda-rd",
				status: "published",
				category: "guias",
				tags: ["compra", "hogar", "RD"],
				coverImage: {
					url: "https://source.unsplash.com/random/1200x800/?dominican,home&sig=201",
					alt: "Guía para comprar vivienda",
				},
				authorId: "user-1",
				publishedAt: new Date(),
				readTime: 6,
				views: 0,
			},
			{
				id: "blog-2",
				title: "Mejores zonas para invertir en Santo Domingo",
				content:
					"Zonas como Piantini, Naco y Bella Vista presentan alta valorización y demanda sostenida.",
				excerpt:
					"Zonas con alto potencial de valorización.",
				slug: "mejores-zonas-invertir-sd",
				status: "published",
				category: "analisis",
				tags: ["inversión", "Santo Domingo"],
				coverImage: {
					url: "https://source.unsplash.com/random/1200x800/?santo-domingo,city&sig=202",
					alt: "Zonas de inversión",
				},
				authorId: "user-1",
				publishedAt: new Date(),
				readTime: 4,
				views: 0,
			},
			{
				id: "blog-3",
				title: "Cómo preparar tu casa para la venta",
				content:
					"Mejoras menores, limpieza profunda y fotografías profesionales aceleran la venta y mejoran el precio.",
				excerpt:
					"Checklist para vender más rápido.",
				slug: "como-preparar-casa-venta",
				status: "published",
				category: "consejos",
				tags: ["venta", "consejos"],
				coverImage: {
					url: "https://source.unsplash.com/random/1200x800/?house,interior&sig=203",
					alt: "Preparar casa para venta",
				},
				authorId: "user-1",
				publishedAt: new Date(),
				readTime: 5,
				views: 0,
			},
			{
				id: "blog-4",
				title: "Tendencias del mercado inmobiliario 2025",
				content:
					"Proyecciones de demanda, precios y desarrollos en República Dominicana para 2025.",
				excerpt:
					"Qué esperar del mercado este año.",
				slug: "tendencias-mercado-2025",
				status: "published",
				category: "analisis",
				tags: ["tendencias", "mercado"],
				coverImage: {
					url: "https://source.unsplash.com/random/1200x800/?market,chart&sig=204",
					alt: "Tendencias 2025",
				},
				authorId: "user-1",
				publishedAt: new Date(),
				readTime: 7,
				views: 0,
			},
			{
				id: "blog-5",
				title: "Ventajas de vivir cerca de la playa",
				content:
					"La vida costera ofrece bienestar, ocio y un entorno único con acceso al mar.",
				excerpt:
					"Beneficios de una vida costera.",
				slug: "ventajas-vivir-cerca-playa",
				status: "published",
				category: "estilo-de-vida",
				tags: ["playa", "bienestar"],
				coverImage: {
					url: "https://source.unsplash.com/random/1200x800/?beach,caribbean&sig=205",
					alt: "Vida cerca de la playa",
				},
				authorId: "user-1",
				publishedAt: new Date(),
				readTime: 3,
				views: 0,
			},
		])
		.onConflictDoNothing();
}

export async function clearDatabase() {
	// Clear in reverse order of dependencies
	await db.delete(blogPosts);
	await db.delete(blogCategories);
	await db.delete(lands);
	await db.delete(properties);
	await db.delete(users);
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
		process.exit(1);
	}
}
