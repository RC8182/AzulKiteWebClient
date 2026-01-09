import HeroSection from './HeroSection';
import HeroSlider from './HeroSlider';
import InfoBlock from './InfoBlock';
import ProductGrid from './ProductGrid';
import BannerGrid from './BannerGrid';

const componentsMap: { [key: string]: any } = {
    'blocks.hero-section': HeroSection,
    'blocks.hero-slider': HeroSlider,
    'blocks.product-grid': ProductGrid,
    'blocks.info-block': InfoBlock,
    'blocks.banner-grid': BannerGrid,
};

export default function BlockRenderer({ blocks }: { blocks: any[] }) {
    if (!blocks) return null;

    return (
        <>
            {blocks.map((block, index) => {
                const Component = componentsMap[block.__component];
                if (!Component) {
                    console.warn(`No component found for: ${block.__component}`);
                    return null;
                }
                return <Component key={`${block.__component}-${index}`} {...block} />;
            })}
        </>
    );
}
