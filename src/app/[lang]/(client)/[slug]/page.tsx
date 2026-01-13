import { fetchData } from "@/lib/strapi";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { notFound } from "next/navigation";

async function getPageData(slug: string, locale: string) {
    try {
        // Skip common file-like extensions that might hit this route
        if (slug.includes('.')) return null;

        const data = await fetchData("pages", {
            filters: { slug: { $eq: slug } },
            locale,
            populate: {
                blocks: {
                    on: {
                        'blocks.hero-slider': {
                            populate: {
                                slides: {
                                    populate: ['backgroundImage', 'buttons']
                                }
                            }
                        },
                        'blocks.banner-grid': {
                            populate: {
                                banners: {
                                    populate: ['image', 'links']
                                }
                            }
                        },
                        'blocks.product-grid': {
                            populate: {
                                products: {
                                    populate: '*'
                                }
                            }
                        },
                        'blocks.hero-section': {
                            populate: ['backgroundImage', 'cta']
                        },
                        'blocks.info-block': {
                            populate: '*'
                        }
                    }
                }
            }
        });

        return data?.data?.[0];
    } catch (error) {
        console.error("Error fetching page data:", error);
        return null;
    }
}

interface GenericPageProps {
    params: Promise<{ lang: string; slug: string }>;
}

export default async function GenericPage({ params }: GenericPageProps) {
    const { lang, slug } = await params;

    // We already have a specific route for checkout if needed, 
    // but if the user wants it dynamic, it will work here too.
    // However, we'll keep the specialized checkout page for cart logic.
    if (slug === 'checkout') return null;

    const page = await getPageData(slug, lang);

    if (!page) {
        notFound();
    }

    return (
        <main className="min-h-screen">
            {/* Optional: Add a title section if the page doesn't have a hero block */}
            <BlockRenderer blocks={page.blocks} />
        </main>
    );
}
