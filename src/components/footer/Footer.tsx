'use client';

import Link from 'next/link';
import { dictionary } from './db';
import { Facebook, Instagram, Youtube, MapPin, Mail, Phone, ArrowUp } from 'lucide-react';

interface FooterProps {
    lang: string;
    customDescription?: string;
}

export default function Footer({ lang, customDescription }: FooterProps) {
    const t = dictionary[lang as keyof typeof dictionary]?.footer || dictionary['es'].footer;
    const year = new Date().getFullYear();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Links usando traducciones del diccionario y slugs en inglés
    const footerLinks = {
        empresa: [
            { label: t.company.contact, href: '/contact' },
            { label: t.company.about, href: '/about' },
            { label: t.company.legal, href: '/legal' },
            { label: t.company.cookies, href: '/cookies' },
            { label: t.company.payment, href: '/payment' },
            { label: t.company.refunds, href: '/return-policy' }
        ],
        legal: [
            { label: t.legal.terms, href: '/terms' },
            { label: t.legal.privacy, href: '/privacy' }
        ],
        shop: [
            { label: t.products.shop, href: '/shop' },
            { label: t.products.outlet, href: '/shop?category=outlet' },
            { label: t.products.newSeason, href: '/shop?category=new-season' }
        ]
    };

    return (
        <footer className="bg-black text-white pt-16 pb-8 border-t border-white/10">
            <div className="max-w-[1440px] mx-auto px-4 md:px-8">

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand & Info */}
                    <div className="space-y-6">
                        <Link href={`/${lang}`} className="block">
                            <h2 className="text-2xl font-black tracking-tight italic">
                                AZUL<span className="text-[var(--color-accent)]">KITEBOARDING</span>
                            </h2>
                        </Link>
                        <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                            {customDescription || t.description}
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors">
                                <Facebook size={20} />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors">
                                <Youtube size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Shop Column */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">{t.products.title}</h3>
                        <ul className="space-y-3 text-sm text-white/70">
                            {footerLinks.shop.map((link) => (
                                <li key={link.href}>
                                    <Link 
                                        href={`/${lang}${link.href}`} 
                                        className="hover:text-[var(--color-accent)] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Empresa Column */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">{t.company.title}</h3>
                        <ul className="space-y-3 text-sm text-white/70">
                            {footerLinks.empresa.map((link) => (
                                <li key={link.href}>
                                    <Link 
                                        href={`/${lang}${link.href}`} 
                                        className="hover:text-[var(--color-accent)] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">{t.legal.title}</h3>
                        <ul className="space-y-3 text-sm text-white/70">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link 
                                        href={`/${lang}${link.href}`} 
                                        className="hover:text-[var(--color-accent)] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
                    <p>{customDescription || `© ${year} Azul Kiteboarding. Todos los derechos reservados.`}</p>

                    <button
                        onClick={scrollToTop}
                        className="flex items-center gap-2 hover:text-white transition-colors group"
                    >
                        Scroll Top
                        <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                            <ArrowUp size={16} />
                        </div>
                    </button>
                </div>
            </div>
        </footer>
    );
}
