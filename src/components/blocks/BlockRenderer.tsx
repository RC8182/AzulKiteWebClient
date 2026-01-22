import dynamic from 'next/dynamic';
import HeroSection from './HeroSection';
import HeroSlider from './HeroSlider';

const InfoBlock = dynamic(() => import('./InfoBlock'), { ssr: true });
const TextBlock = dynamic(() => import('./TextBlock'), { ssr: true });
const ProductGrid = dynamic(() => import('./ProductShowCase'), { ssr: true });
const BannerGrid = dynamic(() => import('./BannerGrid'), { ssr: true });
const ScrollingBanner = dynamic(() => import('./ScrollingBanner'), { ssr: true });

const componentsMap: { [key: string]: any } = {
    'blocks.hero-section': HeroSection,
    'blocks.hero-slider': HeroSlider,
    'blocks.product-grid': ProductGrid,
    'blocks.info-block': InfoBlock,
    'blocks.text-block': TextBlock,
    'blocks.banner-grid': BannerGrid,
    'blocks.scrolling-banner': ScrollingBanner,
};

export default function BlockRenderer({ blocks, category }: { blocks: any[], category?: any }) {
    if (!blocks) return null;

    return (
        <>
            {blocks.map((block, index) => {
                const Component = componentsMap[block.__component];
                if (!Component) {
                    console.warn(`No component found for: ${block.__component}`);
                    return null;
                }
                 return <Component key={`${block.__component}-${index}`} {...block} category={category} />;
            })}
        </>
    );
}
