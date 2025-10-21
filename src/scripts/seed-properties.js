#!/usr/bin/env node

/**
 * Script para cargar datos iniciales de propiedades
 * Compatible con el nuevo schema unificado
 */

const { config } = require('dotenv');
const { sql } = require('@vercel/postgres');

// Cargar variables de entorno
config();

// Datos de propiedades de ejemplo
const sampleProperties = [
    {
        title: "Villa Moderna en Cap Cana",
        description: "Espectacular villa de lujo con vista al mar, diseño contemporáneo y acabados de primera calidad. Cuenta con piscina infinita, jardín tropical y acceso directo a la playa.",
        price: 2500000,
        type: "villa",
        location: "Cap Cana, Punta Cana",
        featured: true,
        images: [
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
        ],
        bedrooms: 5,
        bathrooms: 6,
        area: 450
    },
    {
        title: "Apartamento Penthouse Santo Domingo",
        description: "Exclusivo penthouse en el corazón de la Zona Colonial con vistas panorámicas de la ciudad. Completamente renovado con cocina gourmet y terraza privada.",
        price: 850000,
        type: "penthouse",
        location: "Zona Colonial, Santo Domingo",
        featured: true,
        images: [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
        ],
        bedrooms: 3,
        bathrooms: 3,
        area: 220
    },
    {
        title: "Casa Familiar en Santiago",
        description: "Hermosa casa familiar en exclusivo residencial de Santiago. Amplia sala de estar, cocina moderna, jardín con piscina y garaje para 2 vehículos.",
        price: 320000,
        type: "house",
        location: "Los Jardines, Santiago",
        featured: false,
        images: [
            "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
            "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800",
            "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800"
        ],
        bedrooms: 4,
        bathrooms: 3,
        area: 280
    },
    {
        title: "Apartamento Moderno en Bella Vista",
        description: "Moderno apartamento en torre residencial con amenidades completas. Gimnasio, piscina, área social y seguridad 24/7.",
        price: 185000,
        type: "apartment",
        location: "Bella Vista, Santo Domingo",
        featured: false,
        images: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
        ],
        bedrooms: 2,
        bathrooms: 2,
        area: 95
    },
    {
        title: "Villa Frente al Mar en Casa de Campo",
        description: "Exclusiva villa frente al mar en el prestigioso resort Casa de Campo. Diseño arquitectónico único, piscina privada y muelle propio.",
        price: 4200000,
        type: "villa",
        location: "Casa de Campo, La Romana",
        featured: true,
        images: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"
        ],
        bedrooms: 6,
        bathrooms: 7,
        area: 650
    }
];

