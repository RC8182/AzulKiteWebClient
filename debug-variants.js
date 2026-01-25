const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.variant.count();
    const variants = await prisma.variant.findMany({
        include: {
            product: true
        }
    });
    console.log('Total Variants:', count);
    variants.forEach(v => {
        console.log(`Variant ID: ${v.id}`);
        console.log(`  Name: ${v.name}`);
        console.log(`  Stock: ${v.stock}`);
        console.log(`  Product ID: ${v.productId}`);
        console.log(`  Product Slug: ${v.product ? v.product.slug : 'NULL'}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
