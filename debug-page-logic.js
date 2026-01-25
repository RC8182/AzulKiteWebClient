const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const locale = 'es';
    const products = await prisma.product.findMany({
        include: {
            translations: {
                where: { locale },
                select: {
                    id: true,
                    locale: true,
                    name: true,
                    description: true,
                    shortDescription: true
                }
            },
            categories: {
                include: {
                    translations: {
                        where: { locale },
                        select: {
                            name: true,
                            description: true
                        }
                    }
                }
            },
            images: true,
            variants: true,
            saleInfo: true,
            _count: {
                select: {
                    categories: true,
                    images: true,
                    variants: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const total = await prisma.product.count();

    console.log('Total Products (Count):', total);
    console.log('Fetched products length:', products.length);

    const lowStockProducts = products.filter((p) => {
        const variantStock = p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
        return variantStock < 5;
    });

    const missingDescription = products.filter((p) => {
        const translation = p.translations?.[0];
        return !translation?.description || translation.description.length < 10;
    });

    const uncategorized = products.filter((p) => {
        return !p.categories || p.categories.length === 0;
    });

    console.log('Low Stock Products Count (threshold < 5):', lowStockProducts.length);
    console.log('Missing Description Count:', missingDescription.length);
    console.log('Uncategorized Count:', uncategorized.length);

    products.forEach(p => {
        const translation = p.translations[0] || {};
        console.log(`Product: ${translation.name || p.slug}`);
        console.log(`  Total Stock: ${p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
