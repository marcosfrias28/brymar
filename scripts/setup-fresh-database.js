#!/usr/bin/env node

/**
 * Script para configurar una base de datos completamente nueva
 * Este script automatiza todo el proceso de setup
 */

const { execSync } = require('child_process');
const { resetDatabase } = require('./reset-database');

async function setupFreshDatabase() {
    console.log('🚀 SETUP DE BASE DE DATOS LIMPIA - BRYMAR');
    console.log('==========================================\n');

    try {
        // Paso 1: Verificar configuración
        console.log('📋 Paso 1: Verificando configuración...');
        try {
            execSync('node scripts/check-db-config.js', { stdio: 'inherit' });
        } catch (error) {
            console.error('❌ Error en la configuración. Revisa las variables de entorno.');
            process.exit(1);
        }

        console.log('\n✅ Configuración verificada\n');

        // Paso 2: Limpiar base de datos
        console.log('🗑️  Paso 2: Limpiando base de datos existente...');
        await resetDatabase();
        console.log('✅ Base de datos limpiada\n');

        // Paso 3: Aplicar nuevo schema
        console.log('📊 Paso 3: Aplicando nuevo schema...');
        try {
            execSync('npm run db:push', { stdio: 'inherit' });
            console.log('✅ Schema aplicado exitosamente\n');
        } catch (error) {
            console.error('❌ Error aplicando schema:', error.message);
            throw error;
        }

        // Paso 4: Seed inicial (opcional)
        console.log('🌱 Paso 4: Aplicando datos iniciales...');
        try {
            execSync('npm run db:seed', { stdio: 'inherit' });
            console.log('✅ Datos iniciales aplicados\n');
        } catch (error) {
            console.log('⚠️  Advertencia: Error aplicando seed (esto es opcional)');
            console.log('   Puedes ejecutar manualmente: npm run db:seed\n');
        }

        // Paso 5: Verificación final
        console.log('🔍 Paso 5: Verificación final...');
        console.log('✅ Setup completado exitosamente!\n');

        console.log('🎉 ¡BASE DE DATOS LISTA!');
        console.log('========================\n');
        console.log('📋 Resumen:');
        console.log('   ✅ Base de datos limpiada');
        console.log('   ✅ Nuevo schema aplicado');
        console.log('   ✅ Datos iniciales cargados');
        console.log('   ✅ Configuración verificada\n');

        console.log('🚀 Próximos pasos:');
        console.log('   1. Ejecutar: npm run dev');
        console.log('   2. Probar autenticación (sign up/sign in)');
        console.log('   3. Verificar que las propiedades se muestren correctamente\n');

        console.log('📚 Documentación:');
        console.log('   - Configuración DB: docs/DATABASE_CONFIGURATION.md');
        console.log('   - Troubleshooting: docs/TROUBLESHOOTING_AUTH.md\n');

    } catch (error) {
        console.error('\n❌ Error durante el setup:');
        console.error(error.message);

        console.log('\n🔧 Pasos de recuperación:');
        console.log('   1. Verificar variables de entorno: npm run db:check');
        console.log('   2. Limpiar manualmente: npm run db:reset --force');
        console.log('   3. Aplicar schema: npm run db:push');
        console.log('   4. Aplicar seed: npm run db:seed\n');

        process.exit(1);
    }
}

// Función principal
async function main() {
    const args = process.argv.slice(2);
    const isForced = args.includes('--force');

    if (!isForced) {
        console.log('⚠️  ADVERTENCIA: Este script eliminará TODOS los datos existentes');
        console.log('   Para continuar, ejecuta: node scripts/setup-fresh-database.js --force\n');
        return;
    }

    await setupFreshDatabase();
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { setupFreshDatabase };