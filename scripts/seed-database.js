/**
 * Database seed script for properties, lands, and user activities
 * This script populates the database with sample data for development
 */

const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const { eq } = require("drizzle-orm");

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	console.error("DATABASE_URL environment variable is required");
	process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql);

// Sample properties data
const sampleProperties = [
	{
		title: "Villa Moderna Milano",
		description: "Elegante villa moderna nel cuore di Milano, perfetta per famiglie che cercano comfort e lusso. La proprietà offre spazi ampi e luminosi, con un design contemporaneo che si integra perfettamente con l'ambiente urbano.",
		price: 850000,
		currency: "EUR",
		propertyType: "villa",
		status: "available",
		bedrooms: 4,
		bathrooms: 3,
		area: 180,
		areaUnit: "sqm",
		yearBuilt: 2020,
		location: "Milano, Lombardia, Italia",
		address: "Via Montenapoleone 15, 20121 Milano",
		latitude: 45.4642,
		longitude: 9.1900,
		features: ["giardino", "garage", "terrazza", "ascensore", "climatizzazione"],
		images: [
			"/images/properties/villa-milano-1.jpg",
			"/images/properties/villa-milano-2.jpg",
			"/images/properties/villa-milano-3.jpg"
		],
		contactInfo: {
			agentName: "Marco Rossi",
			agentPhone: "+39 02 1234 5678",
			agentEmail: "marco.rossi@brymar.com"
		}
	},
	{
		title: "Appartamento Centro Storico Roma",
		description: "Affascinante appartamento nel centro storico di Roma, a pochi passi dal Colosseo. Ristrutturato di recente, mantiene il fascino dell'architettura romana con tutti i comfort moderni.",
		price: 650000,
		currency: "EUR",
		propertyType: "apartment",
		status: "available",
		bedrooms: 3,
		bathrooms: 2,
		area: 120,
		areaUnit: "sqm",
		yearBuilt: 2018,
		location: "Roma, Lazio, Italia",
		address: "Via del Corso 45, 00186 Roma",
		latitude: 41.9028,
		longitude: 12.4964,
		features: ["balcone", "cantina", "portiere", "riscaldamento autonomo"],
		images: [
			"/images/properties/roma-centro-1.jpg",
			"/images/properties/roma-centro-2.jpg"
		],
		contactInfo: {
			agentName: "Giulia Bianchi",
			agentPhone: "+39 06 9876 5432",
			agentEmail: "giulia.bianchi@brymar.com"
		}
	},
	{
		title: "Casa di Campagna Toscana",
		description: "Incantevole casa di campagna in Toscana, immersa nella natura. Ideale per chi cerca tranquillità e relax, con vista panoramica sulle colline toscane.",
		price: 450000,
		currency: "EUR",
		propertyType: "house",
		status: "available",
		bedrooms: 3,
		bathrooms: 2,
		area: 200,
		areaUnit: "sqm",
		yearBuilt: 2015,
		location: "Siena, Toscana, Italia",
		address: "Strada Provinciale 12, 53010 Siena",
		latitude: 43.3188,
		longitude: 11.3307,
		features: ["giardino", "piscina", "cantina", "camino", "terrazza"],
		images: [
			"/images/properties/toscana-casa-1.jpg",
			"/images/properties/toscana-casa-2.jpg",
			"/images/properties/toscana-casa-3.jpg"
		],
		contactInfo: {
			agentName: "Francesco Neri",
			agentPhone: "+39 0577 123456",
			agentEmail: "francesco.neri@brymar.com"
		}
	},
	{
		title: "Loft Industriale Milano",
		description: "Stiloso loft industriale nel quartiere Isola di Milano. Spazio open plan con travi a vista e grandi finestre, perfetto per giovani professionisti.",
		price: 420000,
		currency: "EUR",
		propertyType: "loft",
		status: "available",
		bedrooms: 2,
		bathrooms: 1,
		area: 85,
		areaUnit: "sqm",
		yearBuilt: 2019,
		location: "Milano, Lombardia, Italia",
		address: "Via Borsieri 8, 20159 Milano",
		latitude: 45.4856,
		longitude: 9.1900,
		features: ["open space", "travi a vista", "terrazza", "ascensore"],
		images: [
			"/images/properties/loft-milano-1.jpg",
			"/images/properties/loft-milano-2.jpg"
		],
		contactInfo: {
			agentName: "Alessandra Verde",
			agentPhone: "+39 02 8765 4321",
			agentEmail: "alessandra.verde@brymar.com"
		}
	},
	{
		title: "Villa sul Lago di Como",
		description: "Lussuosa villa sul Lago di Como con vista mozzafiato. Giardino privato che scende fino al lago, ideale per chi cerca esclusività e privacy.",
		price: 1200000,
		currency: "EUR",
		propertyType: "villa",
		status: "available",
		bedrooms: 5,
		bathrooms: 4,
		area: 300,
		areaUnit: "sqm",
		yearBuilt: 2021,
		location: "Como, Lombardia, Italia",
		address: "Via del Lago 25, 22100 Como",
		latitude: 45.8081,
		longitude: 9.0852,
		features: ["vista lago", "giardino", "piscina", "garage", "portineria"],
		images: [
			"/images/properties/villa-como-1.jpg",
			"/images/properties/villa-como-2.jpg",
			"/images/properties/villa-como-3.jpg"
		],
		contactInfo: {
			agentName: "Roberto Blu",
			agentPhone: "+39 031 234567",
			agentEmail: "roberto.blu@brymar.com"
		}
	}
];

