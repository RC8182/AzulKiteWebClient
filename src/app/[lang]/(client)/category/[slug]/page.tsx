import { getProducts } from '@/actions/product-actions';
import { getCategoryBySlug } from '@/actions/category-actions';
import ProductGrid from '@/components/blocks/ProductGrid';
import { getDictionary } from '../db';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { fetchData } from '@/lib/strapi';
import BlockRenderer from '@/components/blocks/BlockRenderer';

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
                        'blocks.info-block': { populate: '*' }
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
    const dict = getDictionary(lang);

    // 1. Fetch category metadata
    const category = await getCategoryBySlug(slug, lang);
    const categoryName = category?.name || slug.charAt(0).toUpperCase() + slug.slice(1);

    // 2. Prepare recursive filters
    // A helper to collect all descendant slugs
    const getAllDescendantSlugs = (cat: any): string[] => {
        let slugs: string[] = [cat.slug];
        if (cat.children && cat.children.length > 0) {
            cat.children.forEach((child: any) => {
                slugs = [...slugs, ...getAllDescendantSlugs(child)];
            });
        }
        return slugs;
    };

    const allCategorySlugs = category ? getAllDescendantSlugs(category) : [slug];

    // Fetch products for this category and its subcategories
    const productsPromise = getProducts(1, 100, {
        categories: {
            slug: {
                $in: allCategorySlugs
            }
        }
    }, lang);

    // Fetch optional page blocks from Strapi
    const pageDataPromise = getCategoryPageData(lang);

    const [productsResponse, pageData] = await Promise.all([productsPromise, pageDataPromise]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {pageData?.blocks && <BlockRenderer blocks={pageData.blocks} />}

            {/* Breadcrumbs Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-6">
                    <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                        <Link href={`/${lang}`} className="hover:text-[#0051B5] transition-colors">Azul Kite</Link>
                        <ChevronRight size={10} />
                        <span className="text-[#0051B5]">{categoryName}</span>
                    </nav>
                    <h1 className="text-4xl md:text-5xl font-black text-[#003366] uppercase tracking-tighter italic">
                        {dict.categories[slug as keyof typeof dict.categories] || categoryName}
                    </h1>
                </div>
            </div>

            <main className="flex-grow">
                {productsResponse.data && productsResponse.data.length > 0 ? (
                    <ProductGrid
                        products={productsResponse.data}
                        category={categoryName}
                        showFilters={false}
                        title=""
                    />
                ) : (
                    <div className="container mx-auto px-4 py-24 text-center">
                        <div className="max-w-md mx-auto bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
                            <p className="text-xl font-bold text-gray-400 uppercase tracking-tight mb-8">
                                {dict.noProducts}
                            </p>
                            <Link
                                href={`/${lang}`}
                                className="inline-block bg-[#0051B5] text-white font-black px-10 py-4 rounded-none text-xs uppercase tracking-widest hover:bg-[#003B95] transition-all italic"
                            >
                                {dict.backToHome}
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
