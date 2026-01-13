'use client';

import { ChevronDown } from 'lucide-react';
import { dictionary } from '../db';

interface CategoryNavProps {
    lang: string;
    categories: any[];
}

export default function CategoryNav({ lang, categories = [] }: CategoryNavProps) {
    // 1. Identify main categories (those whose parent is named "Shop" or has slug "shop")
    // Or simpler: those that have subcategories or are meant to be in root.
    // Based on bootstrap: Kitesurf, Wing & Foil, Accessories, Wetsuits are level 1.

    const shopCat = categories.find(c => c.slug === 'shop');
    const rootCategories = categories.filter(c => c.parent?.documentId === shopCat?.documentId);

    const navigation = rootCategories.map(cat => {
        const isCollections = cat.slug === 'collections';
        const t = dictionary[lang as keyof typeof dictionary]?.nav || dictionary['es'].nav;

        // If it's "Collections", we might want to name it "Deals" or "Ofertas"
        const displayName = isCollections ? t.deals : cat.name;

        return {
            name: displayName,
            href: `/${lang}/category/${cat.slug}`,
            highlight: isCollections,
            subcategories: categories
                .filter(sub => sub.parent?.documentId === cat.documentId)
                .map(sub => ({
                    name: sub.name,
                    href: `/${lang}/category/${sub.slug}`
                }))
        };
    });

    return (
        <div className="hidden md:block w-full bg-[#0051B5] border-t border-white/5 relative z-40 shadow-sm">
            <div className="max-w-[1440px] mx-auto px-4">
                <ul className="flex items-center justify-center gap-0">
                    {navigation.map((item) => (
                        <li key={item.name} className="relative group">
                            {item.subcategories ? (
                                <>
                                    <button
                                        className="flex items-center gap-1.5 h-8 px-5 text-white font-bold tracking-widest text-[10px] hover:bg-white/10 transition-colors uppercase"
                                    >
                                        {item.name}
                                        <ChevronDown size={10} className="opacity-50 group-hover:rotate-180 transition-transform" />
                                    </button>

                                    {/* Submenu on Hover */}
                                    <div className="absolute left-0 top-full hidden group-hover:flex flex-col bg-[#0051B5] border-t border-white/10 shadow-2xl min-w-[200px] py-1">
                                        {item.subcategories.map((sub) => (
                                            <a
                                                key={sub.name}
                                                href={sub.href}
                                                className="px-5 py-2.5 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors whitespace-nowrap"
                                            >
                                                {sub.name}
                                            </a>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <a
                                    href={item.href}
                                    className={`flex items-center h-8 px-5 font-bold tracking-widest text-[10px] transition-colors uppercase ${(item as any).highlight
                                        ? 'text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white'
                                        : 'text-white hover:bg-white/10'
                                        }`}
                                >
                                    {item.name}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
