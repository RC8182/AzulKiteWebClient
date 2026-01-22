'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getStrapiMedia } from '@/lib/strapi';

interface Slide {
    id: number;
    title: string;
    description?: string; // Strapi uses description, component uses subtitle
    backgroundImage: {
        url: string;
        data?: {
            attributes?: {
                url: string;
            }
        }
    };
    buttons: Array<{
        id: number;
        label: string;
        link: string; // Strapi uses link, component uses href
        variant: string; // Strapi uses variant, component uses color
    }>;
    textPosition?: 'left' | 'center' | 'right';
}

interface HeroSliderProps {
    slides: Slide[];
    autoplay?: boolean;
    interval?: number;
}

export default function HeroSlider({
    slides = [],
    autoplay = true,
    interval = 5000
}: HeroSliderProps) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!autoplay || slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, interval);
        return () => clearInterval(timer);
    }, [autoplay, interval, slides.length]);

    if (!slides || slides.length === 0) return null;

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <section className="relative w-full overflow-hidden bg-gray-900 aspect-[16/9]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                >
                    {/* Background Image Optimized */}
                    <div className="absolute inset-0 z-0">
                        {(() => {
                            const slide = slides[current];
                            const imgData = slide.backgroundImage?.data || slide.backgroundImage;
                            const rawUrl = (imgData as any)?.attributes?.url || (imgData as any)?.url;
                            const imageUrl = getStrapiMedia(rawUrl);

                            if (!imageUrl || !slide) return <div className="absolute inset-0 bg-gray-800" />;

                            return (
                                <Image
                                    src={imageUrl}
                                    alt={slide?.title || "Hero Slide"}
                                    fill
                                    priority={current === 0}
                                    className="object-cover transition-transform duration-10000 scale-105"
                                    sizes="100vw"
                                />
                            );
                        })()}
                        <div className="absolute inset-0 bg-black/20 dark:bg-black/40 z-10" />
                    </div>

                    {/* Content */}
                    <div className={`relative h-full container mx-auto px-6 flex items-center z-20 ${slides[current].textPosition === 'left' ? 'justify-start' :
                        slides[current].textPosition === 'right' ? 'justify-end' : 'justify-center'
                        }`}>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className={`max-w-2xl text-white ${slides[current].textPosition === 'center' ? 'text-center' : 'text-left'
                                }`}
                        >
                            <h1 className="text-3xl md:text-7xl font-bold mb-4 md:mb-6 leading-tight drop-shadow-lg uppercase tracking-tighter italic">
                                {slides[current].title}
                            </h1>
                            <p className="text-base md:text-xl mb-6 md:mb-8 opacity-90 drop-shadow-md font-medium">
                                {(slides[current] as any).description || (slides[current] as any).subtitle}
                            </p>
                            <div className={`flex flex-wrap gap-4 ${slides[current].textPosition === 'center' ? 'justify-center' : 'justify-start'
                                }`}>
                                {slides[current].buttons?.map((btn) => (
                                    <Link
                                        key={btn.id}
                                        href={btn.link || '#'}
                                        className={`px-8 py-3 rounded-none font-black uppercase text-xs tracking-widest transition-all transform hover:scale-105 ${btn.variant === 'primary'
                                            ? 'bg-[#FF6600] border-2 border-[#FF6600] text-white shadow-[0_10px_20px_rgba(255,102,0,0.3)]'
                                            : 'bg-white border-2 border-white text-[#003366] shadow-lg'
                                            }`}
                                    >
                                        {btn.label}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            {/* {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all z-10"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all z-10"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button> */}

            {/* Indicators */}
            {/* <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`w-3 h-3 rounded-full transition-all ${i === current ? 'bg-blue-600 w-8' : 'bg-white/50 hover:bg-white'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )} */}
        </section>
    );
}
