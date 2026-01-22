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
                                manualProducts: {
                                    populate: '*'
                                },
                                selectedCategory: {
                                    populate: '*'
                                }
                            }
                        },
                        'blocks.hero-section': {
                            populate: ['backgroundImage', 'cta']
                        },
                        'blocks.info-block': {
                            populate: '*'
                        },
                        'blocks.scrolling-banner': {
                            populate: {
                                items: {
                                    populate: ['image']
                                }
                            }
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

    if (slug === 'checkout') return null;

    const page = await getPageData(slug, lang);

    if (!page) {
        notFound();
    }

    const hasHero = page.blocks?.some((b: any) =>
        b.__component === 'blocks.hero-section' || b.__component === 'blocks.hero-slider'
    );

    return (
        <main className="min-h-screen">
            {!hasHero && page.title && (
                <div className="bg-[#003366] text-white py-16 md:py-24">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
                            {page.title}
                        </h1>
                    </div>
                </div>
            )}
            <BlockRenderer blocks={page.blocks} />
        </main>
    );
}
