'use client';

import React from 'react';
import { useProductFilters } from '@/hooks/useProductFilters';
import { X, ChevronRight } from 'lucide-react';

interface CategorySidebarProps {
    categories?: any[];
    brands?: string[];
    currentCategorySlug?: string;
    onClose?: () => void;
    lang: string;
}

export default function CategorySidebar({
    categories = [],
    brands = [],
    currentCategorySlug,
    onClose,
    lang
}: CategorySidebarProps) {
    const { filters, setFilter, clearFilters } = useProductFilters();

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'minPrice' | 'maxPrice') => {
        setFilter(type, e.target.value);
    };

    return (
        <aside className="w-full bg-white flex flex-col h-full overflow-y-auto">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 md:hidden">
                <h2 className="text-lg font-black text-[#003366] uppercase tracking-tighter italic">Filtros</h2>
                <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-[#003366]">
                    <X size={24} />
                </button>
            </div>

            <div className="p-6 space-y-8">
                {/* Categories */}
                {categories.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-black text-[#003366] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="w-2 h-[2px] bg-[#FF6600]"></span>
                            Categorías
                        </h3>
                        <ul className="space-y-2">
                            {categories.map((cat) => (
                                <li key={cat.slug}>
                                    <a
                                        href={`/${lang}/${currentCategorySlug ? `${currentCategorySlug}/` : ''}${cat.slug}`}
                                        className={`group flex items-center justify-between py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${currentCategorySlug === cat.slug ? 'text-[#FF6600]' : 'text-gray-500 hover:text-[#003366]'
                                            }`}
                                    >
                                        {cat.name}
                                        <ChevronRight size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${currentCategorySlug === cat.slug ? 'opacity-100' : ''}`} />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Price Range */}
                <div>
                    <h3 className="text-[10px] font-black text-[#003366] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <span className="w-2 h-[2px] bg-[#FF6600]"></span>
                        Rango de Precio
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400">€</span>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={(e) => handlePriceChange(e, 'minPrice')}
                                    className="w-full pl-6 pr-3 py-2 text-[11px] font-bold border border-gray-200 outline-none focus:border-[#FF6600] transition-colors"
                                />
                            </div>
                            <div className="w-2 h-[1px] bg-gray-300"></div>
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400">€</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={(e) => handlePriceChange(e, 'maxPrice')}
                                    className="w-full pl-6 pr-3 py-2 text-[11px] font-bold border border-gray-200 outline-none focus:border-[#FF6600] transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brands */}
                {brands.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-black text-[#003366] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="w-2 h-[2px] bg-[#FF6600]"></span>
                            Marcas
                        </h3>
                        <div className="space-y-2">
                            {brands.map((brand) => (
                                <label key={brand} className="flex items-center gap-3 group cursor-pointer">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={filters.search?.includes(brand)}
                                            onChange={() => {
                                                // Using search filter for brand for now, or we could add a brand filter to hook
                                                setFilter('search', brand === filters.search ? '' : brand);
                                            }}
                                            className="peer appearance-none w-4 h-4 border border-gray-200 checked:bg-[#003366] checked:border-[#003366] transition-all cursor-pointer"
                                        />
                                        <div className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity text-white">
                                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                <path d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-[#003366] transition-colors whitespace-nowrap">
                                        {brand}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Clear All */}
                <button
                    onClick={clearFilters}
                    className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] border border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white transition-all italic"
                >
                    Limpiar Filtros
                </button>
            </div>
        </aside>
    );
}
