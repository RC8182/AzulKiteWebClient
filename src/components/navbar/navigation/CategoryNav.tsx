'use client';

import { ChevronDown } from 'lucide-react';
import { dictionary } from '../db';

interface CategoryNavProps {
    lang: string;
}

export default function CategoryNav({ lang }: CategoryNavProps) {
    const t = dictionary[lang as keyof typeof dictionary]?.nav || dictionary['es'].nav;

    const navigation = [
        {
            name: t.kitesurf.name,
            href: `/${lang}/category/kitesurf`,
            subcategories: [
                { name: t.kitesurf.subs.cometas, href: `/${lang}/category/kitesurf/cometas` },
                { name: t.kitesurf.subs.tablas, href: `/${lang}/category/kitesurf/tablas` },
                { name: t.kitesurf.subs.accesorios, href: `/${lang}/category/kitesurf/accesorios` },
                { name: t.kitesurf.subs.outlet, href: `/${lang}/category/kitesurf/outlet` },
            ]
        },
        {
            name: t.wingfoil.name,
            href: `/${lang}/category/wing-foil`,
            subcategories: [
                { name: t.wingfoil.subs.hydrofoil, href: `/${lang}/category/wing-foil/hydrofoil` },
                { name: t.wingfoil.subs.alas, href: `/${lang}/category/wing-foil/alas` },
                { name: t.wingfoil.subs.tablas, href: `/${lang}/category/wing-foil/tablas` },
                { name: t.wingfoil.subs.componentes, href: `/${lang}/category/wing-foil/componentes` },
            ]
        },
        {
            name: t.accesorios.name,
            href: `/${lang}/category/accesorios`,
            subcategories: [
                { name: t.accesorios.subs.todos, href: `/${lang}/category/accesorios` },
                { name: t.accesorios.subs.nueva, href: `/${lang}/category/accesorios/nueva-temporada` },
                { name: t.accesorios.subs.outlet, href: `/${lang}/category/accesorios/outlet` },
                { name: t.accesorios.subs.usado, href: `/${lang}/category/accesorios/usado` },
            ]
        },
        {
            name: t.deals,
            href: `/${lang}/sale`,
            highlight: true
        }
    ];

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
                                    className={`flex items-center h-8 px-5 font-bold tracking-widest text-[10px] transition-colors uppercase ${item.highlight
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
