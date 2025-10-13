import { NextResponse } from 'next/server';
import db from '@/lib/db/drizzle';
import { lands } from '@/lib/db/schema';

export async function GET() {
    try {
        // Get all lands from database
        const allLands = await db.select().from(lands);

        return NextResponse.json({
            success: true,
            count: allLands.length,
            lands: allLands.map(land => ({
                id: land.id,
                name: land.name,
                type: land.type,
                price: land.price,
                area: land.area,
                location: land.location
            }))
        });

    } catch (error) {
        console.error('Error checking lands:', error);

        return NextResponse.json({
            success: false,
            error: 'Error al consultar terrenos',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}