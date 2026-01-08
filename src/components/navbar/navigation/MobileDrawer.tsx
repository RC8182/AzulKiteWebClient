'use client';

import { ChevronLeft, Wind, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { dictionary } from '../db';

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    lang: string;
}

export default function MobileDrawer({ isOpen, onClose, lang }: MobileDrawerProps) {
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    // Get translations
    const t = dictionary[lang as keyof typeof dictionary] || dictionary['es'];
    const nav = t.nav;
    const md = t.mobileDrawer;

    // Construct localized navigation
    const navigation = [
        {
            name: nav.kitesurf.name,
            href: `/${lang}/category/kitesurf`,
            subcategories: [
                { name: nav.kitesurf.subs.cometas, href: `/${lang}/category/kitesurf/cometas` },
                { name: nav.kitesurf.subs.tablas, href: `/${lang}/category/kitesurf/tablas` },
                { name: nav.kitesurf.subs.accesorios, href: `/${lang}/category/kitesurf/accesorios` },
                { name: nav.kitesurf.subs.outlet, href: `/${lang}/category/kitesurf/outlet` },
            ]
        },
        {
            name: nav.wingfoil.name,
            href: `/${lang}/category/wing-foil`,
            subcategories: [
                { name: nav.wingfoil.subs.hydrofoil, href: `/${lang}/category/wing-foil/hydrofoil` },
                { name: nav.wingfoil.subs.alas, href: `/${lang}/category/wing-foil/alas` },
                { name: nav.wingfoil.subs.tablas, href: `/${lang}/category/wing-foil/tablas` },
                { name: nav.wingfoil.subs.componentes, href: `/${lang}/category/wing-foil/componentes` },
            ]
        },
        {
            name: nav.accesorios.name,
            href: `/${lang}/category/accesorios`,
            subcategories: [
                { name: nav.accesorios.subs.todos, href: `/${lang}/category/accesorios` },
                { name: nav.accesorios.subs.nueva, href: `/${lang}/category/accesorios/nueva-temporada` },
                { name: nav.accesorios.subs.outlet, href: `/${lang}/category/accesorios/outlet` },
                { name: nav.accesorios.subs.usado, href: `/${lang}/category/accesorios/usado` },
            ]
        },
        {
            name: nav.deals,
            href: `/${lang}/sale`,
            highlight: true
        }
    ];

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
                        {md.close}
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
                                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest leading-none">{t.topBar.wind} {t.topBar.location}</span>
                                <span className="text-[#0051B5] font-black italic text-base leading-tight uppercase">23 KTS</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-2">
                            <a href={`/${lang}/blog`} className="text-gray-400 font-bold tracking-widest text-[10px] uppercase hover:text-[#0051B5]" onClick={onClose}>{md.blog}</a>
                            <a href={`/${lang}/help`} className="text-gray-400 font-bold tracking-widest text-[10px] uppercase hover:text-[#0051B5]" onClick={onClose}>{md.help}</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
