import Link from 'next/link';
import Image from 'next/image';

interface BlockRendererProps {
    block: any;
    locale: string;
}

export default function BlockRenderer({ block, locale }: BlockRendererProps) {
    const config = block.config || {};
    const content = block.content || {};

    switch (block.type) {
        case 'hero':
            return (
                <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center text-white overflow-hidden">
                    {/* Background Image */}
                    {config.bgImage && (
                        <div className="absolute inset-0 z-0">
                            <Image
                                src={config.bgImage}
                                alt="Hero Background"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40" />
                        </div>
                    )}

                    {/* Content */}
                    <div className="relative z-10 container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                            {content.title}
                        </h1>
                        {content.subtitle && (
                            <p className="text-xl md:text-2xl mb-8 opacity-90 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
                                {content.subtitle}
                            </p>
                        )}
                        {content.buttonText && (
                            <Link
                                href={content.buttonLink || '/products'}
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-transform hover:scale-105 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300"
                            >
                                {content.buttonText}
                            </Link>
                        )}
                    </div>
                </section>
            );

        case 'rich-text':
            return (
                <section className="py-12 container mx-auto px-4">
                    <div
                        className="prose dark:prose-invert max-w-4xl mx-auto"
                        dangerouslySetInnerHTML={{ __html: content.html || '' }}
                    />
                </section>
            );

        case 'hero-slider':
            // TODO: Implement carousel with slides
            return (
                <section className="relative h-[70vh] bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-500">Hero Slider - En desarrollo</p>
                    </div>
                </section>
            );

        case 'banner-grid':
            // TODO: Implement banner grid
            return (
                <section className="py-12 container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">Banner Grid - En desarrollo</p>
                        </div>
                    </div>
                </section>
            );

        case 'product-grid':
            // TODO: Implement product grid
            return (
                <section className="py-12 container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">Product Grid - En desarrollo</p>
                        </div>
                    </div>
                </section>
            );

        case 'info-block':
            return (
                <section className="py-12 container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        {config.image && (
                            <div className="relative aspect-video rounded-lg overflow-hidden">
                                <Image
                                    src={config.image}
                                    alt={content.title || 'Info block'}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <div>
                            {content.title && (
                                <h2 className="text-3xl font-bold mb-4">{content.title}</h2>
                            )}
                            {content.description && (
                                <p className="text-lg text-gray-600 dark:text-gray-400">{content.description}</p>
                            )}
                        </div>
                    </div>
                </section>
            );

        case 'scrolling-banner':
            // TODO: Implement scrolling banner
            return (
                <section className="py-8 bg-gray-100 dark:bg-gray-900">
                    <div className="container mx-auto px-4">
                        <p className="text-center text-gray-500">Scrolling Banner - En desarrollo</p>
                    </div>
                </section>
            );

        default:
            console.warn(`Unknown block type: ${block.type}`);
            return null;
    }
}
