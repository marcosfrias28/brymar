#!/usr/bin/env node

/**
 * Script para resetear completamente la base de datos
 * ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos
 * 
 * Uso: node scripts/reset-database.js --force
 */

const { config } = require('dotenv');
const { createClient } = require('@vercel/postgres');

// Cargar variables de entorno
config();

async function resetDatabase() {
    console.log('🚨 ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos');
    console.log('📋 Verificando configuración...\n');

    // Verificar variables de entorno
    const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

    if (!connectionString) {
        console.error('❌ Error: No se encontró POSTGRES_URL_NON_POOLING o POSTGRES_URL');
        console.error('   Configura una de estas variables de entorno para continuar.');
        process.exit(1);
    }

    console.log('✅ Conexión configurada');
    console.log(`🔗 Usando: ${connectionString.includes('pooler') ? 'Conexión pooled' : 'Conexión directa'}\n`);

    // Crear cliente con conexión directa específica
    const client = createClient({
        connectionString: connectionString
    });

    try {
        console.log('🔌 Conectando a la base de datos...');
        await client.connect();
        console.log('✅ Conectado con cliente directo\n');

        // Obtener lista de todas las tablas
        console.log('📋 Obteniendo lista de tablas...');
        const tablesResult = await client.sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

        const tables = tablesResult.rows.map(row => row.tablename);

        if (tables.length === 0) {
            console.log('ℹ️  No se encontraron tablas en la base de datos');
            return;
        }

        console.log(`📊 Encontradas ${tables.length} tablas:`);
        tables.forEach(table => console.log(`   - ${table}`));
        console.log('');

        // Eliminar todas las tablas
        console.log('🗑️  Eliminando todas las tablas...');

        // Eliminar tablas en orden inverso para evitar conflictos de FK
        // Primero intentamos eliminar todas con CASCADE
        const tablesToDrop = [...tables].reverse();

        for (const table of tablesToDrop) {
            try {
                await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
                console.log(`   ✅ Eliminada: ${table}`);
            } catch (error) {
                console.log(`   ⚠️  Reintentando ${table}: ${error.message}`);
                // Reintentar sin CASCADE si falla
                try {
                    await client.query(`DROP TABLE IF EXISTS "${table}";`);
                    console.log(`   ✅ Eliminada (sin CASCADE): ${table}`);
                } catch (retryError) {
                    console.log(`   ❌ Error eliminando ${table}: ${retryError.message}`);
                }
            }
        }

        // Verificar que todas las tablas fueron eliminadas
        const remainingTablesResult = await client.sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `;

        const remainingTables = remainingTablesResult.rows.map(row => row.tablename);

        if (remainingTables.length === 0) {
            console.log('\n🎉 ¡Base de datos limpiada exitosamente!');
            console.log('📝 Todas las tablas han sido eliminadas');
        } else {
            console.log(`\n⚠️  Quedan ${remainingTables.length} tablas:`);
            remainingTables.forEach(table => console.log(`   - ${table}`));
        }

        // Limpiar secuencias (sequences) también
        console.log('\n🔄 Limpiando secuencias...');
        const sequencesResult = await client.sql`
      SELECT sequencename 
      FROM pg_sequences 
      WHERE schemaname = 'public';
    `;

        const sequences = sequencesResult.rows.map(row => row.sequencename);

        for (const sequence of sequences) {
            try {
                await client.query(`DROP SEQUENCE IF EXISTS "${sequence}" CASCADE;`);
                console.log(`   ✅ Secuencia eliminada: ${sequence}`);
            } catch (error) {
                console.log(`   ❌ Error eliminando secuencia ${sequence}: ${error.message}`);
            }
        }

        console.log('\n✨ Base de datos completamente limpia y lista para nuevas migraciones');

    } catch (error) {
        console.error('\n❌ Error durante el reseteo de la base de datos:');
        console.error(error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Sugerencias:');
            console.error('   - Verifica que la URL de conexión sea correcta');
            console.error('   - Asegúrate de que la base de datos esté accesible');
        } else if (error.code === '28P01') {
            console.error('\n💡 Error de autenticación:');
            console.error('   - Verifica las credenciales en la URL de conexión');
        }

        process.exit(1);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

// Función principal con confirmación
async function main() {
    console.log('🔄 RESET DE BASE DE DATOS - BRYMAR');
    console.log('=====================================\n');

    // En producción, requerir confirmación explícita
    const isProduction = process.env.NODE_ENV === 'production';
    const forceReset = process.argv.includes('--force');

    if (isProduction && !forceReset) {
        console.error('❌ Error: No se puede resetear la base de datos en producción');
        console.error('   Si realmente necesitas hacerlo, usa: --force');
        process.exit(1);
    }

    if (!forceReset) {
        console.log('⚠️  ADVERTENCIA: Esta operación es IRREVERSIBLE');
        console.log('   - Se eliminarán TODAS las tablas');
        console.log('   - Se perderán TODOS los datos');
        console.log('   - Se eliminarán TODAS las secuencias');
        console.log('\n   Para continuar, ejecuta: node scripts/reset-database.js --force\n');
        return;
    }

    console.log('🚀 Iniciando reseteo de base de datos...\n');
    await resetDatabase();

    console.log('\n📋 Próximos pasos:');
    console.log('   1. Ejecutar: npm run db:push');
    console.log('   2. Ejecutar: npm run db:seed (opcional)');
    console.log('   3. Probar la aplicación: npm run dev\n');
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { resetDatabase };