const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.product.count();
    const products = await prisma.product.findMany({
        include: {
            translations: true,
            variants: true
        }
    });
    console.log('Total Products (Count):', count);
    products.forEach(p => {
        console.log(`Product ID: ${p.id}`);
        console.log(`  Slug: ${p.slug}`);
        console.log(`  Translations (${p.translations.length}):`, p.translations.map(t => t.locale).join(', '));
        const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
        console.log(`  Variants Stock Total: ${totalStock}`);
        p.variants.forEach(v => console.log(`    Variant: ${v.name}, Stock: ${v.stock}`));
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
