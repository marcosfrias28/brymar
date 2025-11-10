#!/usr/bin/env node

/**
 * Script para cargar usuarios iniciales
 * Compatible con Better Auth y el nuevo schema
 */

const { config } = require("dotenv");
const { sql } = require("@vercel/postgres");

// Cargar variables de entorno
config();

// Datos de usuarios de ejemplo
const sampleUsers = [
	{
		id: "seed_user_001",
		email: "admin@brymar.com",
		name: "Administrador Marbry",
		firstName: "Admin",
		lastName: "Marbry",
		phone: "+1-809-555-0001",
		role: "admin",
		isActive: true,
	},
	{
		id: "seed_user_002",
		email: "agente@brymar.com",
		name: "Marco Marbry",
		firstName: "Marco",
		lastName: "Marbry",
		phone: "+1-809-555-0002",
		role: "agent",
		isActive: true,
	},
	{
		id: "seed_user_003",
		email: "cliente@example.com",
		name: "Cliente Demo",
		firstName: "Cliente",
		lastName: "Demo",
		phone: "+1-809-555-0003",
		role: "user",
		isActive: true,
	},
	{
		id: "seed_user_004",
		email: "contact@mzn.group",
		name: "MZN Group Contact",
		firstName: "MZN",
		lastName: "Group",
		phone: "+1-809-555-0004",
		role: "admin",
		isActive: true,
	},
];

async function seedUsers() {
	try {
		console.log("👥 SEED DE USUARIOS - BRYMAR");
		console.log("============================\n");

		// Verificar que la tabla users existe
		const tableCheck = await sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            );
        `;

		if (!tableCheck.rows[0].exists) {
			console.error('❌ Error: La tabla "users" no existe');
			console.error("   Ejecuta primero: npm run db:push");
			process.exit(1);
		}

		console.log('✅ Tabla "users" encontrada');

		// Limpiar usuarios de ejemplo existentes
		console.log("🧹 Limpiando usuarios de ejemplo anteriores...");
		await sql`DELETE FROM users WHERE id LIKE 'seed_user_%'`;

		// Insertar usuarios
		console.log("📝 Insertando usuarios de ejemplo...\n");

		let insertedCount = 0;

		for (const user of sampleUsers) {
			try {
				const preferences = {
					theme: "light",
					language: "es",
					notifications: {
						email: true,
						push: true,
						marketing: false,
					},
					privacy: {
						profileVisible: true,
						contactInfoVisible: user.role === "agent",
					},
				};

				await sql`
                    INSERT INTO users (
                        id, email, name, first_name, last_name, phone, 
                        role, preferences, is_active, created_at, updated_at
                    ) VALUES (
                        ${user.id}, ${user.email}, ${user.name}, 
                        ${user.firstName}, ${user.lastName}, ${user.phone},
                        ${user.role}, ${JSON.stringify(preferences)}, 
                        ${user.isActive}, NOW(), NOW()
                    )
                `;

				const roleIcon =
					user.role === "admin" ? "👑" : user.role === "agent" ? "🏠" : "👤";
				console.log(
					`${roleIcon} ✅ ${user.name} (${user.role}) - ${user.email}`
				);
				insertedCount++;
			} catch (error) {
				console.log(`❌ Error insertando "${user.name}": ${error.message}`);
			}
		}

		console.log("\n🎉 Usuarios creados exitosamente!");
		console.log(
			`📊 Total insertados: ${insertedCount}/${sampleUsers.length}\n`
		);
	} catch (error) {
		console.error("❌ Error durante el seed de usuarios:", error.message);
		process.exit(1);
	}
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
	seedUsers().catch(console.error);
}

module.exports = { seedUsers, sampleUsers };