// Sample lands data
const sampleLands = [
	{
		title: "Terreno Agricolo Puglia",
		description: "Vasto terreno agricolo in Puglia, ideale per coltivazioni biologiche. Terreno fertile con accesso all'acqua e possibilità di costruire una casa colonica.",
		price: 150000,
		currency: "EUR",
		landType: "agricultural",
		status: "available",
		area: 5000,
		areaUnit: "sqm",
		location: "Lecce, Puglia, Italia",
		address: "Contrada Masseria Vecchia, 73010 Lecce",
		latitude: 40.3522,
		longitude: 18.1720,
		features: ["terreno fertile", "accesso acqua", "possibilità costruzione"],
		images: [
			"/images/lands/puglia-terreno-1.jpg",
			"/images/lands/puglia-terreno-2.jpg"
		],
		contactInfo: {
			agentName: "Antonio Pugliese",
			agentPhone: "+39 0832 123456",
			agentEmail: "antonio.pugliese@brymar.com"
		}
	},
	{
		title: "Lotto Edificabile Sicilia",
		description: "Lotto edificabile in Sicilia con vista mare. Terreno pianeggiante, ideale per costruire una villa privata o un complesso residenziale.",
		price: 280000,
		currency: "EUR",
		landType: "residential",
		status: "available",
		area: 2000,
		areaUnit: "sqm",
		location: "Taormina, Sicilia, Italia",
		address: "Via del Mare 12, 98039 Taormina",
		latitude: 37.8534,
		longitude: 15.2880,
		features: ["vista mare", "terreno pianeggiante", "accesso strada"],
		images: [
			"/images/lands/sicilia-lotto-1.jpg",
			"/images/lands/sicilia-lotto-2.jpg"
		],
		contactInfo: {
			agentName: "Carmela Siciliana",
			agentPhone: "+39 0942 234567",
			agentEmail: "carmela.siciliana@brymar.com"
		}
	},
	{
		title: "Bosco Trentino",
		description: "Bosco secolare in Trentino, perfetto per chi ama la natura. Terreno boschivo con alberi ad alto fusto, ideale per attività ricreative o investimento.",
		price: 180000,
		currency: "EUR",
		landType: "forest",
		status: "available",
		area: 3000,
		areaUnit: "sqm",
		location: "Trento, Trentino-Alto Adige, Italia",
		address: "Località Bosco Vecchio, 38100 Trento",
		latitude: 46.0748,
		longitude: 11.1217,
		features: ["alberi secolari", "sentieri", "casa di caccia"],
		images: [
			"/images/lands/trentino-bosco-1.jpg",
			"/images/lands/trentino-bosco-2.jpg"
		],
		contactInfo: {
			agentName: "Hans Trentino",
			agentPhone: "+39 0461 345678",
			agentEmail: "hans.trentino@brymar.com"
		}
	}
];

