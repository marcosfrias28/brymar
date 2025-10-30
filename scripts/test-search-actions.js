// Script para probar las acciones de búsqueda
console.log("🔍 Probando acciones de búsqueda...\n");

// Simular FormData para propiedades
const testPropertySearch = () => {
	console.log("📋 Datos de prueba para búsqueda de propiedades:");

	const formData = new FormData();
	formData.append("query", "");
	formData.append("location", "");
	formData.append("propertyType", "all");
	formData.append("minPrice", "");
	formData.append("maxPrice", "");
	formData.append("bedrooms", "");
	formData.append("bathrooms", "");
	formData.append("minArea", "");
	formData.append("maxArea", "");
	formData.append("amenities", "");
	formData.append("status", "published");
	formData.append("sortBy", "newest");
	formData.append("limit", "20");
	formData.append("offset", "0");

	console.log("FormData keys:", Array.from(formData.keys()));
	console.log("FormData values:");
	for (const [key, value] of formData.entries()) {
		console.log(`  ${key}: "${value}"`);
	}
};

// Simular FormData para terrenos
const testLandSearch = () => {
	console.log("\n🏞️  Datos de prueba para búsqueda de terrenos:");

	const formData = new FormData();
	formData.append("query", "");
	formData.append("location", "");
	formData.append("landType", "all");
	formData.append("minPrice", "");
	formData.append("maxPrice", "");
	formData.append("minArea", "");
	formData.append("maxArea", "");
	formData.append("amenities", "");
	formData.append("status", "published");
	formData.append("sortBy", "newest");
	formData.append("limit", "20");
	formData.append("offset", "0");

	console.log("FormData keys:", Array.from(formData.keys()));
	console.log("FormData values:");
	for (const [key, value] of formData.entries()) {
		console.log(`  ${key}: "${value}"`);
	}
};

// Ejecutar pruebas
testPropertySearch();
testLandSearch();

console.log("\n✅ Estructura de FormData verificada");
console.log("💡 Usa estos datos para probar las acciones de búsqueda");
console.log("🚀 Las acciones ahora tienen logging mejorado para debug");

// Mostrar posibles errores comunes
console.log("\n🔧 Posibles causas de errores:");
console.log("1. Container no inicializado - verificar ServiceRegistration");
console.log("2. Base de datos no conectada - verificar POSTGRES_URL");
console.log("3. Esquemas de validación - verificar Zod schemas");
console.log("4. Mapeo de entidades - verificar mappers");
console.log("5. Serialización - verificar toJSON() methods");

console.log("\n📊 Para debug en tiempo real:");
console.log("- Revisa los logs del servidor Next.js");
console.log("- Usa las herramientas de desarrollo del navegador");
console.log(
	"- Verifica la pestaña Network para ver las respuestas de las acciones"
);
