'use server';

import qs from 'qs';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function getGlobalData(locale: string = 'es') {
    try {
        const query = qs.stringify({
            populate: ['favicon', 'navigation'],
            locale,
        });

        const response = await fetch(`${STRAPI_URL}/api/global?${query}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Failed to fetch global data: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching global data:', error);
        return null;
    }
}
