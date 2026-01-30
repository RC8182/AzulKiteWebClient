
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding usuarios de desarrollo...');

    // 1. Super Admin
    const adminEmail = 'admin@azulkite.com';
    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            role: 'ADMIN',
            name: 'Super Admin',
        },
        create: {
            email: adminEmail,
            name: 'Super Admin',
            role: 'ADMIN',
            emailVerified: new Date(),
        },
    });

    // 2. Usuario normal - Jose Perez
    const userEmail = 'jose.perez@example.com';
    const normalUser = await prisma.user.upsert({
        where: { email: userEmail },
        update: {
            name: 'Jose Perez',
            role: 'USER',
        },
        create: {
            email: userEmail,
            name: 'Jose Perez',
            role: 'USER',
            emailVerified: new Date(),
        },
    });

    console.log('✅ Super Admin creado:', adminUser);
    console.log('✅ Usuario normal creado:', normalUser);
    console.log('\n🔗 Magic Links para desarrollo:');
    console.log(`1. Super Admin: http://localhost:3000/api/auth/callback/email?token=admin-dev-token&email=${adminEmail}`);
    console.log(`2. Jose Perez: http://localhost:3000/api/auth/callback/email?token=user-dev-token&email=${userEmail}`);
    console.log('\n⚠️  Nota: Estos links funcionan SOLO en desarrollo con NODE_ENV=development');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
