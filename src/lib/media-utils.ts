/**
 * Utility for formatting media URLs.
 * This file is safe to import in Client Components as it does not import Prisma.
 */
export function getStrapiMedia(url: string | null | undefined): string {
    if (!url) return '';

    // If it's already a full URL, return it
    if (url.startsWith('http')) {
        return url;
    }

    // For local paths, prepend the base URL
    const baseUrl = process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:3000';
    return `${baseUrl}${url}`;
}

