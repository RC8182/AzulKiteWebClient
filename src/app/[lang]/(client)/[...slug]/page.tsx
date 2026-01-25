import { fetchData } from '@/lib/strapi-replacement';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';

interface SmartPageProps {
    params: Promise<{
        lang: string;
        slug: string[];
    }>;
}

/**
 * Fetch generic page data
 */
async function getPageData(slug: string, locale: string) {
    try {
        const data = await fetchData("pages", {
            filters: { slug: { $eq: slug } },
            locale,
            populate: {
                blocks: {
                    on: {
                        'blocks.hero-slider': { populate: { slides: { populate: ['backgroundImage', 'buttons'] } } },
                        'blocks.banner-grid': { populate: { banners: { populate: ['image', 'links'] } } },
                        'blocks.hero-section': { populate: ['backgroundImage', 'cta'] },
                        'blocks.info-block': { populate: '*' },
                        'blocks.product-grid': { populate: { manualProducts: { populate: ['images'] }, selectedCategory: true } },
                        'blocks.scrolling-banner': { populate: { items: { populate: ['image'] } } }
                    }
                }
            }
        });
        return data?.data?.[0];
    } catch (error) {
        return null;
    }
}

/**
 * Fetch category default blocks (for categories without custom blocks)
 */
async function getCategoryBasePageData(locale: string) {
    try {
        const data = await fetchData("pages", {
            filters: { slug: { $eq: "category" } },
            locale,
            populate: {
                blocks: {
                    on: {
                        'blocks.info-block': { populate: '*' },
                        'blocks.product-grid': { populate: { manualProducts: { populate: ['images'] }, selectedCategory: true } },
                        'blocks.scrolling-banner': { populate: { items: { populate: ['image'] } } }
                    }
                }
            }
        });
        return data?.data?.[0];
    } catch (error) {
        return null;
    }
}

export default async function SmartPage({ params }: SmartPageProps) {
    const { lang, slug } = await params;

    // 1. Try to find a CATEGORY
    // Try different slug combinations for hierarchical categories
    let category = null;

    // First try: Full path (e.g., "kitesurf/boards" -> "boards-kite")
    if (slug.length >= 2) {
        const parentSlug = slug[slug.length - 2];
        const childSlug = slug[slug.length - 1];

        // Map common hierarchical paths to actual category slugs
        const hierarchicalMapping: Record<string, Record<string, string>> = {
            'kitesurf': {
                'boards': 'boards-kite',
                'kites': 'kites',
                'bars': 'bars',
                'harnesses': 'harnesses-kite',
                'pads-straps': 'pads-straps',
                'accessories': 'accessories-kite'
            },
            'wing-hydrofoil': {
                'wings': 'wings',
                'boards': 'wing-boards',
                'hydrofoil': 'hydrofoil'
            },
            'accessories': {
                'wetsuits': 'wetsuits',
                'clothing': 'clothing',
                'gear': 'general-gear'
            },
            'collections': {
                'outlet': 'outlet',
                'sales': 'sales',
                'used-test': 'used-test'
            }
        };

        if (hierarchicalMapping[parentSlug] && hierarchicalMapping[parentSlug][childSlug]) {
            const actualSlug = hierarchicalMapping[parentSlug][childSlug];
            category = await prisma.category.findFirst({
                where: { slug: actualSlug },
                include: {
                    translations: {
                        where: { locale: lang },
                        select: { name: true, description: true }
                    }
                }
            });
        }
    }

    // Second try: Leaf slug (last item)
    if (!category) {
        const leafSlug = slug[slug.length - 1];
        category = await prisma.category.findFirst({
            where: { slug: leafSlug },
            include: {
                translations: {
                    where: { locale: lang },
                    select: { name: true, description: true }
                }
            }
        });
    }

    if (category) {
        const pageData = await getCategoryBasePageData(lang);
        const categoryName = category.translations[0]?.name || slug[slug.length - 1];

        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {pageData?.blocks && <BlockRenderer blocks={pageData.blocks} category={category} />}

                <div className="bg-white border-b border-gray-100">
                    <div className="container mx-auto px-4 py-6">
                        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                            <Link href={`/${lang}`} className="hover:text-[#0051B5] transition-colors">Azul Kite</Link>
                            <ChevronRight size={10} />
                            <span className="text-[#0051B5]">{categoryName}</span>
                        </nav>
                        <h1 className="text-4xl md:text-5xl font-black text-[#003366] uppercase tracking-tighter italic">
                            {categoryName}
                        </h1>
                    </div>
                </div>
                <main className="flex-grow"></main>
            </div>
        );
    }

    // 2. Not a category? Try finding a generic PAGE
    // For pages, we usually expect a single slug, but we'll try the last part or join them
    const pageSlug = slug.join('/');
    let page = await getPageData(pageSlug, lang);

    // Fallback if slashes are being used but Strapi expects leaf slug (unlikely but safe)
    if (!page && slug.length > 1) {
        page = await getPageData(slug[slug.length - 1], lang);
    }

    if (page) {
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

    // 3. Nothing found? 404
    notFound();
}
