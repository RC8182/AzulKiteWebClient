import qs from "qs";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

export async function fetchData(endpoint: string, query?: Record<string, any>) {
    const queryString = query ? `?${qs.stringify(query)}` : "";
    const url = `${STRAPI_URL}/api/${endpoint}${queryString}`;

    const res = await fetch(url, {
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
        },
    });

    console.log(`[Strapi Fetch] ${url} - Status: ${res.status}`);

    if (!res.ok) {
        throw new Error(`Failed to fetch data from Strapi: ${res.statusText}`);
    }

    return res.json();
}

export function getStrapiMedia(url: string | null) {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("//")) return url;
    return `${STRAPI_URL}${url}`;
}
