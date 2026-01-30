
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
    try {
        const productCount = await prisma.product.count();
        const pageCount = await prisma.page.count();
        const userCount = await prisma.user.count();

        console.log('--- DATA CHECK ---');
        console.log(`Products: ${productCount}`);
        console.log(`Pages: ${pageCount}`);
        console.log(`Users: ${userCount}`);
        console.log('------------------');
    } catch (error) {
        console.error('Error connecting to DB:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
