// API Proxy para datos del anemómetro
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
    try {
        const { type } = await params;
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const timeframe = searchParams.get('timeframe');
        const startHour = searchParams.get('startHour');
        const endHour = searchParams.get('endHour');

        // Construir la URL de la API
        let apiUrl = `https://azul-kite.ddns.net/api/anemometro/${type}`;

        // Agregar parámetros si están presentes
        if (date && timeframe) {
            apiUrl += `?date=${date}&timeframe=${timeframe}`;
            if (startHour) apiUrl += `&startHour=${startHour}`;
            if (endHour) apiUrl += `&endHour=${endHour}`;
        }

        console.log('🔄 API Proxy fetching from:', apiUrl);

        const response = await fetch(apiUrl, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });

    } catch (error) {
        console.error('Error fetching anemometer data:', error);

        return new Response(JSON.stringify({
            error: 'Error fetching anemometer data',
            message: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}

export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
