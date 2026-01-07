'use client'
import { Button } from '@heroui/react';
import { getStrapiMedia } from '@/lib/strapi';
import NextImage from 'next/image';

interface HeroSectionProps {
    title: string;
    subtitle?: string;
    backgroundImage: any;
    cta?: {
        label: string;
        href: string;
        color?: "primary" | "secondary" | "danger" | "success" | "warning" | "default";
    };
}

export default function HeroSection({ title, subtitle, backgroundImage, cta }: HeroSectionProps) {
    const imageUrl = getStrapiMedia(backgroundImage?.url);

    return (
        <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden bg-gray-900">
            {imageUrl && (
                <div className="absolute inset-0 z-0">
                    <NextImage
                        src={imageUrl}
                        alt={title}
                        fill
                        priority
                        className="object-cover"
                    />
                </div>
            )}
            <div className="absolute inset-0 bg-black/50 z-10" />

            <div className="relative z-20 text-center px-4 max-w-4xl">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-md">
                        {subtitle}
                    </p>
                )}
                {cta && (
                    <Button
                        as="a"
                        href={cta.href}
                        color={cta.color === "primary" ? "accent" as any : cta.color} // Override for Naranja CTA
                        className={cta.color === "primary" ? "bg-[var(--color-accent)] text-white font-bold px-8 py-6 text-lg" : ""}
                        size="lg"
                        radius="full"
                    >
                        {cta.label}
                    </Button>
                )}
            </div>
        </section>
    );
}
