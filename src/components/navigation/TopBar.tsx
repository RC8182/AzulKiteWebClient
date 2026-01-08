'use client';

import { Truck, Wind, ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function TopBar() {
    const [windSpeed, setWindSpeed] = useState<number | null>(null);
    const [lang, setLang] = useState('ES');
    const [isLangOpen, setIsLangOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Simulation of live wind data fetching
    useEffect(() => {
        const fetchWind = () => {
            const mockSpeed = Math.floor(Math.random() * (25 - 15 + 1)) + 15;
            setWindSpeed(mockSpeed);
        };

        fetchWind();
        const interval = setInterval(fetchWind, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const bannerText = "PRECIOS SIN IVA | TRANSPORTE E IMPUESTOS INCLUIDOS";

    return (
        <div className="w-full bg-[#003B95] text-white py-1 overflow-hidden border-b border-white/5 relative z-[60]">
            <div className="max-w-[1440px] mx-auto px-4 flex items-center justify-between gap-4">

                {/* Left: Live Wind */}
                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 whitespace-nowrap shrink-0">
                    <Wind size={12} className="text-[var(--color-accent)] animate-pulse" />
                    <span className="uppercase tracking-tighter text-[9px] hidden sm:inline opacity-70">Viento:</span>
                    <span className="font-bold text-[9px] md:text-[10px]">El Médano</span>
                    <span className="text-[var(--color-accent)] font-black text-[10px] md:text-[11px]">
                        {windSpeed !== null ? `${windSpeed} kts` : '-- kts'}
                    </span>
                </div>

                {/* Center: Scrolling Banner */}
                <div className="flex-1 overflow-hidden relative h-4 flex items-center justify-center max-w-[350px] mx-auto">
                    <motion.div
                        className="flex whitespace-nowrap gap-16 items-center"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold tracking-tight opacity-90">
                                <Truck size={12} className="text-[var(--color-accent)] shrink-0" />
                                <span>{bannerText}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Right: Lang Selector (Custom Native Menu) */}
                <div className="relative shrink-0" ref={dropdownRef}>
                    <button
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-white/10 transition-colors uppercase font-bold text-[10px] tracking-widest"
                    >
                        {lang}
                        <ChevronDown size={10} className={`opacity-60 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isLangOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-[#003B95] border border-white/10 shadow-xl min-w-[70px] flex flex-col py-1 overflow-hidden">
                            {['ES', 'EN', 'IT'].map((l) => (
                                <button
                                    key={l}
                                    onClick={() => {
                                        setLang(l);
                                        setIsLangOpen(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-[10px] font-bold hover:bg-white/10 transition-colors ${lang === l ? 'text-[var(--color-accent)]' : 'text-white'}`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
