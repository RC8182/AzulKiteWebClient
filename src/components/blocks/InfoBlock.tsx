import NextImage from 'next/image';
import { getStrapiMedia } from '@/lib/media-utils';

interface InfoBlockProps {
    title: string;
    description: string;
    image: any;
    imagePosition?: 'left' | 'right';
}

export default function InfoBlock({ title, description, image, imagePosition = 'left' }: InfoBlockProps) {
    const imageUrl = getStrapiMedia(image?.url);
    const imageAlt = image?.alternativeText || title || "Info Image";
    const hasImage = !!imageUrl;

    return (
        <section className="py-20 px-4">
            <div className={`container mx-auto ${hasImage ? `flex flex-col ${imagePosition === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12` : 'max-w-4xl'}`}>
                {hasImage && (
                    <div className="flex-1 relative aspect-video overflow-hidden rounded-2xl shadow-2xl">
                        <NextImage
                            src={imageUrl}
                            alt={imageAlt}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
                <div className={`${hasImage ? 'flex-1' : 'w-full'} space-y-6`}>
                    <h2 className="text-4xl font-bold text-[var(--color-primary)]">
                        {title}
                    </h2>
                    <div
                        className="text-lg text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                </div>
            </div>
        </section>
    );
}

