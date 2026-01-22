'use client';

import { motion } from 'framer-motion';
import { getStrapiMedia } from '@/lib/strapi';
import Link from 'next/link';
import NextImage from 'next/image';

interface HeroSectionProps {
    title?: string;
    subtitle?: string;
    backgroundImage?: {
        url: string;
        alternativeText?: string;
    };
    cta?: {
        href: string;
        label: string;
    };
}

export default function HeroSection({
    title,
    subtitle,
    backgroundImage,
    cta
}: HeroSectionProps) {
    const imageUrl = getStrapiMedia(backgroundImage?.url || null) || "https://placehold.co/1920x1080?text=Kiteboarding";
    const imageAlt = backgroundImage?.alternativeText || title || "Hero Image";

    return (
        <section className="relative aspect-[16/9] flex items-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <NextImage
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/30 md:bg-black/40" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl text-white"
                >
                    <h1 className="text-3xl md:text-7xl font-extrabold mb-4 md:mb-6 leading-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-base md:text-2xl mb-6 md:mb-10 opacity-90 leading-relaxed font-light">
                            {subtitle}
                        </p>
                    )}

                    {cta && (
                        <Link
                            href={cta.href}
                            className="inline-block px-10 py-4 bg-[#FF6600] text-white font-bold rounded-full text-lg shadow-2xl hover:bg-[#e65c00] transform transition-all hover:scale-105"
                        >
                            {cta.label}
                        </Link>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