async function seedProperties() {
    try {
        console.log('🌱 SEED DE PROPIEDADES - BRYMAR');
        console.log('================================\n');

        console.log('📋 Verificando configuración...');

        // Verificar variables de entorno
        const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
        if (!connectionString) {
            console.error('❌ Error: No se encontró POSTGRES_PRISMA_URL o POSTGRES_URL');
            console.error('   Configura las variables de entorno antes de continuar.');
            process.exit(1);
        }

        console.log('✅ Variables de entorno configuradas');

        // Verificar que la tabla properties existe
        console.log('🔍 Verificando schema de base de datos...');

        try {
            const tableCheck = await sql`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'properties'
                );
            `;

            if (!tableCheck.rows[0].exists) {
                console.error('❌ Error: La tabla "properties" no existe');
                console.error('\n💡 Solución:');
                console.error('   1. Ejecutar: npm run db:push');
                console.error('   2. Luego ejecutar: npm run db:seed');
                process.exit(1);
            }

            console.log('✅ Tabla "properties" encontrada');
        } catch (error) {
            console.error('❌ Error verificando schema:', error.message);
            process.exit(1);
        }

        // Verificar si ya hay propiedades
        const existingCount = await sql`SELECT COUNT(*) as count FROM properties`;
        const currentCount = parseInt(existingCount.rows[0].count);

        if (currentCount > 0) {
            console.log(`ℹ️  Encontradas ${currentCount} propiedades existentes`);
            console.log('🧹 Limpiando propiedades de ejemplo anteriores...');

            // Limpiar solo las propiedades de ejemplo (que tienen user_id específico)
            await sql`DELETE FROM properties WHERE user_id = 'seed_user_001'`;
        }

        // Insertar nuevas propiedades
        console.log('\n📝 Insertando propiedades de ejemplo...');

        let insertedCount = 0;

        for (const [index, property] of sampleProperties.entries()) {
            try {
                // Generar ID único
                const id = `prop_${Date.now()}_${index.toString().padStart(3, '0')}`;

                // Crear objetos según el nuevo schema
                const address = {
                    street: property.location.split(',')[0]?.trim() || 'Dirección no especificada',
                    city: property.location.split(',')[1]?.trim() || 'Santo Domingo',
                    state: 'Distrito Nacional',
                    country: 'República Dominicana',
                    zipCode: '10001'
                };

                const features = {
                    bedrooms: property.bedrooms,
                    bathrooms: property.bathrooms,
                    area: property.area,
                    yearBuilt: 2020 + Math.floor(Math.random() * 4), // 2020-2023
                    amenities: [
                        'Piscina',
                        'Jardín',
                        'Seguridad 24/7',
                        'Gimnasio',
                        'Área social'
                    ],
                    features: [
                        'Cocina moderna',
                        'Aire acondicionado',
                        'Internet fibra óptica',
                        'Pisos de mármol',
                        'Ventanas panorámicas'
                    ]
                };

                const result = await sql`
                    INSERT INTO properties (
                        id, title, description, price, currency, address, type, 
                        features, images, status, featured, user_id, created_at, updated_at
                    ) VALUES (
                        ${id}, 
                        ${property.title}, 
                        ${property.description}, 
                        ${property.price}, 
                        'USD', 
                        ${JSON.stringify(address)}, 
                        ${property.type},
                        ${JSON.stringify(features)}, 
                        ${JSON.stringify(property.images)}, 
                        'published', 
                        ${property.featured}, 
                        'seed_user_001', 
                        NOW(), 
                        NOW()
                    ) RETURNING id, title, price, featured
                `;

                const inserted = result.rows[0];
                const featuredIcon = inserted.featured ? '⭐' : '  ';
                console.log(`${featuredIcon}✅ ${inserted.title} - $${inserted.price.toLocaleString()}`);
                insertedCount++;

            } catch (error) {
                console.log(`❌ Error insertando "${property.title}": ${error.message}`);
            }
        }

        console.log('\n🎉 SEED COMPLETADO EXITOSAMENTE!');
        console.log('===============================');
        console.log(`📊 Propiedades insertadas: ${insertedCount}/${sampleProperties.length}`);
        console.log(`⭐ Propiedades destacadas: ${sampleProperties.filter(p => p.featured).length}`);

        if (insertedCount < sampleProperties.length) {
            console.log('\n⚠️  Algunas propiedades no se pudieron insertar');
            console.log('   Esto puede ser normal si ya existían o hay conflictos de datos');
        }

        console.log('\n📋 Próximos pasos:');
        console.log('   1. Ejecutar: npm run dev');
        console.log('   2. Visitar: http://localhost:3000');
        console.log('   3. Verificar que las propiedades se muestren correctamente\n');

    } catch (error) {
        console.error('\n❌ ERROR DURANTE EL SEED:');
        console.error('========================');
        console.error(error.message);

        if (error.message.includes('relation "properties" does not exist')) {
            console.error('\n💡 La tabla properties no existe. Ejecuta:');
            console.error('   npm run db:push');
        } else if (error.message.includes('invalid_connection_string')) {
            console.error('\n💡 Problema de conexión. Verifica:');
            console.error('   npm run db:check');
        }

        process.exit(1);
    }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
    seedProperties().catch(console.error);
}

module.exports = { seedProperties, sampleProperties };