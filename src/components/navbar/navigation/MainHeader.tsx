'use client';

import { Search, User, ShoppingCart, Menu, X, Loader2, ShoppingBag, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useEffect, useState, useRef, useCallback } from 'react';
import { dictionary } from '../db';
import { useRouter } from 'next/navigation';
import { searchProducts } from '@/actions/product-actions';
import Image from 'next/image';
import Link from 'next/link';
import { getStrapiMedia } from '@/lib/media-utils';
import MobileSearchBar from './MobileSearchBar';
import { useSession, signOut } from 'next-auth/react';

interface MainHeaderProps {
    onOpenMenu?: () => void;
    onOpenCart?: () => void;
    lang: string;
}

export default function MainHeader({ onOpenMenu, onOpenCart, lang }: MainHeaderProps) {
    const items = useCart((state) => state.items);
    const addToCart = useCart((state) => state.addItem);
    const [mounted, setMounted] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();

    const t = dictionary[lang as keyof typeof dictionary]?.header || dictionary['es'].header;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim() && searchResults.length > 0) {
            setShowResults(true);
        }
    };

    const handleProductClick = (product: any) => {
        setSearchQuery('');
        setShowResults(false);
        setIsSearchOpen(false);
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

    const totalItems = mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;

    return (
        <div className="w-full bg-[#0051B5] text-white py-2 px-3 md:px-4 border-b border-white/5 sticky top-0 z-50 shadow-md">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2 md:gap-8 min-h-[44px]">

                {/* Mobile: Menu and Search Buttons (Always visible) */}
                <div className="flex md:hidden items-center gap-0.5 shrink-0">
                    <button
                        className="text-white min-w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                        onClick={onOpenMenu}
                    >
                        <Menu size={24} />
                    </button>
                    <button
                        className="text-white min-w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <Search size={22} />
                    </button>
                </div>

                {/* Logo Section */}
                <div className="flex-1 md:flex-none flex justify-center md:justify-start overflow-visible">
                    <a href={`/${lang}`} className="flex items-center group">
                        <span className="text-[14px] xs:text-[18px] sm:text-[20px] md:text-[24px] font-black italic tracking-tighter uppercase leading-none whitespace-nowrap pr-4 transition-transform group-hover:scale-[1.02]">
                            AZUL<span className="text-[var(--color-accent)]">KITEBOARDING</span>
                        </span>
                    </a>
                </div>

                {/* Desktop: Center Search */}
                <div ref={searchRef} className="hidden md:flex flex-1 max-w-[500px] relative">
                    <form onSubmit={handleSearch} className="relative w-full">
                        <div className="relative w-full flex items-center">
                            <Search size={18} className="absolute left-0 text-white opacity-70" />
                            <input
                                ref={inputRef}
                                placeholder={t.searchPlaceholderDesktop}
                                className="w-full bg-transparent border-b border-white outline-none py-1.5 pl-7 text-sm italic text-white placeholder:text-white/50 focus:border-white transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowResults(true)}
                            />
                            {isLoading && (
                                <Loader2 size={18} className="absolute right-0 text-white opacity-70 animate-spin" />
                            )}
                        </div>

                        {/* Desktop Search Results Dropdown */}
                        {showResults && searchQuery.length >= 2 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-2xl z-50 max-h-[500px] overflow-y-auto border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                {isLoading ? (
                                    <div className="p-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                                                <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <>
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium text-gray-900">
                                                    {searchResults.length} {searchResults.length === 1 ? 'resultado' : 'resultados'} para "<span className="font-semibold">{searchQuery}</span>"
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowResults(false)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="divide-y divide-gray-100">
                                            {searchResults.map((product) => {
                                                const mainImage = product.images?.[0] || product.attributes?.images?.data?.[0];
                                                const imageUrl = mainImage?.url || mainImage?.attributes?.url || '/placeholder-product.jpg';
                                                const imageAlt = mainImage?.alternativeText || mainImage?.attributes?.alternativeText || product.name;

                                                const firstVariant = product.variants?.[0];
                                                const price = firstVariant?.price || 0;
                                                // Por ahora no tenemos sistema de descuentos
                                                const hasDiscount = false;
                                                const category = product.categories?.[0] || product.attributes?.categories?.data?.[0]?.attributes;
                                                const categoryName = category?.name || 'Kitesurf';

                                                return (
                                                    <div
                                                        key={product.id || product.documentId}
                                                        className="hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 p-4">
                                                            <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 group">
                                                                {imageUrl && (
                                                                    <Image
                                                                        src={getStrapiMedia(imageUrl) || '/placeholder-image.jpg'}
                                                                        alt={imageAlt}
                                                                        fill
                                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                                        sizes="64px"
                                                                    />
                                                                )}
                                                                {/* Descuentos no implementados aún */}
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                                                                            {categoryName}
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleProductClick(product)}
                                                                            className="text-left"
                                                                        >
                                                                            <h4 className="font-medium text-gray-900 truncate hover:text-blue-600">
                                                                                {product.name}
                                                                            </h4>
                                                                        </button>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className="font-bold text-gray-900">
                                                                                {price.toFixed(2)}€
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <button
                                                                        onClick={(e) => handleAddToCart(product, e)}
                                                                        className="flex-shrink-0 bg-[var(--color-accent)] text-white p-2 rounded-full hover:bg-orange-600 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm"
                                                                        title="Añadir al carrito"
                                                                    >
                                                                        <ShoppingBag size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                                            <Link
                                                href={`/${lang}/shop`}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1"
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setShowResults(false);
                                                }}
                                            >
                                                Ver todos los productos
                                                <Search size={14} />
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-6 text-center">
                                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                            <Search className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-gray-600">
                                            No encontramos productos para "<span className="font-semibold">{searchQuery}</span>"
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Intenta con otros términos
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 md:gap-4 shrink-0">
                    <div className="relative" ref={userMenuRef}>
                        {session ? (
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex flex-col items-center gap-0.5 text-white hover:opacity-80 p-1 group"
                            >
                                <div className="w-6 h-6 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[10px] font-black italic">
                                    {session.user?.name?.substring(0, 1).toUpperCase() || session.user?.email?.substring(0, 1).toUpperCase()}
                                </div>
                                <span className="hidden md:block text-[9px] font-bold uppercase tracking-widest leading-none">
                                    {session.user?.name?.split(' ')[0] || t.account}
                                </span>
                            </button>
                        ) : (
                            <a href={`/${lang}/account`} className="flex flex-col items-center gap-0.5 text-white hover:opacity-80 p-1 group">
                                <User size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                                <span className="hidden md:block text-[9px] font-bold uppercase tracking-widest leading-none">{t.account}</span>
                            </a>
                        )}

                        {/* User Dropdown Menu */}
                        {isUserMenuOpen && session && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-[60] border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0051B5] truncate">
                                        {session.user?.name || 'Usuario'}
                                    </p>
                                    <p className="text-[9px] font-medium text-gray-400 truncate">
                                        {session.user?.email}
                                    </p>
                                </div>
                                <Link
                                    href={`/${lang}/account`}
                                    className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-[#0051B5] transition-colors"
                                    onClick={() => setIsUserMenuOpen(false)}
                                >
                                    <Settings size={14} />
                                    {t.profile}
                                </Link>

                                {/* Dashboard link for Admins */}
                                {session.user && (session.user as any).role === 'ADMIN' && (
                                    <Link
                                        href={`/${lang}/dashboard`}
                                        className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-[#0051B5] hover:bg-blue-50 transition-colors"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <LayoutDashboard size={14} />
                                        {t.dashboard}
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        signOut();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={14} />
                                    {t.logout}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="relative group cursor-pointer p-1" onClick={onOpenCart}>
                        <div className="flex flex-col items-center gap-0.5 text-white">
                            <div className="relative">
                                <ShoppingCart size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-[var(--color-accent)] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                )}
                            </div>
                            <span className="hidden md:block text-[9px] font-bold uppercase tracking-widest leading-none">
                                {totalItems === 0 ? t.cart : `${totalItems}`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar - Dedicated Third Bar */}
            <MobileSearchBar
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                lang={lang}
                dictionary={dictionary}
            />
        </div >
    );
}

