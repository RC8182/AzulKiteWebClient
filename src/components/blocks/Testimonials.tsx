import React from 'react';
import Image from 'next/image';

interface Testimonial {
    name: string;
    role: string;
    text: string;
    avatar?: string;
}

interface TestimonialsProps {
    testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
    if (!testimonials || testimonials.length === 0) return null;

    return (
        <section className="py-16 bg-[#0051B5] text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center md:text-left">
                <h2 className="text-2xl md:text-4xl font-black text-center mb-10 md:mb-12 uppercase italic tracking-tighter">
                    Lo que dicen de nosotros
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left">
                    {testimonials.map((t, idx) => (
                        <div key={idx} className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/20 shadow-xl hover:bg-white/15 transition-colors">
                            <p className="italic mb-6 text-base md:text-lg leading-relaxed">"{t.text}"</p>
                            <div className="flex items-center gap-4">
                                {t.avatar && (
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 relative shadow-inner">
                                        <Image
                                            src={t.avatar}
                                            alt={t.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold">{t.name}</p>
                                    <p className="text-xs opacity-60 uppercase tracking-widest">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
