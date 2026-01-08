'use client';

import Link from 'next/link';
import { dictionary } from './db';
import { Facebook, Instagram, Youtube, MapPin, Mail, Phone, ArrowUp } from 'lucide-react';

interface FooterProps {
    lang: string;
}

export default function Footer({ lang }: FooterProps) {
    const t = dictionary[lang as keyof typeof dictionary]?.footer || dictionary['es'].footer;
    const year = new Date().getFullYear();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                            El Médano, Tenerife. Tienda y escuela de Kitesurf y Wingfoil. Las mejores marcas y el mejor servicio.
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

                    {/* Products Column */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">{t.products.title}</h3>
                        <ul className="space-y-3 text-sm text-white/70">
                            <li><Link href={`/${lang}/category/kitesurf/cometas`} className="hover:text-[var(--color-accent)] transition-colors">{t.products.cometas}</Link></li>
                            <li><Link href={`/${lang}/category/kitesurf/tablas`} className="hover:text-[var(--color-accent)] transition-colors">{t.products.tablas}</Link></li>
                            <li><Link href={`/${lang}/category/wingfoil`} className="hover:text-[var(--color-accent)] transition-colors">{t.products.wingfoil}</Link></li>
                            <li><Link href={`/${lang}/category/accesorios`} className="hover:text-[var(--color-accent)] transition-colors">{t.products.accesorios}</Link></li>
                            <li><Link href={`/${lang}/category/outlet`} className="hover:text-[var(--color-accent)] transition-colors">{t.products.outlet}</Link></li>
                            <li><Link href={`/${lang}/category/used`} className="hover:text-[var(--color-accent)] transition-colors">{t.products.usado}</Link></li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">{t.company.title}</h3>
                        <ul className="space-y-3 text-sm text-white/70">
                            <li><Link href={`/${lang}/contact`} className="hover:text-[var(--color-accent)] transition-colors">{t.company.contact}</Link></li>
                            <li><Link href={`/${lang}/about`} className="hover:text-[var(--color-accent)] transition-colors">{t.company.about}</Link></li>
                            <li><Link href={`/${lang}/legal`} className="hover:text-[var(--color-accent)] transition-colors">{t.company.legal}</Link></li>
                            <li><Link href={`/${lang}/cookies`} className="hover:text-[var(--color-accent)] transition-colors">{t.company.cookies}</Link></li>
                            <li><Link href={`/${lang}/payment-methods`} className="hover:text-[var(--color-accent)] transition-colors">{t.company.payment}</Link></li>
                            <li><Link href={`/${lang}/refunds`} className="hover:text-[var(--color-accent)] transition-colors">{t.company.refunds}</Link></li>
                        </ul>
                    </div>

                    {/* Account Column */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">{t.account.title}</h3>
                        <ul className="space-y-3 text-sm text-white/70">
                            <li><Link href={`/${lang}/account`} className="hover:text-[var(--color-accent)] transition-colors">{t.account.account}</Link></li>
                            <li><Link href={`/${lang}/account/orders`} className="hover:text-[var(--color-accent)] transition-colors">{t.account.orders}</Link></li>
                            <li><Link href={`/${lang}/account/addresses`} className="hover:text-[var(--color-accent)] transition-colors">{t.account.addresses}</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
                    <p>{t.copyright.replace('2024', year.toString())}</p>

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
