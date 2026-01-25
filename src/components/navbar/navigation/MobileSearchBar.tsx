'use client';

import { Search, X, Loader2, ShoppingBag } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { searchProducts } from '@/actions/product-actions';
import Image from 'next/image';
import Link from 'next/link';
import { getStrapiMedia } from '@/lib/media-utils';
import { useRouter } from 'next/navigation';
import { useCart } from '@/store/useCart';

interface MobileSearchBarProps {
    isOpen: boolean;
    onClose: () => void;
    lang: string;
    dictionary: any;
}

export default function MobileSearchBar({ isOpen, onClose, lang, dictionary }: MobileSearchBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const addToCart = useCart((state) => state.addItem);

    const t = dictionary?.[lang as keyof typeof dictionary]?.header || dictionary?.['es']?.header || {
        searchPlaceholderMobile: "Buscar productos...",
        searchPlaceholderDesktop: "¿Qué estás buscando?"
    };

    const fetchSearchResults = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const data = await searchProducts(query, lang, 8);
            setSearchResults(data.products || []);
        } catch (error) {
            console.error('Error fetching search results:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [lang]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery) {
                fetchSearchResults(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, fetchSearchResults]);

    const handleProductClick = (product: any) => {
        setSearchQuery('');
        onClose();
        router.push(`/${lang}/products/${product.slug}`);
    };

    const handleAddToCart = (product: any, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const mainImage = product.images?.[0] || product.attributes?.images?.data?.[0];
        const imageUrl = mainImage?.url || mainImage?.attributes?.url || '/placeholder-product.jpg';
        const category = product.categories?.[0] || product.attributes?.categories?.data?.[0]?.attributes;
        const categoryName = category?.name || 'Kitesurf';

        const firstVariant = product.variants?.[0];
        const price = firstVariant?.price || 0;

        const cartProduct = {
            id: product.id || product.documentId,
            name: product.name,
            slug: product.slug,
            price: price,
            image: imageUrl,
            category: categoryName,
            quantity: 1
        };

        addToCart(cartProduct);
    };

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="md:hidden fixed inset-0 top-[90px] z-[60] bg-[#0051B5]">
            {/* Search Input Bar - Third dedicated bar with CategoryNav style */}
            <div className="w-full bg-[#0051B5] border-t border-white/5 px-4 py-2 shadow-sm">
                <div className="relative flex items-center">
                    <Search size={18} className="absolute left-3 text-white opacity-70" />
                    <input
                        type="text"
                        placeholder={t.searchPlaceholderMobile || "Buscar productos..."}
                        className="w-full pl-10 pr-12 py-2 bg-transparent border-b border-white/30 outline-none text-white placeholder:text-white/50 text-sm focus:border-white transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                    {isLoading && (
                        <Loader2 size={18} className="absolute right-12 text-white opacity-70 animate-spin" />
                    )}
                    <button
                        onClick={onClose}
                        className="absolute right-3 text-white/70 hover:text-white"
                        aria-label="Cerrar búsqueda"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Search Results */}
            <div className="bg-white h-[calc(100vh-90px)] overflow-y-auto">
                {searchQuery.length >= 2 ? (
                    <>
                        {isLoading ? (
                            <div className="p-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                                        <div className="w-14 h-14 bg-gray-300 rounded-md"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                            <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : searchResults.length > 0 ? (
                            <>
                                <div className="px-4 py-3 border-b border-gray-200 bg-gray-100">
                                    <div className="font-medium text-gray-800">
                                        {searchResults.length} {searchResults.length === 1 ? 'resultado' : 'resultados'} para "<span className="font-semibold">{searchQuery}</span>"
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-200">
                                    {searchResults.map((product) => {
                                        const mainImage = product.images?.[0] || product.attributes?.images?.data?.[0];
                                        const imageUrl = mainImage?.url || mainImage?.attributes?.url || '/placeholder-product.jpg';
                                        const imageAlt = mainImage?.alternativeText || mainImage?.attributes?.alternativeText || product.name;

                                        const firstVariant = product.variants?.[0];
                                        const price = firstVariant?.price || 0;
                                        const category = product.categories?.[0] || product.attributes?.categories?.data?.[0]?.attributes;
                                        const categoryName = category?.name || 'Kitesurf';

                                        return (
                                            <div
                                                key={product.id || product.documentId}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 p-4">
                                                    <div className="relative w-14 h-14 flex-shrink-0 rounded-md overflow-hidden bg-gray-200">
                                                        {imageUrl && (
                                                            <Image
                                                                src={getStrapiMedia(imageUrl) || '/placeholder-image.jpg'}
                                                                alt={imageAlt}
                                                                fill
                                                                className="object-cover"
                                                                sizes="56px"
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <button
                                                                    onClick={() => handleProductClick(product)}
                                                                    className="text-left w-full"
                                                                >
                                                                    <h4 className="font-medium text-gray-800 truncate hover:text-[#0051B5] text-sm">
                                                                        {product.name}
                                                                    </h4>
                                                                </button>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="font-bold text-gray-900 text-sm">
                                                                        {price.toFixed(2)}€
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-gray-600 mt-0.5">
                                                                    {categoryName}
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={(e) => handleAddToCart(product, e)}
                                                                className="flex-shrink-0 bg-[var(--color-accent)] text-white p-1.5 rounded-full hover:bg-orange-600 transition-colors"
                                                                title="Añadir al carrito"
                                                            >
                                                                <ShoppingBag size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="px-4 py-3 border-t border-gray-200 bg-gray-100">
                                    <Link
                                        href={`/${lang}/shop`}
                                        className="text-sm text-[#0051B5] hover:text-blue-800 font-medium flex items-center justify-center gap-1"
                                        onClick={() => {
                                            setSearchQuery('');
                                            onClose();
                                        }}
                                    >
                                        Ver todos los productos
                                        <Search size={14} />
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="p-6 text-center">
                                <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                                    <Search className="w-6 h-6 text-gray-500" />
                                </div>
                                <p className="text-gray-700">
                                    No encontramos productos para "<span className="font-semibold">{searchQuery}</span>"
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Intenta con otros términos
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="p-6 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-700 font-medium mb-2">
                            Busca productos de kitesurf
                        </p>
                        <p className="text-sm text-gray-600">
                            Escribe el nombre del producto, categoría o marca
                        </p>
                        <div className="mt-6 text-xs text-gray-500">
                            <p>Ejemplos: "kite", "tabla", "arnés", "neopreno"</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

