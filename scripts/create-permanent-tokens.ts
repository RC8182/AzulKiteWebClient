/**
 * Script para crear tokens permanentes de desarrollo
 * Estos tokens NO expiran en desarrollo
 */

import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

async function createPermanentTokens() {
    console.log('🔑 Creando tokens permanentes de desarrollo...\n');

    // Fecha muy lejana (año 2030)
    const farFuture = new Date('2030-12-31T23:59:59.999Z');

    const users = await prisma.user.findMany({
        where: {
            email: {
                in: ['admin@azulkite.com', 'jose.perez@example.com']
            }
        }
    });

    for (const user of users) {
        // Generar token único
        const token = createHash('sha256')
            .update(`${user.email}-permanent-token-${Date.now()}`)
            .digest('hex')
            .slice(0, 32);

        // Crear o actualizar token de verificación
        await prisma.verificationToken.upsert({
            where: {
                identifier_token: {
                    identifier: user.email,
                    token: token
                }
            },
            update: {
                expires: farFuture, // Fecha muy lejana
            },
            create: {
                identifier: user.email,
                token: token,
                expires: farFuture, // Fecha muy lejana
            },
        });

        const magicLink = `http://localhost:3000/api/auth/callback/email?token=${token}&email=${user.email}`;
        
        console.log(`✅ ${user.name} (${user.role})`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Token: ${token}`);
        console.log(`   🔗 Magic Link: ${magicLink}`);
        console.log(`   ⏰ Expira: ${farFuture.toLocaleDateString()}`);
        console.log('');
    }

    console.log('📋 Instrucciones:');
    console.log('1. Usa los magic links arriba');
    console.log('2. Los tokens NO expiran en desarrollo');
    console.log('3. Para producción, usar expiración normal');
    console.log('\n⚠️  ADVERTENCIA: Estos tokens son SOLO para desarrollo');
    console.log('   En producción usar expiración normal (24h)');
}

createPermanentTokens()
    .catch(console.error)
    .finally(() => prisma.$disconnect());