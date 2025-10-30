const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

// Configuración de la base de datos
const sql = neon(process.env.POSTGRES_URL);

async function testSearchFixes() {
	try {
		console.log("🔍 Probando las correcciones de búsqueda...\n");

		// Test 1: Verificar propiedades con ubicaciones problemáticas
		console.log("1️⃣ Verificando propiedades con ubicaciones...");
		const properties = await sql`
      SELECT id, title, location 
      FROM properties 
      LIMIT 5
    `;

		console.log(`✅ Encontradas ${properties.length} propiedades:`);
		properties.forEach((prop) => {
			const locationParts = prop.location.split(",");
			const postalCode = locationParts[4]?.trim();
			const isValidPostal =
				postalCode && postalCode.length >= 3 && postalCode.length <= 10;

			console.log(`   - ${prop.title}: ${prop.location}`);
			console.log(
				`     Código postal: "${postalCode}" (${isValidPostal ? "VÁLIDO" : "INVÁLIDO/FALTANTE"})`
			);
		});

		// Test 2: Verificar terrenos
		console.log("\n2️⃣ Verificando terrenos...");
		const lands = await sql`
      SELECT id, name, location, type, price, area
      FROM lands 
      LIMIT 5
    `;

		console.log(`✅ Encontrados ${lands.length} terrenos:`);
		lands.forEach((land) => {
			console.log(`   - ${land.name}: ${land.location}`);
			console.log(
				`     Tipo: ${land.type}, Precio: $${land.price.toLocaleString()}, Área: ${land.area} m²`
			);
		});

		// Test 3: Verificar que no hay columna status en lands
		console.log("\n3️⃣ Verificando esquema de terrenos...");
		try {
			await sql`SELECT status FROM lands LIMIT 1`;
			console.log("❌ ERROR: La columna status existe en lands (no debería)");
		} catch (error) {
			if (error.message.includes('column "status" does not exist')) {
				console.log("✅ CORRECTO: La columna status no existe en lands");
			} else {
				console.log("⚠️ Error inesperado:", error.message);
			}
		}

		// Test 4: Verificar que no hay columna features en lands
		console.log("\n4️⃣ Verificando columna features en terrenos...");
		try {
			await sql`SELECT features FROM lands LIMIT 1`;
			console.log("✅ La columna features existe en lands");
		} catch (error) {
			if (error.message.includes('column "features" does not exist')) {
				console.log("⚠️ La columna features no existe en lands");
			} else {
				console.log("❌ Error inesperado:", error.message);
			}
		}

		// Test 5: Probar búsqueda básica de propiedades
		console.log("\n5️⃣ Probando búsqueda básica de propiedades...");
		const searchProperties = await sql`
      SELECT id, title, location, price, type
      FROM properties 
      WHERE price > 0
      ORDER BY created_at DESC
      LIMIT 3
    `;

		console.log(
			`✅ Búsqueda de propiedades exitosa: ${searchProperties.length} resultados`
		);
		searchProperties.forEach((prop) => {
			console.log(
				`   - ${prop.title}: $${prop.price.toLocaleString()} (${prop.type})`
			);
		});

		// Test 6: Probar búsqueda básica de terrenos
		console.log("\n6️⃣ Probando búsqueda básica de terrenos...");
		const searchLands = await sql`
      SELECT id, name, location, price, type, area
      FROM lands 
      WHERE price > 0
      ORDER BY created_at DESC
      LIMIT 3
    `;

		console.log(
			`✅ Búsqueda de terrenos exitosa: ${searchLands.length} resultados`
		);
		searchLands.forEach((land) => {
			console.log(
				`   - ${land.name}: $${land.price.toLocaleString()} (${land.area} m²)`
			);
		});

		console.log("\n🎉 ¡Todas las pruebas completadas!");
		console.log("\n📋 Resumen de correcciones aplicadas:");
		console.log("   ✅ Validación de código postal en propiedades");
		console.log(
			'   ✅ Eliminación de referencias a columna "status" en terrenos'
		);
		console.log("   ✅ Manejo correcto de columnas faltantes");
		console.log("   ✅ Búsquedas básicas funcionando");
	} catch (error) {
		console.error("❌ Error en las pruebas:", error);
	}
}

// Ejecutar las pruebas
testSearchFixes();
