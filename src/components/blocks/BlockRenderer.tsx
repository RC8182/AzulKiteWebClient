import dynamic from 'next/dynamic';
import HeroSection from './HeroSection';
import HeroSlider from './HeroSlider';

const InfoBlock = dynamic(() => import('./InfoBlock'), { ssr: true });
const TextBlock = dynamic(() => import('./TextBlock'), { ssr: true });
const ProductGrid = dynamic(() => import('./ProductShowCase'), { ssr: true });
const BannerGrid = dynamic(() => import('./BannerGrid'), { ssr: true });
const ScrollingBanner = dynamic(() => import('./ScrollingBanner'), { ssr: true });
const FeaturesList = dynamic(() => import('./FeaturesList'), { ssr: true });
const FaqSection = dynamic(() => import('./FaqSection'), { ssr: true });
const ContactForm = dynamic(() => import('./ContactForm'), { ssr: true });
const Testimonials = dynamic(() => import('./Testimonials'), { ssr: true });

const componentsMap: { [key: string]: any } = {
    'blocks.hero-section': HeroSection,
    'blocks.hero-slider': HeroSlider,
    'blocks.product-grid': ProductGrid,
    'blocks.info-block': InfoBlock,
    'blocks.text-block': TextBlock,
    'blocks.banner-grid': BannerGrid,
    'blocks.scrolling-banner': ScrollingBanner,
    'blocks.features-list': FeaturesList,
    'blocks.faq-section': FaqSection,
    'blocks.contact-form': ContactForm,
    'blocks.testimonials': Testimonials,
};

const typeToComponentMap: { [key: string]: string } = {
    'hero': 'blocks.hero-section',
    'hero-slider': 'blocks.hero-slider',
    'product-grid': 'blocks.product-grid',
    'info-block': 'blocks.info-block',
    'rich-text': 'blocks.text-block',
    'banner-grid': 'blocks.banner-grid',
    'scrolling-banner': 'blocks.scrolling-banner',
    'features-list': 'blocks.features-list',
    'faq-section': 'blocks.faq-section',
    'contact-form': 'blocks.contact-form',
    'testimonials': 'blocks.testimonials',
};

export default function BlockRenderer({ blocks, category }: { blocks: any[], category?: any }) {
    if (!blocks) return null;

    return (
        <>
            {blocks.map((block, index) => {
                // If the block is from Prisma (custom dashboard), normalize it
                let normalizedBlock = { ...block };

                if (block.type && !block.__component) {
                    const componentName = typeToComponentMap[block.type];
                    if (componentName) {
                        normalizedBlock.__component = componentName;
                        const content = block.content || {};
                        const config = block.config || {};

                        console.log(`[BlockRenderer] Normalizing prisma block: ${block.type} -> ${componentName}`);

                        // Map fields based on component type
                        switch (block.type) {
                            case 'hero':
                                normalizedBlock = {
                                    ...normalizedBlock,
                                    title: content.title,
                                    subtitle: content.subtitle,
                                    backgroundImage: config.bgImage ? { url: config.bgImage } : null,
                                    cta: content.buttonText ? { label: content.buttonText, href: content.buttonLink || '#' } : null
                                };
                                break;
                            case 'rich-text':
                                normalizedBlock = {
                                    ...normalizedBlock,
                                    content: content.html
                                };
                                break;
                            case 'info-block':
                                normalizedBlock = {
                                    ...normalizedBlock,
                                    title: content.title,
                                    description: content.description,
                                    image: content.image ? { url: content.image } : null,
                                    imagePosition: config.imagePosition || 'left'
                                };
                                break;
                            case 'scrolling-banner':
                                normalizedBlock = {
                                    ...normalizedBlock,
                                    items: (content.items || []).map((item: any) => ({
                                        ...item,
                                        image: item.image ? { url: item.image } : null
                                    })),
                                    speed: config.speed,
                                    backgroundColor: config.backgroundColor
                                };
                                break;
                            case 'product-grid':
                                normalizedBlock = {
                                    ...normalizedBlock,
                                    title: content.title,
                                    mode: config.mode,
                                    layout: config.layout,
                                    limit: config.limit,
                                    showFilters: config.showFilters,
                                    enabledFilters: config.enabledFilters,
                                    filterCategoriesMode: config.filterCategoriesMode,
                                    manualFilterCategories: config.manualFilterCategories,
                                    selectedCategorySlug: config.category,
                                    manualProducts: content.manualProducts
                                };
                                break;
                            case 'hero-slider':
                                normalizedBlock = {
                                    ...normalizedBlock,
                                    slides: (content.slides || []).map((slide: any) => ({
                                        ...slide,
                                        backgroundImage: slide.backgroundImage ? { url: slide.backgroundImage } : null
                                    })),
                                    autoplay: config.autoplay,
                                    interval: config.interval
                                };
                                break;
                            case 'banner-grid':
                                normalizedBlock = {
                                    ...normalizedBlock,
                                    banners: (content.banners || []).map((banner: any) => ({
                                        ...banner,
                                        image: banner.image ? { url: banner.image } : null
                                    })),
                                    gridCols: config.gridCols
                                };
                                break;
                            case 'features-list':
                                normalizedBlock = {
                                    ...normalizedBlock,
                                    features: content.features
                                };
                                break;
                            case 'faq-section':
                                normalizedBlock = {
                                    ...normalizedBlock,
                                    faqs: content.faqs
                                };
                                break;
                            case 'contact-form':
                                normalizedBlock = {
                                    ...normalizedBlock,
                                    title: content.title
                                };
                                break;
                            case 'testimonials':
                                normalizedBlock = {
                                    ...normalizedBlock,
                                    testimonials: content.testimonials
                                };
                                break;
                        }
                    }
                }

                const Component = componentsMap[normalizedBlock.__component];
                if (!Component) {
                    console.warn(`No component found for: ${normalizedBlock.__component || normalizedBlock.type}`, normalizedBlock);
                    return null;
                }
                return <Component key={`${normalizedBlock.__component || normalizedBlock.type}-${index}`} {...normalizedBlock} category={category} />;
            })}
        </>
    );
}
