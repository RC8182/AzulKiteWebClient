import { getCategoryBySlug } from '@/actions/category-actions';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { fetchData } from '@/lib/strapi';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
    params: Promise<{
        lang: string;
        slug: string[];
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

    // The leaf category is the last slug in the array
    const leafSlug = slug[slug.length - 1];

    // 1. Fetch category metadata from Strapi
    const category = await getCategoryBySlug(leafSlug, lang);

    if (!category) {
        notFound();
    }

    const categoryName = category.name;

    // Fetch optional page blocks from Strapi
    const pageData = await getCategoryPageData(lang);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Render Category specific blocks if they exist, otherwise fallback to generic category page blocks */}
            {(category?.blocks && category.blocks.length > 0) ? (
                <BlockRenderer blocks={category.blocks} />
            ) : (
                pageData?.blocks && <BlockRenderer blocks={pageData.blocks} />
            )}

            {/* Breadcrumbs Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-6">
                    <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                        <Link href={`/${lang}`} className="hover:text-[#0051B5] transition-colors">Azul Kite</Link>
                        <ChevronRight size={10} />
                        <Link href={`/${lang}/shop`} className="hover:text-[#0051B5] transition-colors">Shop</Link>
                        <ChevronRight size={10} />
                        <span className="text-[#0051B5]">{categoryName}</span>
                    </nav>
                    <h1 className="text-4xl md:text-5xl font-black text-[#003366] uppercase tracking-tighter italic">
                        {categoryName}
                    </h1>
                </div>
            </div>

            <main className="flex-grow">
                {/* Content rendering is handled by BlockRenderer */}
            </main>
        </div>
    );
}
