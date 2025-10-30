#!/usr/bin/env node

/**
 * Script para verificar la configuración de la base de datos
 * Ejecutar con: node scripts/check-db-config.js
 */

const { config } = require("dotenv");

// Cargar variables de entorno
config();

console.log("🔍 Verificando configuración de base de datos...\n");

// Variables de entorno esperadas
const expectedVars = [
	"POSTGRES_PRISMA_URL",
	"POSTGRES_URL_NON_POOLING",
	"POSTGRES_URL",
	"POSTGRES_USER",
	"POSTGRES_HOST",
	"POSTGRES_PASSWORD",
	"POSTGRES_DATABASE",
];

// Verificar variables de entorno
console.log("📋 Variables de entorno:");
expectedVars.forEach((varName) => {
	const value = process.env[varName];
	const status = value ? "✅" : "❌";
	const displayValue = value
		? varName.includes("PASSWORD")
			? "[HIDDEN]"
			: varName.includes("URL")
				? `${value.substring(0, 30)}...`
				: value
		: "No configurada";

	console.log(`${status} ${varName}: ${displayValue}`);
});

console.log("\n🔗 Análisis de conexiones:");

// Verificar POSTGRES_PRISMA_URL (conexión pooled)
const pooledUrl = process.env.POSTGRES_PRISMA_URL;
if (pooledUrl) {
	const isPooled = pooledUrl.includes("pgbouncer=true");
	const hasTimeout = pooledUrl.includes("connect_timeout");
	const hasSSL = pooledUrl.includes("sslmode=require");

	console.log("✅ POSTGRES_PRISMA_URL configurada");
	console.log(`   ${isPooled ? "✅" : "❌"} Incluye pgbouncer=true`);
	console.log(`   ${hasTimeout ? "✅" : "❌"} Incluye connect_timeout`);
	console.log(`   ${hasSSL ? "✅" : "❌"} Incluye sslmode=require`);
} else {
	console.log("❌ POSTGRES_PRISMA_URL no configurada");
}

// Verificar POSTGRES_URL_NON_POOLING (conexión directa)
const directUrl = process.env.POSTGRES_URL_NON_POOLING;
if (directUrl) {
	const isNotPooled = !directUrl.includes("pgbouncer=true");
	const hasSSL = directUrl.includes("sslmode=require");

	console.log("✅ POSTGRES_URL_NON_POOLING configurada");
	console.log(
		`   ${isNotPooled ? "✅" : "❌"} No incluye pgbouncer (conexión directa)`
	);
	console.log(`   ${hasSSL ? "✅" : "❌"} Incluye sslmode=require`);
} else {
	console.log("❌ POSTGRES_URL_NON_POOLING no configurada");
}

console.log("\n🎯 Recomendaciones:");

if (!pooledUrl) {
	console.log(
		"❌ Configura POSTGRES_PRISMA_URL para conexiones pooled de la aplicación"
	);
}

if (!(directUrl || process.env.POSTGRES_URL)) {
	console.log("❌ Configura POSTGRES_URL_NON_POOLING para migraciones");
}

if (pooledUrl && !pooledUrl.includes("pgbouncer=true")) {
	console.log("⚠️  POSTGRES_PRISMA_URL debería incluir pgbouncer=true");
}

if (directUrl?.includes("pgbouncer=true")) {
	console.log("⚠️  POSTGRES_URL_NON_POOLING no debería incluir pgbouncer=true");
}

console.log(
	"\n📚 Para más información, consulta: docs/DATABASE_CONFIGURATION.md"
);

// Verificar configuración de Better Auth
console.log("\n🔐 Configuración de Better Auth:");
const authUrl = process.env.BETTER_AUTH_URL;
const authSecret = process.env.BETTER_AUTH_SECRET;

console.log(
	`${authUrl ? "✅" : "❌"} BETTER_AUTH_URL: ${authUrl || "No configurada"}`
);
console.log(
	`${authSecret ? "✅" : "❌"} BETTER_AUTH_SECRET: ${authSecret ? "[HIDDEN]" : "No configurada"}`
);

if (pooledUrl && directUrl && authUrl && authSecret) {
	console.log(
		"\n🎉 ¡Configuración completa! La aplicación debería funcionar correctamente."
	);
} else {
	console.log("\n⚠️  Configuración incompleta. Revisa las variables faltantes.");
}
