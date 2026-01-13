'use server';

import qs from 'qs';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * Fetch hierarchical categories
 */
export async function getCategories(locale: string = 'es') {
    try {
        const query = qs.stringify({
            populate: ['parent', 'children', 'image'],
            locale,
            sort: ['name:asc'],
        }, { encodeValuesOnly: true });

        const response = await fetch(`${STRAPI_URL}/api/categories?${query}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

/**
 * Fetch a single category by slug with its children
 */
export async function getCategoryBySlug(slug: string, locale: string = 'es') {
    try {
        const query = qs.stringify({
            filters: { slug: { $eq: slug } },
            populate: {
                children: {
                    populate: {
                        children: {
                            populate: ['children']
                        }
                    }
                },
                parent: true,
                image: true
            },
            locale,
        }, { encodeValuesOnly: true });

        const response = await fetch(`${STRAPI_URL}/api/categories?${query}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch category by slug');
        }

        const data = await response.json();
        return data.data?.[0] || null;
    } catch (error) {
        console.error('Error fetching category by slug:', error);
        return null;
    }
}
