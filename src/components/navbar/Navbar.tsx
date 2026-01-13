'use client';

import { useState, useEffect } from 'react';
import TopBar from './navigation/TopBar';
import MainHeader from './navigation/MainHeader';
import CategoryNav from './navigation/CategoryNav';
import MobileDrawer from './navigation/MobileDrawer';
import CartDrawer from '../cart/CartDrawer';

interface NavbarProps {
    lang: string;
    categories: any[];
}

export default function Navbar({ lang, categories }: NavbarProps) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <TopBar lang={lang} />
            <MainHeader
                lang={lang}
                onOpenMenu={() => setIsMenuOpen(true)}
                onOpenCart={() => setIsCartOpen(true)}
            />
            <CategoryNav lang={lang} categories={categories} />

            {/* Drawers (Native Implementation) */}
            <MobileDrawer lang={lang} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <CartDrawer lang={lang} isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
