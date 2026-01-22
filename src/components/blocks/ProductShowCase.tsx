'use client';

import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { getStrapiMedia } from '@/lib/strapi';
import { useCart } from '@/store/useCart';
import { useProductFilters } from '@/hooks/useProductFilters';
import { ShoppingCart, Filter, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts } from '@/actions/product-actions';
import { getCategories, getCategoryBySlug } from '@/actions/category-actions';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import CategorySidebar from './CategorySidebar';

interface ProductGridProps {
    title?: string;
    manualProducts?: any; // Renamed from products
    layout?: 'grid' | 'carousel';
    selectedCategory?: any;
    mode?: 'all' | 'category' | 'manual';
    limit?: number;
    showFilters?: boolean;
    category?: any; // Current category from page context
}

// Removed static CATEGORIES

// ... imports remain same ...

// ... imports remain same ...

interface ProductViewProps {
    products: any[];
    addItem: (item: any) => void;
}

// Internal Component: Carousel View
function ProductCarouselView({ products, addItem }: ProductViewProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        align: 'start',
        containScroll: 'trimSnaps',
        dragFree: true
    });
    // ... rest of implementation remains logic ... we only need to update the return type definition in signature if needed, 
    // but here we are replacing the block. 
    // Wait, the previous tool didn't show lines 34-42 fully. 
    // I need to be careful not to overwrite logic I can't see.
    // However, I can redefine the start of the file or the main component.

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    return (
        <div className="relative group/carousel">
            {/* Navigation Buttons */}
            <button
                onClick={scrollPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-30 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-[#003366] opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0 transition-all hover:bg-[#003366] hover:text-white border border-gray-100"
            >
                <ChevronLeft size={20} />
            </button>

            <div className="overflow-hidden -mx-4 px-4" ref={emblaRef}>
                <div className="flex gap-4">
                    {products.map((product) => (
                        <div key={product.id} className="min-w-[220px] md:min-w-[240px] max-w-[240px] flex-[0_0_auto]">
                            <ProductCard product={product} addItem={addItem} />
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={scrollNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-30 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-[#003366] opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0 transition-all hover:bg-[#003366] hover:text-white border border-gray-100"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}

// Internal Component: Grid View
function ProductGridView({ products, addItem }: ProductViewProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} addItem={addItem} />
            ))}
        </div>
    );
}

export default function ProductGrid({
    title,
    manualProducts: initialProducts,
    selectedCategory,
    mode = 'all',
    layout = 'carousel',
    limit,
    showFilters = true,
    category: pageCategory
}: ProductGridProps) {
    const { addItem } = useCart();
    const { lang, slug } = useParams();
     const [fetchedProducts, setFetchedProducts] = useState<any[]>([]);
     const [fetchedCategories, setFetchedCategories] = useState<any[]>([]);
     const [subCategories, setSubCategories] = useState<any[]>([]);
     const [currentCategory, setCurrentCategory] = useState<any>(null);
     const [isLoading, setIsLoading] = useState(false);

    // Ensure layout has a fallback if null comes from Strapi
    const safeLayout = layout || 'carousel';

    // Handle Strapi 4/5 relation data structure
    const initialProductsData = (initialProducts as any)?.data || initialProducts;
    const manualProducts = Array.isArray(initialProductsData) ? initialProductsData : [];

    const { filters, setFilter, clearFilters } = useProductFilters();

    // Use page category if available, otherwise use block's selected category
    const blockCategoryName = pageCategory?.name || selectedCategory?.data?.attributes?.name || selectedCategory?.name;
    const blockCategorySlug = pageCategory?.slug || selectedCategory?.data?.attributes?.slug || selectedCategory?.slug;

    const getAllDescendantSlugs = (cat: any): string[] => {
        let slugs: string[] = [cat.slug];
        if (cat.children && (Array.isArray(cat.children.data) || Array.isArray(cat.children))) {
            const children = cat.children.data || cat.children;
            children.forEach((child: any) => {
                const childData = child.attributes || child;
                slugs = [...slugs, ...getAllDescendantSlugs(childData)];
            });
        }
        return slugs;
    };

    useEffect(() => {
        const fetchAllData = async () => {
            // Need data if we are in dynamic mode (all or category) OR if we need filter labels
            // If mode is category but no category is selected in the block, we use the one from the URL (slug)
            // NEW: If mode is 'all' but we are on a category page (slug is present and NOT home), 
            // we treat it as 'category' mode to make blocks placed in dynamic category pages 
            // "aware" of their context.
            const isHomePage = !slug || slug === 'home';
            const autoDetectedCategory = (mode === 'all' || mode === 'category') && slug && !isHomePage;

            const effectiveSlug = blockCategorySlug || (autoDetectedCategory ? slug : null);

            const needsDynamicProducts = mode === 'all' || mode === 'category' || effectiveSlug;
            const needsFilterCategories = showFilters && !blockCategoryName;

            if (!needsDynamicProducts && !needsFilterCategories) {
                return;
            }

            setIsLoading(true);
            try {
                const fetchParams: any = {};
                if (effectiveSlug) {
                    const categoryData = await getCategoryBySlug(effectiveSlug as string, lang as string);
                     if (categoryData) {
                         const allSlugs = getAllDescendantSlugs(categoryData);
                         fetchParams.categories = { slug: { $in: allSlugs } };

                         // Set subcategories for sidebar
                         const children = categoryData.children?.data || categoryData.children || [];
                         setSubCategories(children.map((c: any) => c.attributes || c));
                         
                         // Save current category for title
                         setCurrentCategory(categoryData);
                    } else {
                        fetchParams.categories = { slug: { $eq: effectiveSlug } };
                    }
                }

                const [productsRes, categoriesRes] = await Promise.all([
                    needsDynamicProducts ? getProducts(1, 100, fetchParams, lang as string) : Promise.resolve({ data: [] }),
                    needsFilterCategories ? getCategories(lang as string) : Promise.resolve([])
                ]);

                if (needsDynamicProducts) setFetchedProducts(productsRes.data || []);
                if (needsFilterCategories) setFetchedCategories(categoriesRes || []);
            } catch (error) {
                console.error('Error fetching data for Showcase:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, [mode, blockCategorySlug, showFilters, lang, slug]);

    const products = mode === 'manual' ? manualProducts : fetchedProducts;

    // Extract available brands for the sidebar
    const availableBrands = useMemo(() => {
        if (!products) return [];
        const brands = products.map(p => (p.attributes || p).brand).filter(Boolean);
        return Array.from(new Set(brands)) as string[];
    }, [products]);

    const effectiveCategory = (blockCategorySlug && blockCategorySlug !== 'all') ? blockCategorySlug : filters.category;

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        const filtered = products.filter((p) => {
            const pData = p.attributes || p;

            // Handle categories as relation array (Strapi 5 populated data)
            // Strapi 5 puede devolver categorías como array de objetos o como array de IDs
            let productCategories: string[] = [];
            
            if (pData.categories) {
                if (Array.isArray(pData.categories)) {
                    // Podría ser array de objetos de categoría o array de IDs
                    productCategories = pData.categories.map((c: any) => {
                        if (typeof c === 'object') {
                            return c.name || c.attributes?.name || '';
                        }
                        return ''; // Si es ID, no tenemos el nombre aquí
                    }).filter(Boolean);
                } else if (pData.categories.data && Array.isArray(pData.categories.data)) {
                    // Formato antiguo de Strapi 4
                    productCategories = pData.categories.data.map((c: any) => 
                        c.attributes?.name || c.name || ''
                    ).filter(Boolean);
                }
            }
            
            // Si no encontramos nombres, usar slugs como fallback
            if (productCategories.length === 0 && pData.categories && Array.isArray(pData.categories)) {
                productCategories = pData.categories.map((c: any) => {
                    if (typeof c === 'object') {
                        return c.slug || '';
                    }
                    return '';
                }).filter(Boolean);
            }

            // Comparar slugs en lugar de nombres
            const matchesCategory = !effectiveCategory || 
                productCategories.some((catName: string) => 
                    catName.toLowerCase() === effectiveCategory.toLowerCase() ||
                    // También intentar match por slug si tenemos acceso a él
                    (pData.categories && Array.isArray(pData.categories) && 
                     pData.categories.some((c: any) => 
                         typeof c === 'object' && c.slug && c.slug.toLowerCase() === effectiveCategory.toLowerCase()
                     ))
                );
            const matchesSearch = !filters.search ||
                (pData.name || "").toLowerCase().includes(filters.search.toLowerCase()) ||
                (pData.brand || "").toLowerCase().includes(filters.search.toLowerCase());

            const price = pData.price || 0;
            const matchesMinPrice = !filters.minPrice || price >= parseFloat(filters.minPrice);
            const matchesMaxPrice = !filters.maxPrice || price <= parseFloat(filters.maxPrice);

            return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice;
        });

        // Always apply limit if provided, regardless of mode
        return limit ? filtered.slice(0, limit) : filtered;
    }, [products, effectiveCategory, filters.search, filters.minPrice, filters.maxPrice, limit]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!title && (!products || products.length === 0)) return null;

    const isHomePage = !slug || slug === 'home';
    const showSidebar = (mode === 'category' || (mode === 'all' && slug && !isHomePage)) && !isHomePage;

    return (
        <section className={`py-12 px-4 ${safeLayout === 'carousel' ? 'bg-white' : 'bg-gray-50/50'}`}>
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                     <h2 className="text-3xl md:text-5xl font-black text-[#003366] uppercase tracking-tighter italic">
                         {title || blockCategoryName || (mode === 'category' && currentCategory?.name) || 'Productos'}
                     </h2>

                    <div className="flex items-center gap-4">
                        {showSidebar && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 text-[#003366] font-black uppercase text-[10px] tracking-widest shadow-sm hover:border-[#FF6600] transition-all"
                            >
                                <Filter size={14} />
                                Filtros
                            </button>
                        )}

                        {showFilters && !blockCategoryName && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
                                <button
                                    onClick={() => setFilter('category', '')}
                                    className={`px-5 py-2 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${!filters.category
                                        ? 'bg-[#FF6600] text-white shadow-lg'
                                        : 'bg-white text-[#003366] border border-gray-100 hover:border-[#FF6600]'
                                        }`}
                                >
                                    Todos
                                </button>
                                {fetchedCategories.map((cat) => {
                                    const name = cat.attributes?.name || cat.name;
                                    const slug = cat.attributes?.slug || cat.slug;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setFilter('category', slug)}
                                            className={`px-5 py-2 rounded-none text-[10px] font-black uppercase tracking-widest shrink-0 transition-all ${filters.category === slug
                                                ? 'bg-[#FF6600] text-white shadow-lg'
                                                : 'bg-white text-[#003366] border border-gray-100 hover:border-[#FF6600]'
                                                }`}
                                        >
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className={showSidebar ? "flex flex-col md:flex-row gap-8" : ""}>
                    {/* Desktop Sidebar */}
                    {showSidebar && (
                        <div className="hidden md:block w-64 shrink-0">
                            <CategorySidebar
                                brands={availableBrands}
                                categories={subCategories}
                                currentCategorySlug={slug as string}
                                lang={lang as string}
                            />
                        </div>
                    )}

                    {/* Mobile Sidebar Overlay */}
                    {showSidebar && isSidebarOpen && (
                        <div className="fixed inset-0 z-[100] md:hidden">
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                            <div className="absolute inset-y-0 left-0 w-80 max-w-[80%] bg-white shadow-2xl animate-in slide-in-from-left duration-300">
                                <CategorySidebar
                                    brands={availableBrands}
                                    categories={subCategories}
                                    currentCategorySlug={slug as string}
                                    lang={lang as string}
                                    onClose={() => setIsSidebarOpen(false)}
                                />
                            </div>
                        </div>
                    )}

                    <div className={showSidebar ? "flex-1 min-w-0" : ""}>
                        {isLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-sm" />
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-xl text-gray-500 font-medium">No hay productos disponibles con estos filtros.</p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 font-bold text-[#003366] hover:underline"
                                >
                                    Limpiar todos los filtros
                                </button>
                            </div>
                        ) : (
                            safeLayout === 'carousel'
                                ? <ProductCarouselView products={filteredProducts} addItem={addItem} />
                                : <ProductGridView products={filteredProducts} addItem={addItem} />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ... ProductCard remains unchanged ...

function ProductCard({ product, addItem }: { product: any, addItem: any }) {
    const { lang } = useParams();
    const attributes = product.attributes || product;

    const productImages = attributes.images?.data || attributes.images || [];
    const firstImage = productImages[0];
    const rawUrl = firstImage?.attributes?.url || firstImage?.url;
    const imageUrl = getStrapiMedia(rawUrl) || "https://placehold.co/400x400?text=No+Image";

    const name = attributes.name || 'Sin nombre';
    const price = attributes.price || 0;

    // Normalize variants structure (handle Strapi relation vs direct array)
    const variantsRaw = attributes.variants?.data || attributes.variants || [];
    const variants = Array.isArray(variantsRaw) ? variantsRaw : [];

    const imageAlt = firstImage?.attributes?.alternativeText || firstImage?.alternativeText || name || "Product Image";

    const getBadgeStyles = (type: string) => {
        return 'bg-[#FF6600] text-white px-3 py-1.5 font-black uppercase text-[10px] shadow-lg italic tracking-tighter';
    };

    // Pre-calculate display data for performance
    const saleInfo = attributes.saleInfo || { type: 'None', discountPercent: 0 };
    const maxVariantDiscount = variants.length > 0
        ? Math.max(0, ...variants.map((v: any) => v.saleInfo?.discountPercent || 0))
        : 0;
    const discount = Math.max(saleInfo.discountPercent, maxVariantDiscount);
    const showSaleBadge = discount > 0 || saleInfo.type !== 'None';

    return (
        <div className="bg-white border border-gray-100 transition-all duration-300 group flex flex-col h-full relative hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] border-b-2 border-b-transparent hover:border-b-[#FF6600]">
            {/* Image Section */}
            <Link href={`/${lang}/products/${attributes.slug}`} className="relative aspect-square overflow-hidden block bg-[#F8F8F8]">
                <Image
                    alt={imageAlt}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
                    src={imageUrl}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                />

                {/* Sale Badge */}
                {showSaleBadge && (
                    <div className="absolute top-0 right-0 z-20">
                        <span className="bg-[#FF6600] text-white px-3 py-1.5 font-black uppercase text-[10px] shadow-lg italic tracking-tighter">
                            {discount > 0 ? `${discount}% OFF` : saleInfo.type}
                        </span>
                    </div>
                )}
            </Link>

            {/* Info Section */}
            <div className="flex flex-col p-4 flex-grow bg-white group-hover:bg-[#F4F7F9]/30 transition-colors">
                <div className="flex-grow">
                    <p className="text-[9px] font-black text-[#0072f5] uppercase tracking-widest mb-1.5">
                        {attributes.brand || 'Original'}
                    </p>
                    <Link href={`/${lang}/products/${attributes.slug}`} className="block">
                        <h3 className="text-xs font-black text-[#003366] line-clamp-2 leading-tight uppercase tracking-tight hover:text-[#FF6600] transition-colors mb-2 italic">
                            {name}
                        </h3>
                    </Link>

                    {/* Variant Indicators - Now more visible with color tags */}
                    <div className="flex flex-col gap-1.5 mt-2 overflow-hidden">
                        {variants.length > 0 && Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean))).length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                                {Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean))).slice(0, 3).map((color: any, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                                            {color}{i < Math.min(Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean))).length, 3) - 1 ? ',' : ''}
                                        </span>
                                    </div>
                                ))}
                                {Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean))).length > 3 && (
                                    <span className="text-[8px] font-bold text-[#FF6600]">+ {Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean))).length - 3}</span>
                                )}
                            </div>
                        )}
                        {variants.length > 0 && Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean))).length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                                {Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean))).slice(0, 4).map((size: any, i) => (
                                    <span key={i} className="text-[8px] font-black text-white bg-[#003366] px-1.5 rounded-sm uppercase tracking-tighter opacity-80">
                                        {size}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Price Section */}
                <div className="mt-3 mb-4">
                    {(() => {
                        // Price Calculation logic
                        const productSaleInfo = attributes.saleInfo || { type: 'None', discountPercent: 0 };
                        const hasAnyDiscount = (productSaleInfo.discountPercent > 0) || variants.some((v: any) => v.saleInfo?.discountPercent > 0);

                        const variantPrices = variants.map((v: any) => v.price).filter((p: any) => typeof p === 'number' && p > 0);
                        const maxPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : price;

                        const minFinalPrice = variants.length > 0
                            ? Math.min(...variants.map((v: any) => {
                                const vPrice = v.price || price;
                                const vDisc = v.saleInfo?.discountPercent || productSaleInfo.discountPercent || 0;
                                return vDisc > 0 ? vPrice * (1 - vDisc / 100) : vPrice;
                            }).filter((p: number) => p > 0))
                            : (productSaleInfo.discountPercent > 0 ? price * (1 - productSaleInfo.discountPercent / 100) : price);

                        return (
                            <div className="flex flex-col gap-0.5">
                                {hasAnyDiscount && (
                                    <span className="text-[10px] font-bold text-gray-500 line-through leading-none">
                                        €{maxPrice.toFixed(2)}
                                    </span>
                                )}
                                <p className="text-xl font-black text-[#003366] tracking-tighter italic">
                                    {variants.length > 1 && <span className="text-[8px] not-italic uppercase text-gray-400 mr-1">Desde</span>}
                                    €{minFinalPrice.toFixed(2)}
                                </p>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Bottom Buttons - With brand colors */}
            <div className="grid grid-cols-2 border-t border-gray-100 mt-auto">
                <Link
                    href={`/${lang}/products/${attributes.slug}`}
                    className="flex items-center justify-center gap-2 py-3.5 text-[9px] font-black text-[#003366] uppercase tracking-widest hover:bg-[#003366] hover:text-white transition-all border-r border-gray-100"
                >
                    <Eye size={14} className="opacity-70" />
                    Info
                </Link>
                <button
                    onClick={() => {
                        const productSaleInfo = attributes.saleInfo || { type: 'None', discountPercent: 0 };
                        const cheapestVariant = variants.length > 0 ? variants.reduce((prev: any, curr: any) => (prev.price < curr.price ? prev : curr)) : null;
                        const finalPrice = cheapestVariant
                            ? (cheapestVariant.saleInfo?.discountPercent > 0 ? cheapestVariant.price * (1 - cheapestVariant.saleInfo.discountPercent / 100) : (productSaleInfo.discountPercent > 0 ? cheapestVariant.price * (1 - productSaleInfo.discountPercent / 100) : cheapestVariant.price))
                            : (productSaleInfo.discountPercent > 0 ? price * (1 - productSaleInfo.discountPercent / 100) : price);

                        addItem({
                            id: product.documentId || product.id,
                            name: name,
                            price: finalPrice,
                            category: Array.isArray(attributes.categories?.data)
                                ? attributes.categories.data[0]?.attributes?.name || attributes.categories.data[0]?.name
                                : Array.isArray(attributes.categories)
                                    ? attributes.categories[0]?.name || attributes.categories[0]?.attributes?.name
                                    : attributes.category || 'Uncategorized',
                            image: imageUrl,
                            variant: cheapestVariant ? {
                                color: cheapestVariant.color,
                                size: cheapestVariant.size,
                                originalPrice: cheapestVariant.price,
                                discount: cheapestVariant.saleInfo?.discountPercent || productSaleInfo.discountPercent
                            } : undefined
                        });
                    }}
                    className="flex items-center justify-center gap-2 py-3.5 text-[9px] font-black text-[#003366] uppercase tracking-widest hover:bg-[#FF6600] hover:text-white transition-all"
                >
                    <ShoppingCart size={14} className="opacity-70" />
                    Buy
                </button>
            </div>
        </div>
    );
}
