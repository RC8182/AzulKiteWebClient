const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock translation and category flattening similar to the action
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

        return {
            ...product,
            id: product.id,
            documentId: product.id,
            attributes: {
                ...product,
                name: translation.name,
                description: translation.description,
                shortDescription: translation.shortDescription,
                categories: transformedCategories,
                locale
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

    const total = await prisma.product.count();
    const transformed = transform(products);

    console.log('Total Count from DB:', total);
    console.log('Number of products returned:', transformed.length);
    transformed.forEach(p => {
        console.log(`Product: ${p.slug}`);
        console.log(`  Variants: ${p.variants.length}`);
        const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
        console.log(`  Total Stock (Manual calc): ${totalStock}`);
        console.log(`  p.stock: ${p.stock}`);
        console.log(`  p.attributes.stock: ${p.attributes.stock}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
