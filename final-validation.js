const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock translation and category flattening similar to the updated action
function transform(products, locale = 'es') {
    return products.map(product => {
        const translation = product.translations[0] || {};
        const transformedCategories = product.categories.map(cat => {
            const catTrans = cat.translations[0] || {};
            return {
                ...cat,
                name: catTrans.name || cat.slug,
                description: catTrans.description
            };
        });

        // This mimics the new logic in getProducts
        const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        const minPrice = product.variants.length > 0
            ? Math.min(...product.variants.map(v => v.price))
            : 0;

        return {
            ...product,
            id: product.id,
            documentId: product.id,
            stock: totalStock,
            price: minPrice,
            attributes: {
                ...product,
                name: translation.name,
                description: translation.description,
                shortDescription: translation.shortDescription,
                categories: transformedCategories,
                locale,
                stock: totalStock,
                price: minPrice
            },
            name: translation.name,
            description: translation.description,
            shortDescription: translation.shortDescription,
            categories: transformedCategories,
            locale
        };
    });
}

async function main() {
    const products = await prisma.product.findMany({
        include: {
            translations: { where: { locale: 'es' } },
            categories: { include: { translations: { where: { locale: 'es' } } } },
            variants: true
        }
    });

    const transformed = transform(products);

    console.log('--- VALIDATION REPORT ---');
    console.log('Total Products Identified:', transformed.length);

    const northReach = transformed.find(p => p.slug === 'north-reach-12m');
    console.log('North Reach 12m:');
    console.log('  Unified Stock:', northReach.stock);
    console.log('  Variants Count:', northReach.variants.length);
    console.log('  Stock via variants sum:', northReach.variants.reduce((s, v) => s + v.stock, 0));

    const cabrinha = transformed.find(p => p.slug === 'cabrinha-overdrive-bar');
    console.log('Cabrinha Overdrive Bar:');
    console.log('  Unified Stock:', cabrinha.stock);
    console.log('  Variants Count:', cabrinha.variants.length);

    if (transformed.length === 2 && northReach.stock === 8 && cabrinha.stock === 12) {
        console.log('RESULT: SUCCESS - Counts are consistent.');
    } else {
        console.log('RESULT: FAILURE - Counts are inconsistent.');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
