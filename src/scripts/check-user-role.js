// Script para verificar el rol real del usuario en la base de datos
const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const { users } = require("../lib/db/schema");

async function checkUserRole() {
	try {
		// Configurar conexión a la base de datos
		const connectionString =
			process.env.DATABASE_URL || process.env.POSTGRES_URL;
		if (!connectionString) {
			console.error(
				"❌ No se encontró DATABASE_URL o POSTGRES_URL en las variables de entorno"
			);
			return;
		}

		const client = postgres(connectionString);
		const db = drizzle(client);

		// Obtener todos los usuarios y sus roles
		const allUsers = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				role: users.role,
				createdAt: users.createdAt,
			})
			.from(users);

		console.log("📊 Usuarios en la base de datos:");
		console.log("=====================================");

		allUsers.forEach((user, index) => {
			console.log(`${index + 1}. ${user.name || "Sin nombre"}`);
			console.log(`   Email: ${user.email}`);
			console.log(`   Rol: ${user.role}`);
			console.log(`   ID: ${user.id}`);
			console.log(`   Creado: ${user.createdAt}`);
			console.log("---");
		});

		// Buscar específicamente el usuario "Marcos"
		const marcosUser = allUsers.find(
			(user) =>
				user.name?.toLowerCase().includes("marcos") ||
				user.email?.toLowerCase().includes("marcos")
		);

		if (marcosUser) {
			console.log('🔍 Usuario "Marcos" encontrado:');
			console.log(`   Rol en BD: ${marcosUser.role}`);
			console.log(`   Email: ${marcosUser.email}`);
			console.log(`   ID: ${marcosUser.id}`);
		} else {
			console.log('❌ No se encontró usuario "Marcos"');
		}

		await client.end();
	} catch (error) {
		console.error("❌ Error al verificar roles de usuario:", error);
	}
}

checkUserRole();
