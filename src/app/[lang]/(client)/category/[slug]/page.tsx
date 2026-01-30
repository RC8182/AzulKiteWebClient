import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { fetchData } from '@/lib/strapi-replacement';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { prisma } from '@/lib/prisma';

interface CategoryPageProps {
    params: Promise<{
        lang: string;
        slug: string;
    }>;
}

async function getCategoryPageData(locale: string) {
    try {
        const data = await fetchData("pages", {
            filters: { slug: { $eq: "category" } },
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

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { lang, slug } = await params;

    // 1. Fetch category metadata AND custom blocks from Prisma
    const category = await prisma.category.findFirst({
        where: { slug },
        include: {
            translations: {
                where: { locale: lang },
                select: { name: true, description: true }
            },
            blocks: {
                include: {
                    translations: {
                        where: { locale: lang },
                        select: { content: true }
                    }
                },
                orderBy: { order: 'asc' }
            }
        }
    });

    const categoryName = category?.translations[0]?.name || slug.charAt(0).toUpperCase() + slug.slice(1);

    // Normalize category blocks if they exist
    const categoryBlocks = category?.blocks?.map(block => ({
        ...block,
        content: block.translations[0]?.content || {},
        __component: `blocks.${block.type}` // Standardize type for BlockRenderer
    }));

    // 2. Fetch generic "Category Layout" page blocks (Fallback)
    // Only if the category doesn't have its own blocks
    const pageData = !categoryBlocks || categoryBlocks.length === 0 ? await getCategoryPageData(lang) : null;

    // Determine which blocks to show
    const blocksToShow = categoryBlocks && categoryBlocks.length > 0 ? categoryBlocks : pageData?.blocks;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Render Blocks (Category Specific OR Generic Fallback) */}
            {blocksToShow && <BlockRenderer blocks={blocksToShow} category={category} />}

            {/* If NO blocks exist at all, show a default header (safety net) */}
            {!blocksToShow && (
                <>
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
                    <main className="flex-grow container mx-auto px-4 py-12">
                        <p className="text-gray-500 text-center">No content found for this category.</p>
                    </main>
                </>
            )}
        </div>
    );
}
