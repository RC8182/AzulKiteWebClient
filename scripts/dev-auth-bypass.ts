/**
 * Script para bypass de autenticación en desarrollo
 * Crea tokens de desarrollo para acceder sin SMTP
 */

import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function generateDevTokens() {
    console.log('🔧 Generando tokens de desarrollo...\n');

    const users = await prisma.user.findMany({
        where: {
            email: {
                in: ['admin@azulkite.com', 'jose.perez@example.com']
            }
        }
    });

    console.log('Usuarios encontrados:');
    users.forEach(user => {
        const token = createHash('sha256')
            .update(`${user.email}-dev-token-${Date.now()}`)
            .digest('hex')
            .slice(0, 32);

        const magicLink = `http://localhost:3000/api/auth/callback/email?token=${token}&email=${user.email}`;
        
        console.log(`\n👤 ${user.name} (${user.role})`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`🔑 Token: ${token}`);
        console.log(`🔗 Magic Link: ${magicLink}`);
    });

    console.log('\n📋 Instrucciones:');
    console.log('1. Copia el magic link del usuario deseado');
    console.log('2. Pégalo en el navegador');
    console.log('3. Serás autenticado automáticamente');
    console.log('\n⚠️  Estos tokens solo funcionan en desarrollo (NODE_ENV=development)');
}

generateDevTokens()
    .catch(console.error)
    .finally(() => prisma.$disconnect());