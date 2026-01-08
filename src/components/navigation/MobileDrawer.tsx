'use client';

import { ChevronRight, ChevronLeft, Wind, Plus, Minus, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

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

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    // Disable body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const toggleMenu = (name: string) => {
        setOpenMenus(prev =>
            prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Drawer Content */}
            <div className={`relative w-[280px] h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 py-2 px-6 h-14 bg-[#0051B5] shrink-0">
                    <span className="text-white font-black italic tracking-tighter text-lg leading-none uppercase">Azul Kite</span>
                    <button
                        onClick={onClose}
                        className="text-white font-bold text-xs flex items-center gap-1 min-w-0 px-2 h-8"
                    >
                        <ChevronLeft size={16} />
                        CERRAR
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto bg-white">
                    <div className="flex flex-col w-full">
                        {navigation.map((item) => (
                            <div key={item.name} className="flex flex-col border-b border-gray-100 w-full">
                                <div className="flex items-center justify-between w-full">
                                    <a
                                        href={item.href}
                                        className={`flex-1 py-4 px-6 font-black text-[13px] tracking-[0.1em] ${item.highlight ? 'text-[var(--color-accent)]' : 'text-[#0051B5]'
                                            }`}
                                        onClick={(e) => {
                                            if (item.subcategories) {
                                                e.preventDefault();
                                                toggleMenu(item.name);
                                            } else {
                                                onClose();
                                            }
                                        }}
                                    >
                                        {item.name}
                                    </a>
                                    {item.subcategories && (
                                        <button
                                            onClick={() => toggleMenu(item.name)}
                                            className="px-6 py-4 text-gray-300 hover:text-[#0051B5]"
                                        >
                                            {openMenus.includes(item.name) ? <Minus size={18} /> : <Plus size={18} />}
                                        </button>
                                    )}
                                </div>

                                {item.subcategories && openMenus.includes(item.name) && (
                                    <div className="bg-gray-50 flex flex-col w-full border-t border-gray-100">
                                        {item.subcategories.map((sub) => (
                                            <a
                                                key={sub.name}
                                                href={sub.href}
                                                className="py-3.5 px-10 text-gray-600 font-bold text-[11px] uppercase tracking-widest border-b border-white last:border-0"
                                                onClick={onClose}
                                            >
                                                {sub.name}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Wind Widget in Menu */}
                    <div className="mt-6 p-6 flex flex-col gap-6 w-full">
                        <div className="flex items-center gap-3 border-l-4 border-[var(--color-accent)] pl-4 py-3 bg-gray-50 rounded-r-lg">
                            <Wind size={20} className="text-[var(--color-accent)] shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest leading-none">Viento El Médano</span>
                                <span className="text-[#0051B5] font-black italic text-base leading-tight uppercase">23 KTS</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-2">
                            <a href="/blog" className="text-gray-400 font-bold tracking-widest text-[10px] uppercase hover:text-[#0051B5]" onClick={onClose}>BLOG DE AZULKITE</a>
                            <a href="/help" className="text-gray-400 font-bold tracking-widest text-[10px] uppercase hover:text-[#0051B5]" onClick={onClose}>Centro de Ayuda</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