// Sample activities data
const sampleActivities = [
	{
		type: "view",
		title: "Visualizzazione proprietà",
		description: "Hai visualizzato Villa Moderna a Milano",
		details: "Proprietà visualizzata per 8 minuti",
		metadata: { propertyId: "property-1", duration: 480, source: "search" }
	},
	{
		type: "favorite",
		title: "Aggiunto ai preferiti",
		description: "Villa Moderna a Milano aggiunta ai preferiti",
		details: "Aggiunto alla lista dei preferiti",
		metadata: { propertyId: "property-1", action: "add" }
	},
	{
		type: "view",
		title: "Visualizzazione proprietà",
		description: "Hai visualizzato Appartamento Centro Storico a Roma",
		details: "Proprietà visualizzata per 12 minuti",
		metadata: { propertyId: "property-2", duration: 720, source: "direct" }
	},
	{
		type: "search",
		title: "Nuova ricerca",
		description: "Ricerca: Appartamenti a Milano, 2-3 camere, €400-800/mese",
		details: "Trovati 15 risultati",
		metadata: { 
			query: "appartamenti milano", 
			filters: { bedrooms: "2-3", priceRange: "400-800" },
			resultsCount: 15 
		}
	},
	{
		type: "contact",
		title: "Contatto proprietario",
		description: "Hai contattato il proprietario di Villa sul Lago di Como",
		details: "Tipo: inquiry, Proprietà ID: property-5",
		metadata: { propertyId: "property-5", contactType: "inquiry" }
	},
	{
		type: "view",
		title: "Visualizzazione terreno",
		description: "Hai visualizzato Terreno Agricolo Puglia",
		details: "Terreno visualizzato per 5 minuti",
		metadata: { landId: "land-1", duration: 300, source: "search" }
	},
	{
		type: "favorite",
		title: "Aggiunto ai preferiti",
		description: "Lotto Edificabile Sicilia aggiunto ai preferiti",
		details: "Aggiunto alla lista dei preferiti",
		metadata: { landId: "land-2", action: "add" }
	},
	{
		type: "search",
		title: "Nuova ricerca",
		description: "Ricerca: Terreni edificabili Sicilia, vista mare",
		details: "Trovati 8 risultati",
		metadata: { 
			query: "terreni edificabili sicilia", 
			filters: { landType: "residential", features: "vista mare" },
			resultsCount: 8 
		}
	},
	{
		type: "login",
		title: "Accesso effettuato",
		description: "Login da dispositivo mobile",
		details: "IP: 192.168.1.100, User Agent: Mobile Safari",
		metadata: { deviceInfo: "Mobile Safari", ipAddress: "192.168.1.100" }
	},
	{
		type: "profile",
		title: "Profilo aggiornato",
		description: "Modificate informazioni personali",
		details: "Aggiornato numero di telefono e indirizzo",
		metadata: { updatedFields: ["phone", "address"] }
	},
	{
		type: "settings",
		title: "Impostazioni modificate",
		description: "Modificata impostazione: notifiche email",
		details: "Da: false → A: true",
		metadata: { settingName: "emailNotifications", oldValue: false, newValue: true }
	},
	{
		type: "message",
		title: "Messaggio inviato",
		description: "Hai inviato un messaggio a Marco Rossi",
		details: "Destinatario: Marco Rossi",
		metadata: { recipientId: "agent-1", recipientName: "Marco Rossi", messageType: "sent" }
	},
	{
		type: "view",
		title: "Visualizzazione proprietà",
		description: "Hai visualizzato Casa di Campagna Toscana",
		details: "Proprietà visualizzata per 15 minuti",
		metadata: { propertyId: "property-3", duration: 900, source: "favorites" }
	},
	{
		type: "search",
		title: "Nuova ricerca",
		description: "Ricerca: Ville con piscina Lombardia",
		details: "Trovati 6 risultati",
		metadata: { 
			query: "ville piscina lombardia", 
			filters: { propertyType: "villa", features: "piscina", region: "lombardia" },
			resultsCount: 6 
		}
	},
	{
		type: "view",
		title: "Visualizzazione terreno",
		description: "Hai visualizzato Bosco Trentino",
		details: "Terreno visualizzato per 7 minuti",
		metadata: { landId: "land-3", duration: 420, source: "search" }
	}
];

async function findUserByEmail(email) {
	try {
		const users = await sql`
			SELECT id, email, name 
			FROM users 
			WHERE email = ${email}
		`;
		return users[0];
	} catch (error) {
		console.error("Error finding user:", error);
		return null;
	}
}

