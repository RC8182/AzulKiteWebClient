'use client';

import { getStrapiMedia } from '@/lib/media-utils';
import { useParams, useRouter } from 'next/navigation';

interface Banner {
    id: number;
    title: string;
    image: {
        url: string;
    };
    mainLink?: {
        href: string;
        label: string;
        isExternal?: boolean;
    };
    links?: {
        href: string;
        label: string;
        isExternal?: boolean;
    }[];
    columns: number;
}

interface BannerGridProps {
    banners: Banner[];
    gridCols?: number;
}

export default function BannerGrid({ banners = [], gridCols = 2 }: BannerGridProps) {
    const { lang } = useParams();
    const router = useRouter();

    if (!banners || banners.length === 0) return null;

    const getFullHref = (href: string) => {
        if (href.startsWith('http')) return href;
        return `/${lang}${href.startsWith('/') ? '' : '/'}${href}`;
    };

    const handleBannerClick = (href: string, isExternal?: boolean, event?: React.MouseEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const fullHref = getFullHref(href);
        console.log('Navigating to:', fullHref, isExternal ? '(External)' : '(Internal)');

        if (isExternal) {
            window.open(fullHref, '_blank');
        } else {
            router.push(fullHref);
        }
    };

    return (
        <section className="container mx-auto px-6 py-12">
            <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-6`}>
                {banners.map((banner) => (
                    <div
                        key={banner.id}
                        onClick={(e) => banner.mainLink && handleBannerClick(banner.mainLink.href, banner.mainLink.isExternal, e)}
                        className={`relative group overflow-hidden rounded-lg aspect-[16/9] ${banner.mainLink ? 'cursor-pointer' : ''
                            } ${banner.columns > 1 ? `md:col-span-${banner.columns}` : ''}`}
                    >
                        {/* Background Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url(${getStrapiMedia(banner.image?.url)})` }}
                        />

                        {/* Overlay Content */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 z-10">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 translate-y-2 group-hover:translate-y-0 transition-transform group-hover:underline">
                                {banner.title}
                            </h3>

                            {/* Multiple Links (New) */}
                            {banner.links && banner.links.length > 0 && (
                                <div className="flex flex-wrap gap-3 mt-4">
                                    {banner.links.map((link, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => handleBannerClick(link.href, link.isExternal, e)}
                                            className="bg-black/30 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all z-20"
                                        >
                                            {link.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

