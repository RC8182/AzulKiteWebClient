'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const navigation = [
    {
        name: 'KITESURF',
        href: '/category/kitesurf',
        subcategories: [
            { name: 'Cometas', href: '/category/kitesurf/cometas' },
            { name: 'Tablas', href: '/category/kitesurf/tablas' },
            { name: 'Accesorios Kite', href: '/category/kitesurf/accesorios' },
            { name: 'Outlet Kite', href: '/category/kitesurf/outlet' },
        ]
    },
    {
        name: 'WING & FOIL',
        href: '/category/wing-foil',
        subcategories: [
            { name: 'Hydrofoil', href: '/category/wing-foil/hydrofoil' },
            { name: 'Alas (Wings)', href: '/category/wing-foil/alas' },
            { name: 'Tablas (Wing)', href: '/category/wing-foil/tablas' },
            { name: 'Componentes', href: '/category/wing-foil/componentes' },
        ]
    },
    {
        name: 'ACCESORIOS',
        href: '/category/accesorios',
        subcategories: [
            { name: 'Todos los Accesorios', href: '/category/accesorios' },
            { name: 'Nueva Temporada', href: '/category/accesorios/nueva-temporada' },
            { name: 'Outlet', href: '/category/accesorios/outlet' },
            { name: 'Usado & Test', href: '/category/accesorios/usado' },
        ]
    },
    {
        name: 'HOT DEALS',
        href: '/sale',
        highlight: true
    }
];

export default function CategoryNav() {
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
