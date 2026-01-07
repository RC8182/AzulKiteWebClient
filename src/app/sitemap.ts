import { MetadataRoute } from 'next';
import { fetchData } from '@/lib/strapi';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Fetch all pages and products to generate links
    const pages = await fetchData('pages');
    const products = await fetchData('products');

    const pageEntries: MetadataRoute.Sitemap = (pages?.data || []).map((page: any) => ({
        url: `${baseUrl}/${page.slug === 'home' ? '' : page.slug}`,
        lastModified: new Date(page.updatedAt),
        changeFrequency: 'weekly',
        priority: page.slug === 'home' ? 1.0 : 0.8,
    }));

    const productEntries: MetadataRoute.Sitemap = (products?.data || []).map((product: any) => ({
        url: `${baseUrl}/productos/${product.slug || product.id}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: 'daily',
        priority: 0.7,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...pageEntries,
        ...productEntries,
    ];
}
