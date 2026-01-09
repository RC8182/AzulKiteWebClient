'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Slide {
    id: number;
    title: string;
    subtitle: string;
    backgroundImage: {
        url: string;
    };
    buttons: Array<{
        id: number;
        label: string;
        href: string;
        color: string;
    }>;
    textPosition: 'left' | 'center' | 'right';
}

interface HeroSliderProps {
    slides: Slide[];
    autoplay?: boolean;
    interval?: number;
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

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
        <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden bg-gray-900">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-10000 scale-105"
                        style={{
                            backgroundImage: `url(${STRAPI_URL}${slides[current].backgroundImage.url})`,
                        }}
                    >
                        <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
                    </div>

                    {/* Content */}
                    <div className={`relative h-full container mx-auto px-6 flex items-center ${slides[current].textPosition === 'left' ? 'justify-start' :
                            slides[current].textPosition === 'right' ? 'justify-end' : 'justify-center'
                        }`}>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className={`max-w-2xl text-white ${slides[current].textPosition === 'center' ? 'text-center' : 'text-left'
                                }`}
                        >
                            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
                                {slides[current].title}
                            </h1>
                            <p className="text-lg md:text-xl mb-8 opacity-90 drop-shadow-md">
                                {slides[current].subtitle}
                            </p>
                            <div className={`flex flex-wrap gap-4 ${slides[current].textPosition === 'center' ? 'justify-center' : 'justify-start'
                                }`}>
                                {slides[current].buttons?.map((btn) => (
                                    <Link
                                        key={btn.id}
                                        href={btn.href}
                                        className={`px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 ${btn.color === 'primary'
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                                                : 'bg-white hover:bg-gray-100 text-gray-900 shadow-lg'
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
            {slides.length > 1 && (
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
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
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
            )}
        </section>
    );
}
