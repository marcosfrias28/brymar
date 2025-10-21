#!/usr/bin/env node

/**
 * Script de reset forzado para bases de datos administradas
 * Este script usa un enfoque más agresivo para limpiar la base de datos
 * 
 * Uso: node scripts/force-reset-database.js --force
 */

const { config } = require('dotenv');
const { createClient } = require('@vercel/postgres');

// Cargar variables de entorno
config();

async function forceResetDatabase() {
    console.log('🚨 RESET FORZADO DE BASE DE DATOS');
    console.log('📋 Verificando configuración...\n');

    const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

    if (!connectionString) {
        console.error('❌ Error: No se encontró POSTGRES_URL_NON_POOLING o POSTGRES_URL');
        process.exit(1);
    }

    console.log('✅ Conexión configurada');
    console.log(`🔗 Usando: ${connectionString.includes('pooler') ? 'Conexión pooled' : 'Conexión directa'}\n`);

    const client = createClient({
        connectionString: connectionString
    });

    try {
        console.log('🔌 Conectando a la base de datos...');
        await client.connect();
        console.log('✅ Conectado\n');

        // Estrategia 1: Eliminar todas las tablas con CASCADE múltiples veces
        console.log('🗑️  Estrategia 1: Eliminación con CASCADE múltiple...');

        for (let attempt = 1; attempt <= 3; attempt++) {
            console.log(`   Intento ${attempt}/3...`);

            const tablesResult = await client.sql`
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = 'public'
                ORDER BY tablename;
            `;

            const tables = tablesResult.rows.map(row => row.tablename);

            if (tables.length === 0) {
                console.log('   ✅ No quedan tablas');
                break;
            }

            console.log(`   📊 Encontradas ${tables.length} tablas`);

            for (const table of tables) {
                try {
                    await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
                    console.log(`   ✅ Eliminada: ${table}`);
                } catch (error) {
                    console.log(`   ⚠️  ${table}: ${error.message.substring(0, 50)}...`);
                }
            }
        }

        // Verificar tablas restantes
        const remainingTablesResult = await client.sql`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public';
        `;

        const remainingTables = remainingTablesResult.rows.map(row => row.tablename);

        if (remainingTables.length > 0) {
            console.log(`\n🔄 Estrategia 2: Eliminación individual de ${remainingTables.length} tablas restantes...`);

            // Estrategia 2: Eliminar una por una las tablas restantes
            for (const table of remainingTables) {
                try {
                    // Intentar eliminar dependencias primero
                    await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
                    console.log(`   ✅ Eliminada: ${table}`);
                } catch (error) {
                    console.log(`   ❌ No se pudo eliminar ${table}: ${error.message}`);
                }
            }
        }

        // Estrategia 3: Limpiar secuencias
        console.log('\n🔄 Limpiando secuencias...');
        try {
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
                    console.log(`   ❌ Error con secuencia ${sequence}: ${error.message}`);
                }
            }
        } catch (error) {
            console.log('   ⚠️  Error accediendo a secuencias (esto es normal en algunas bases de datos)');
        }

        // Verificación final
        const finalTablesResult = await client.sql`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public';
        `;

        const finalTables = finalTablesResult.rows.map(row => row.tablename);

        if (finalTables.length === 0) {
            console.log('\n🎉 ¡Base de datos limpiada exitosamente!');
            console.log('📝 Todas las tablas han sido eliminadas');
        } else {
            console.log(`\n⚠️  Quedan ${finalTables.length} tablas que no se pudieron eliminar:`);
            finalTables.forEach(table => console.log(`   - ${table}`));
            console.log('\n💡 Esto puede ser normal si hay tablas del sistema o con permisos especiales');
        }

        console.log('\n✨ Reset completado. La base de datos está lista para nuevas migraciones');

    } catch (error) {
        console.error('\n❌ Error durante el reset forzado:');
        console.error(error.message);

        if (error.message.includes('permission denied')) {
            console.error('\n💡 Error de permisos detectado:');
            console.error('   - Esto es común en bases de datos administradas');
            console.error('   - El script hizo lo mejor posible con los permisos disponibles');
            console.error('   - Intenta ejecutar db:push para ver si el schema se aplica correctamente');
        }

        process.exit(1);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

// Función principal
async function main() {
    console.log('🔄 RESET FORZADO DE BASE DE DATOS - BRYMAR');
    console.log('==========================================\n');

    const forceReset = process.argv.includes('--force');

    if (!forceReset) {
        console.log('⚠️  ADVERTENCIA: Este es un reset FORZADO');
        console.log('   - Usa métodos más agresivos para limpiar la base de datos');
        console.log('   - Diseñado para bases de datos administradas con permisos limitados');
        console.log('   - Puede no eliminar todas las tablas debido a restricciones de permisos');
        console.log('\n   Para continuar, ejecuta: node scripts/force-reset-database.js --force\n');
        return;
    }

    console.log('🚀 Iniciando reset forzado...\n');
    await forceResetDatabase();

    console.log('\n📋 Próximos pasos:');
    console.log('   1. Ejecutar: npm run db:push');
    console.log('   2. Si hay errores, ejecutar: npm run db:push --force');
    console.log('   3. Ejecutar: npm run db:seed (opcional)');
    console.log('   4. Probar la aplicación: npm run dev\n');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { forceResetDatabase };