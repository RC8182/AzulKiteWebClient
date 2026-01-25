const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({});
    console.log('Products:', products.map(p => ({ slug: p.slug, aiGenerated: p.aiGenerated })));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
