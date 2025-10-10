import { NextResponse } from 'next/server';
import db from '@/lib/db/drizzle';
import { lands } from '@/lib/db/schema';

const sampleLands = [
    {
        name: "Terreno Residencial en Cap Cana",
        description: "Excelente terreno para desarrollo residencial en la exclusiva zona de Cap Cana. Ubicación privilegiada cerca de la marina y campos de golf. Ideal para villa de lujo o complejo residencial.",
        area: 2500,
        price: 850000,
        location: "Cap Cana, Punta Cana",
        type: "residencial",
        images: [
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
        ]
    },
    {
        name: "Lote Comercial en Santiago Centro",
        description: "Terreno comercial estratégicamente ubicado en el centro de Santiago. Alto tráfico vehicular y peatonal. Perfecto para centro comercial, oficinas o desarrollo mixto. Todos los servicios disponibles.",
        area: 1800,
        price: 650000,
        location: "Centro, Santiago",
        type: "comercial",
        images: [
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
            "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
            "https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800"
        ]
    },
    {
        name: "Terreno Agrícola en Constanza",
        description: "Amplio terreno agrícola en las montañas de Constanza. Clima fresco, suelo fértil y acceso a agua. Ideal para cultivos de vegetales, flores o desarrollo eco-turístico. Excelente inversión agrícola.",
        area: 15000,
        price: 420000,
        location: "Constanza, La Vega",
        type: "agricola",
        images: [
            "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800",
            "https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800",
            "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800"
        ]
    },
    {
        name: "Lote Industrial en Zona Franca",
        description: "Terreno industrial en zona franca de Santiago. Excelente para manufactura, almacenaje o logística. Beneficios fiscales, infraestructura completa y fácil acceso a puertos y aeropuertos.",
        area: 5000,
        price: 750000,
        location: "Zona Franca, Santiago",
        type: "industrial",
        images: [
            "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800",
            "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
        ]
    },
    {
        name: "Terreno Turístico en Samaná",
        description: "Espectacular terreno frente al mar en la península de Samaná. Vista panorámica al océano, playa privada y vegetación tropical. Perfecto para resort, hotel boutique o desarrollo eco-turístico.",
        area: 8000,
        price: 1200000,
        location: "Las Terrenas, Samaná",
        type: "turistico",
        images: [
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
        ]
    },
    {
        name: "Lote Residencial en Piantini",
        description: "Exclusivo lote en el corazón de Piantini, zona premium de Santo Domingo. Ideal para torre residencial de lujo o complejo de apartamentos. Ubicación privilegiada con todos los servicios.",
        area: 1200,
        price: 950000,
        location: "Piantini, Santo Domingo",
        type: "residencial",
        images: [
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
            "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"
        ]
    },
    {
        name: "Terreno Mixto en La Romana",
        description: "Versátil terreno con zonificación mixta en La Romana. Permite uso residencial y comercial. Cerca del puerto y zona turística. Excelente para desarrollo integral o inversión a largo plazo.",
        area: 3500,
        price: 580000,
        location: "La Romana",
        type: "mixto",
        images: [
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
            "https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800"
        ]
    },
    {
        name: "Lote para Desarrollo en Bávaro",
        description: "Terreno estratégico en Bávaro, zona de alto crecimiento turístico. Perfecto para condominios, villas o proyecto hotelero. Cerca de playas, aeropuerto y principales atracciones turísticas.",
        area: 4200,
        price: 720000,
        location: "Bávaro, Punta Cana",
        type: "turistico",
        images: [
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800"
        ]
    }
];

export async function POST() {
    try {
        console.log('🌱 Iniciando seed de terrenos...');

        // Insert lands
        const insertedLands = await db.insert(lands).values(sampleLands).returning();

        console.log(`✅ Se insertaron ${insertedLands.length} terrenos exitosamente`);

        return NextResponse.json({
            success: true,
            message: `Se insertaron ${insertedLands.length} terrenos exitosamente`,
            lands: insertedLands.map(l => ({
                id: l.id,
                name: l.name,
                price: l.price,
                area: l.area,
                type: l.type
            }))
        });

    } catch (error) {
        console.error('❌ Error durante el seed de terrenos:', error);

        return NextResponse.json({
            success: false,
            error: 'Error al insertar terrenos',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Seed Lands API endpoint. Use POST to insert lands.',
        lands: sampleLands.length,
        endpoint: '/api/seed-lands'
    });
}