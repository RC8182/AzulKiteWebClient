'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { getStrapiMedia } from '@/lib/strapi';

interface Banner {
    id: number;
    title: string;
    image: {
        url: string;
    };
    links?: {
        href: string;
        label: string;
    }[];
    columns: number;
}

interface BannerGridProps {
    banners: Banner[];
    gridCols?: number;
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default function BannerGrid({ banners = [], gridCols = 2 }: BannerGridProps) {
    if (!banners || banners.length === 0) return null;

    return (
        <section className="container mx-auto px-6 py-12">
            <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-6`}>
                {banners.map((banner, index) => (
                    <motion.div
                        key={banner.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative group overflow-hidden rounded-2xl aspect-[16/9] ${banner.columns > 1 ? `md:col-span-${banner.columns}` : ''
                            }`}
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url(${getStrapiMedia(banner.image?.url)})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                            <motion.h3
                                className="text-2xl md:text-3xl font-bold text-white mb-4 translate-y-2 group-hover:translate-y-0 transition-transform"
                            >
                                {banner.title}
                            </motion.h3>

                            {/* Multiple Links (New) */}
                            {banner.links && banner.links.length > 0 && (
                                <div className="flex flex-wrap gap-3 mt-4">
                                    {banner.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.href}
                                            className="bg-black/30 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
