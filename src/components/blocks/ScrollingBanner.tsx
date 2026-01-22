'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { getStrapiMedia } from '@/lib/strapi';
import Image from 'next/image';
import Link from 'next/link';

interface ScrollingItem {
    id: number;
    text?: string;
    image?: {
        data?: {
            attributes?: {
                url: string;
            };
        };
        url?: string;
    };
    link?: string;
}

interface ScrollingBannerProps {
    items: ScrollingItem[];
    speed?: number;
    pauseOnHover?: boolean;
    backgroundColor?: string;
    textColor?: string;
    invertLogos?: boolean;
}

export default function ScrollingBanner({
    items = [],
    speed = 30,
    pauseOnHover = true,
    backgroundColor = 'var(--color-primary)',
    textColor = '#ffffff',
    invertLogos = true
}: ScrollingBannerProps) {
    if (!items || items.length === 0) return null;

    console.log('[ScrollingBanner] Items:', JSON.stringify(items.map(it => ({ id: it.id, hasImage: !!it.image, imageUrl: (it.image as any)?.url || (it.image as any)?.data?.attributes?.url })), null, 2));

    // Duplicate items to ensure smooth infinite scroll - use enough to fill the width
    const displayItems = [...items, ...items, ...items, ...items];

    return (
        <section
            className="py-4 overflow-hidden relative border-y border-white/5"
            style={{ backgroundColor }}
        >
            <motion.div
                className="flex whitespace-nowrap gap-12 md:gap-24 items-center"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                    duration: speed,
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                {displayItems.map((item: any, index) => {
                    const imgData = item.image?.data || item.image;
                    const rawUrl = imgData?.attributes?.url || imgData?.url;
                    const imageUrl = getStrapiMedia(rawUrl);

                    if (index === 0) {
                        console.log('[ScrollingBanner] First Item Debug:', {
                            id: item.id,
                            rawUrl,
                            imageUrl,
                            hasImage: !!item.image
                        });
                    }

                    const itemContent = (
                        <div key={`${item.id}-${index}`} className="flex items-center gap-4 shrink-0 px-4">
                            {imageUrl ? (
                                <div className="relative h-8 md:h-10 w-24 md:w-32 transition-opacity">
                                    <Image
                                        src={imageUrl}
                                        alt={item.text || "Brand logo"}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            ) : (
                                <span className="text-white/20 text-[10px] italic">Logo {item.id} missing</span>
                            )}
                            {item.text && (
                                <span
                                    className="text-xs md:text-sm font-black uppercase tracking-widest italic"
                                    style={{ color: textColor }}
                                >
                                    {item.text}
                                </span>
                            )}
                        </div>
                    );

                    if (item.link) {
                        return (
                            <Link
                                key={`${item.id}-${index}`}
                                href={item.link}
                                className="hover:scale-105 transition-transform"
                            >
                                {itemContent}
                            </Link>
                        );
                    }

                    return itemContent;
                })}
            </motion.div>
        </section>
    );
}
