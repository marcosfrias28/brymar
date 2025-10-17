const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Configuración de la base de datos
const sql = neon(process.env.POSTGRES_URL);

async function verifyCoordinates() {
    try {
        console.log('🔍 Verificando coordenadas en la base de datos...\n');

        // Verificar terrenos
        console.log('🏞️  Verificando terrenos:');
        const landsWithCoords = await sql`
      SELECT id, name, location 
      FROM lands 
      WHERE location::jsonb ? 'coordinates'
      LIMIT 5
    `;

        console.log(`✅ Terrenos con coordenadas: ${landsWithCoords.length}`);
        landsWithCoords.forEach(land => {
            const location = JSON.parse(land.location);
            const coords = location.coordinates;
            console.log(`   - ${land.name}: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        });

        // Verificar propiedades
        console.log('\n🏠 Verificando propiedades:');
        const propertiesWithCoords = await sql`
      SELECT id, title, location 
      FROM properties 
      WHERE location::jsonb ? 'coordinates'
      LIMIT 5
    `;

        console.log(`✅ Propiedades con coordenadas: ${propertiesWithCoords.length}`);
        propertiesWithCoords.forEach(property => {
            const location = JSON.parse(property.location);
            const coords = location.coordinates;
            console.log(`   - ${property.title}: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        });

        // Estadísticas totales
        console.log('\n📊 Estadísticas totales:');
        const totalLands = await sql`SELECT COUNT(*) as count FROM lands`;
        const totalProperties = await sql`SELECT COUNT(*) as count FROM properties`;
        const landsWithCoordsCount = await sql`
      SELECT COUNT(*) as count 
      FROM lands 
      WHERE location::jsonb ? 'coordinates'
    `;
        const propertiesWithCoordsCount = await sql`
      SELECT COUNT(*) as count 
      FROM properties 
      WHERE location::jsonb ? 'coordinates'
    `;

        console.log(`   - Total terrenos: ${totalLands[0].count}`);
        console.log(`   - Terrenos con coordenadas: ${landsWithCoordsCount[0].count}`);
        console.log(`   - Total propiedades: ${totalProperties[0].count}`);
        console.log(`   - Propiedades con coordenadas: ${propertiesWithCoordsCount[0].count}`);

        const landPercentage = ((landsWithCoordsCount[0].count / totalLands[0].count) * 100).toFixed(1);
        const propertyPercentage = ((propertiesWithCoordsCount[0].count / totalProperties[0].count) * 100).toFixed(1);

        console.log(`\n🎯 Cobertura de coordenadas:`);
        console.log(`   - Terrenos: ${landPercentage}%`);
        console.log(`   - Propiedades: ${propertyPercentage}%`);

        if (landPercentage === '100.0' && propertyPercentage === '100.0') {
            console.log('\n🎉 ¡Perfecto! Todas las propiedades y terrenos tienen coordenadas.');
            console.log('🗺️  El mapa debería funcionar correctamente ahora.');
        } else {
            console.log('\n⚠️  Algunas propiedades o terrenos no tienen coordenadas.');
            console.log('💡 Ejecuta el script add-coordinates-simple.js para completar las coordenadas faltantes.');
        }

    } catch (error) {
        console.error('❌ Error verificando coordenadas:', error);
    }
}

// Ejecutar la verificación
verifyCoordinates();