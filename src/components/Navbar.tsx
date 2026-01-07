'use client';

import {
    Navbar as HeroNavbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Link,
    Button,
    Badge,
    useDisclosure,
} from '@heroui/react';
import { ShoppingBag, Search } from 'lucide-react';
import { useCart } from '@/store/useCart';
import CartDrawer from './cart/CartDrawer';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const getTotalItems = useCart((state) => state.getTotalItems);
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const totalItems = mounted ? getTotalItems() : 0;

    return (
        <>
            <HeroNavbar maxWidth="xl" className="border-b border-gray-100 py-2">
                <NavbarBrand>
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-xl italic uppercase">A</span>
                        </div>
                        <p className="font-black text-2xl tracking-tighter text-[var(--color-primary)] uppercase">
                            Azul<span className="text-[var(--color-accent)]">Kite</span>
                        </p>
                    </Link>
                </NavbarBrand>

                <NavbarContent className="hidden sm:flex gap-8" justify="center">
                    <NavbarItem>
                        <Link color="foreground" href="/tienda" className="font-bold uppercase tracking-widest text-sm hover:text-[var(--color-primary)] transition-colors">
                            Tienda
                        </Link>
                    </NavbarItem>
                    <NavbarItem>
                        <Link color="foreground" href="/clases" className="font-bold uppercase tracking-widest text-sm hover:text-[var(--color-primary)] transition-colors">
                            Clases
                        </Link>
                    </NavbarItem>
                    <NavbarItem>
                        <Link color="foreground" href="/blog" className="font-bold uppercase tracking-widest text-sm hover:text-[var(--color-primary)] transition-colors">
                            Blog
                        </Link>
                    </NavbarItem>
                </NavbarContent>

                <NavbarContent justify="end" className="gap-2">
                    <NavbarItem className="hidden sm:flex">
                        <Button isIconOnly variant="light" radius="full">
                            <Search size={20} className="text-gray-500" />
                        </Button>
                    </NavbarItem>
                    <NavbarItem>
                        <Badge
                            content={totalItems}
                            color="danger"
                            isInvisible={totalItems === 0}
                            shape="circle"
                            size="sm"
                        >
                            <Button
                                isIconOnly
                                variant="flat"
                                radius="full"
                                onPress={onOpen}
                                className="bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <ShoppingBag size={20} className="text-[var(--color-primary)]" />
                            </Button>
                        </Badge>
                    </NavbarItem>
                </NavbarContent>
            </HeroNavbar>

            <CartDrawer isOpen={isOpen} onOpenChange={onOpenChange} />
        </>
    );
}
