'use client';

import { useState, useEffect } from 'react';
import TopBar from './navigation/TopBar';
import MainHeader from './navigation/MainHeader';
import CategoryNav from './navigation/CategoryNav';
import MobileDrawer from './navigation/MobileDrawer';
import CartDrawer from './cart/CartDrawer';

export default function Navbar() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            <TopBar />
            <MainHeader
                onOpenMenu={() => setIsMenuOpen(true)}
                onOpenCart={() => setIsCartOpen(true)}
            />
            <CategoryNav />

            {/* Drawers (Native Implementation) */}
            <MobileDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
