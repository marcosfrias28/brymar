import { NextResponse } from 'next/server';
import db from '@/lib/db/drizzle';
import { properties } from '@/lib/db/schema';

const sampleProperties = [
    {
        title: "Villa Moderna en Cap Cana",
        description: "Espectacular villa de lujo con vista al mar, diseño contemporáneo y acabados de primera calidad. Cuenta con piscina infinita, jardín tropical y acceso directo a la playa. Perfecta para vacaciones o inversión.",
        price: 2500000,
        type: "villa",
        bedrooms: 5,
        bathrooms: 6,
        area: 450,
        location: "Cap Cana, Punta Cana",
        status: "venta",
        featured: true,
        images: [
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
        ]
    },
    {
        title: "Apartamento Penthouse Santo Domingo",
        description: "Exclusivo penthouse en el corazón de la Zona Colonial con vistas panorámicas de la ciudad. Completamente renovado con cocina gourmet, terraza privada y acabados de lujo. Ubicación privilegiada cerca de restaurantes y sitios históricos.",
        price: 850000,
        type: "penthouse",
        bedrooms: 3,
        bathrooms: 3,
        area: 220,
        location: "Zona Colonial, Santo Domingo",
        status: "venta",
        featured: true,
        images: [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
        ]
    },
    {
        title: "Casa Familiar en Santiago",
        description: "Hermosa casa familiar en exclusivo residencial de Santiago. Amplia sala de estar, cocina moderna, jardín con piscina y garaje para 2 vehículos. Ideal para familias que buscan tranquilidad y comodidad.",
        price: 320000,
        type: "casa",
        bedrooms: 4,
        bathrooms: 3,
        area: 280,
        location: "Los Jardines, Santiago",
        status: "venta",
        featured: false,
        images: [
            "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
            "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800",
            "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800"
        ]
    },
    {
        title: "Apartamento Moderno en Bella Vista",
        description: "Moderno apartamento en torre residencial con amenidades completas. Gimnasio, piscina, área social y seguridad 24/7. Excelente ubicación con fácil acceso a centros comerciales y transporte público.",
        price: 185000,
        type: "apartamento",
        bedrooms: 2,
        bathrooms: 2,
        area: 95,
        location: "Bella Vista, Santo Domingo",
        status: "venta",
        featured: false,
        images: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
        ]
    },
    {
        title: "Villa Frente al Mar en Casa de Campo",
        description: "Exclusiva villa frente al mar en el prestigioso resort Casa de Campo. Diseño arquitectónico único, piscina privada, muelle propio y acceso a campo de golf. Una joya inmobiliaria para los más exigentes.",
        price: 4200000,
        type: "villa",
        bedrooms: 6,
        bathrooms: 7,
        area: 650,
        location: "Casa de Campo, La Romana",
        status: "venta",
        featured: true,
        images: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"
        ]
    },
    {
        title: "Dúplex en Piantini",
        description: "Elegante dúplex en la exclusiva zona de Piantini. Dos niveles con diseño moderno, terraza privada, cocina italiana y acabados de primera. Cerca de los mejores restaurantes y centros comerciales de la ciudad.",
        price: 650000,
        type: "duplex",
        bedrooms: 3,
        bathrooms: 4,
        area: 180,
        location: "Piantini, Santo Domingo",
        status: "venta",
        featured: true,
        images: [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
            "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800",
            "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800"
        ]
    },
    {
        title: "Casa de Playa en Bávaro",
        description: "Encantadora casa de playa a solo 200 metros del mar. Perfecta para alquiler vacacional o residencia de descanso. Jardín tropical, terraza con vista al mar y decoración caribeña auténtica.",
        price: 420000,
        type: "casa",
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        location: "Bávaro, Punta Cana",
        status: "venta",
        featured: false,
        images: [
            "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
            "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800"
        ]
    },
    {
        title: "Estudio Ejecutivo en Naco",
        description: "Moderno estudio completamente amueblado en el sector Naco. Ideal para profesionales o inversión. Edificio con amenidades, ubicación céntrica y excelente conectividad. Listo para habitar o alquilar.",
        price: 95000,
        type: "estudio",
        bedrooms: 1,
        bathrooms: 1,
        area: 45,
        location: "Naco, Santo Domingo",
        status: "venta",
        featured: false,
        images: [
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
            "https://images.unsplash.com/photo-1560448075-bb485b067938?w=800",
            "https://images.unsplash.com/photo-1560449752-b4b8c2b5e0b3?w=800"
        ]
    },
    {
        title: "Local Comercial en Zona Colonial",
        description: "Excelente local comercial en la histórica Zona Colonial. Ideal para restaurante, boutique o galería de arte. Alto tráfico peatonal, arquitectura colonial restaurada y ubicación turística privilegiada.",
        price: 280000,
        type: "comercial",
        bedrooms: 0,
        bathrooms: 2,
        area: 120,
        location: "Zona Colonial, Santo Domingo",
        status: "venta",
        featured: false,
        images: [
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
            "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800",
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"
        ]
    },
    {
        title: "Apartamento de Lujo en Malecón",
        description: "Espectacular apartamento con vista panorámica al Mar Caribe desde el Malecón. Completamente renovado con acabados de lujo, cocina gourmet y terraza privada. Una oportunidad única en primera línea de mar.",
        price: 750000,
        type: "apartamento",
        bedrooms: 3,
        bathrooms: 3,
        area: 200,
        location: "Malecón, Santo Domingo",
        status: "venta",
        featured: true,
        images: [
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
            "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800"
        ]
    }
];

export async function POST() {
    try {
        console.log('🌱 Iniciando seed de propiedades...');

        // Insert properties
        const insertedProperties = await db.insert(properties).values(sampleProperties).returning();

        console.log(`✅ Se insertaron ${insertedProperties.length} propiedades exitosamente`);

        return NextResponse.json({
            success: true,
            message: `Se insertaron ${insertedProperties.length} propiedades exitosamente`,
            properties: insertedProperties.map(p => ({
                id: p.id,
                title: p.title,
                price: p.price
            }))
        });

    } catch (error) {
        console.error('❌ Error durante el seed:', error);

        return NextResponse.json({
            success: false,
            error: 'Error al insertar propiedades',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Seed API endpoint. Use POST to insert properties.',
        properties: sampleProperties.length,
        endpoint: '/api/seed'
    });
}