async function insertProperties(properties) {
	console.log("🏠 Inserting properties...");
	
	for (const property of properties) {
		try {
			await sql`
				INSERT INTO properties (
					title, description, price, currency, property_type, status,
					bedrooms, bathrooms, area, area_unit, year_built, location,
					address, latitude, longitude, features, images, contact_info,
					created_at, updated_at
				) VALUES (
					${property.title}, ${property.description}, ${property.price}, 
					${property.currency}, ${property.propertyType}, ${property.status},
					${property.bedrooms}, ${property.bathrooms}, ${property.area}, 
					${property.areaUnit}, ${property.yearBuilt}, ${property.location},
					${property.address}, ${property.latitude}, ${property.longitude}, 
					${JSON.stringify(property.features)}, ${JSON.stringify(property.images)}, 
					${JSON.stringify(property.contactInfo)}, NOW(), NOW()
				)
			`;
			console.log(`✅ Inserted property: ${property.title}`);
		} catch (error) {
			console.error(`❌ Error inserting property ${property.title}:`, error);
		}
	}
}

async function insertLands(lands) {
	console.log("🌱 Inserting lands...");
	
	for (const land of lands) {
		try {
			await sql`
				INSERT INTO lands (
					title, description, price, currency, land_type, status,
					area, area_unit, location, address, latitude, longitude, 
					features, images, contact_info, created_at, updated_at
				) VALUES (
					${land.title}, ${land.description}, ${land.price}, 
					${land.currency}, ${land.landType}, ${land.status},
					${land.area}, ${land.areaUnit}, ${land.location},
					${land.address}, ${land.latitude}, ${land.longitude}, 
					${JSON.stringify(land.features)}, ${JSON.stringify(land.images)}, 
					${JSON.stringify(land.contactInfo)}, NOW(), NOW()
				)
			`;
			console.log(`✅ Inserted land: ${land.title}`);
		} catch (error) {
			console.error(`❌ Error inserting land ${land.title}:`, error);
		}
	}
}

async function insertActivities(userId, activities) {
	console.log("📊 Inserting user activities...");
	
	for (const activity of activities) {
		try {
			// Generate random timestamp within the last 30 days
			const daysAgo = Math.floor(Math.random() * 30);
			const hoursAgo = Math.floor(Math.random() * 24);
			const minutesAgo = Math.floor(Math.random() * 60);
			const timestamp = new Date();
			timestamp.setDate(timestamp.getDate() - daysAgo);
			timestamp.setHours(timestamp.getHours() - hoursAgo);
			timestamp.setMinutes(timestamp.getMinutes() - minutesAgo);

			await sql`
				INSERT INTO user_activities (
					user_id, type, title, description, details, metadata,
					ip_address, user_agent, created_at, updated_at
				) VALUES (
					${userId}, ${activity.type}, ${activity.title}, 
					${activity.description}, ${activity.details || null}, 
					${JSON.stringify(activity.metadata)}, 
					'192.168.1.' + (100 + Math.floor(Math.random() * 155)),
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
					${timestamp}, ${timestamp}
				)
			`;
			console.log(`✅ Inserted activity: ${activity.title}`);
		} catch (error) {
			console.error(`❌ Error inserting activity ${activity.title}:`, error);
		}
	}
}

async function seedDatabase() {
	try {
		console.log("🌱 Starting database seeding...");
		
		// Find the user
		const user = await findUserByEmail("contact@mzn.group");
		if (!user) {
			console.error("❌ User with email contact@mzn.group not found");
			console.log("Please make sure the user exists in the database");
			process.exit(1);
		}
		
		console.log(`✅ Found user: ${user.name} (${user.email})`);
		
		// Insert properties
		await insertProperties(sampleProperties);
		
		// Insert lands
		await insertLands(sampleLands);
		
		// Insert activities
		await insertActivities(user.id, sampleActivities);
		
		console.log("🎉 Database seeding completed successfully!");
		console.log(`📊 Inserted ${sampleProperties.length} properties`);
		console.log(`🌱 Inserted ${sampleLands.length} lands`);
		console.log(`📈 Inserted ${sampleActivities.length} activities for user ${user.email}`);
		
	} catch (error) {
		console.error("💥 Database seeding failed:", error);
		throw error;
	} finally {
		await sql.end();
	}
}

// Run the seeding
seedDatabase()
	.then(() => {
		console.log("✅ Seeding process completed successfully!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("❌ Seeding process failed:", error);
		process.exit(1);
	});
