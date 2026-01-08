'use client';

import { Search, User, ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useEffect, useState } from 'react';
import { dictionary } from '../db';

interface MainHeaderProps {
    onOpenMenu?: () => void;
    onOpenCart?: () => void;
    lang: string;
}

export default function MainHeader({ onOpenMenu, onOpenCart, lang }: MainHeaderProps) {
    const getTotalItems = useCart((state) => state.getTotalItems);
    const [mounted, setMounted] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const t = dictionary[lang as keyof typeof dictionary]?.header || dictionary['es'].header;

    useEffect(() => {
        setMounted(true);
    }, []);

    const totalItems = mounted ? getTotalItems() : 0;

    return (
        <div className="w-full bg-[#0051B5] text-white py-2 px-3 md:px-4 border-b border-white/5 sticky top-0 z-50 shadow-md">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2 md:gap-8 min-h-[44px]">

                {/* Mobile: Toggle between Logo/Menu and Search Input */}
                {!isSearchOpen ? (
                    <>
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
                    </>
                ) : (
                    <div className="flex md:hidden flex-1 items-center gap-2 px-1">
                        <div className="relative flex-1 flex items-center">
                            <Search size={18} className="absolute left-0 text-white opacity-70" />
                            <input
                                autoFocus
                                placeholder={t.searchPlaceholderMobile}
                                className="w-full bg-transparent border-b border-white outline-none py-1 pl-6 text-sm italic text-white placeholder:text-white/50"
                                onBlur={(e) => {
                                    if (!e.target.value) setIsSearchOpen(false);
                                }}
                            />
                            <button
                                onClick={() => setIsSearchOpen(false)}
                                className="absolute right-3 p-1"
                            >
                                <X size={18} className="text-white/70" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Desktop: Center Search */}
                <div className="hidden md:flex flex-1 max-w-[500px]">
                    <div className="relative w-full flex items-center">
                        <Search size={18} className="absolute left-0 text-white opacity-70" />
                        <input
                            placeholder={t.searchPlaceholderDesktop}
                            className="w-full bg-transparent border-b border-white outline-none py-1.5 pl-7 text-sm italic text-white placeholder:text-white/50 focus:border-white transition-colors"
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 md:gap-4 shrink-0">
                    <a href={`/${lang}/account`} className="flex flex-col items-center gap-0.5 text-white hover:opacity-80 p-1 group">
                        <User size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                        <span className="hidden md:block text-[9px] font-bold uppercase tracking-widest leading-none">{t.account}</span>
                    </a>

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
        </div>
    );
}
