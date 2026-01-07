import HeroSection from './HeroSection';
import InfoBlock from './InfoBlock';
import ProductGrid from './ProductGrid';

const componentsMap: { [key: string]: any } = {
    'blocks.hero-section': HeroSection,
    'blocks.product-grid': ProductGrid,
    'blocks.info-block': InfoBlock,
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
