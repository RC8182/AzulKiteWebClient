'use client';

import { getStrapiMedia } from '@/lib/strapi';
import { useCart } from '@/store/useCart';
import { useProductFilters } from '@/hooks/useProductFilters';
import { ShoppingCart, Filter } from 'lucide-react';
import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ProductGridProps {
    title?: string;
    products?: any;
    layout?: 'grid' | 'carousel';
    category?: string;
    limit?: number;
    showFilters?: boolean;
}

const CATEGORIES = ["Kites", "Boards", "Harnesses", "Wetsuits", "Accessories"];

export default function ProductGrid({
    title,
    products: initialProducts,
    category,
    layout = 'grid',
    limit = 8,
    showFilters = true
}: ProductGridProps) {
    const { addItem } = useCart();

    // Handle Strapi 4/5 relation data structure
    const productsData = (initialProducts as any)?.data || initialProducts;
    const products = Array.isArray(productsData) ? productsData : [];
    const { filters, setFilter } = useProductFilters();

    const effectiveCategory = (category && category !== 'All') ? category : filters.category;

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        const filtered = products.filter((p) => {
            const matchesCategory = !effectiveCategory || p.category === effectiveCategory;
            const matchesSearch = !filters.search || p.name.toLowerCase().includes(filters.search.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        return limit ? filtered.slice(0, limit) : filtered;
    }, [products, effectiveCategory, filters.search, limit]);

    if (!title && (!products || products.length === 0)) return null;

    const renderProducts = () => {
        if (layout === 'carousel') {
            return (
                <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4 no-scrollbar">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="min-w-[280px] md:min-w-[320px]">
                            <ProductCard product={product} addItem={addItem} />
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} addItem={addItem} />
                ))}
            </div>
        );
    };

    return (
        <section className={`py-12 px-4 ${layout === 'carousel' ? 'bg-white' : 'bg-gray-50/50'}`}>
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#003366] tracking-tight">
                        {title}
                    </h2>

                    {showFilters && !category && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
                            <button
                                onClick={() => setFilter('category', '')}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${!filters.category
                                    ? 'bg-[#003366] text-white shadow-md'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Todos
                            </button>
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter('category', cat)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-bold shrink-0 transition-all ${filters.category === cat
                                        ? 'bg-[#003366] text-white shadow-md'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-xl text-gray-500 font-medium">No hay productos disponibles.</p>
                        {!category && (
                            <button
                                onClick={() => setFilter('category', '')}
                                className="mt-4 font-bold text-[#003366] hover:underline"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                ) : (
                    renderProducts()
                )}
            </div>
        </section>
    );
}

function ProductCard({ product, addItem }: { product: any, addItem: any }) {
    const { lang } = useParams();

    // Support both flattened (Strapi 5) and nested (Strapi 4) data
    const attributes = product.attributes || product;

    const productImages = attributes.images?.data || attributes.images || [];
    const firstImage = productImages[0];
    const rawUrl = firstImage?.attributes?.url || firstImage?.url;
    const imageUrl = getStrapiMedia(rawUrl) || "https://placehold.co/400x400?text=No+Image";

    const name = attributes.name || 'Sin nombre';
    const price = attributes.price || 0;
    const imageAlt = firstImage?.attributes?.alternativeText || firstImage?.alternativeText || name || "Product Image";

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 flex flex-col h-full">
            <Link href={`/${lang}/products/${attributes.slug}`} className="relative aspect-square overflow-hidden block">
                <Image
                    alt={imageAlt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={imageUrl}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute top-3 right-3 z-10">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-[#003366] shadow-sm">
                        {attributes.category}
                    </span>
                </div>
            </Link>
            <div className="flex flex-col items-start gap-1 p-5 flex-grow">
                <Link href={`/${lang}/products/${attributes.slug}`} className="block w-full">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 hover:text-[#0072f5] transition-colors">
                        {name}
                    </h3>
                </Link>
                <div className="flex justify-between items-center w-full mt-auto pt-3">
                    <p className="text-2xl font-black text-[#003366]">
                        {price}€
                    </p>
                    <button
                        onClick={() => addItem({
                            id: product.documentId || product.id,
                            name: name,
                            price: price,
                            category: attributes.category,
                            image: imageUrl
                        })}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FF6600] text-white shadow-lg hover:bg-[#e65c00] transition-colors"
                        aria-label="Añadir al carrito"
                    >
                        <ShoppingCart size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
