/**
 * Script para crear tokens para usuarios específicos
 * Permite generar magic links para cualquier usuario
 */

import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

/**
 * Hash function that matches NextAuth's implementation
 * NextAuth uses SHA-256 to hash: token + secret
 */
async function createNextAuthHash(message: string): Promise<string> {
    const hash = createHash('sha256').update(message).digest('hex');
    return hash;
}

interface UserTokenOptions {
    email: string;
    name?: string;
    role?: 'USER' | 'ADMIN';
    expiresInDays?: number; // 0 = permanente (solo desarrollo)
    createUserIfNotExists?: boolean;
}

async function createUserToken(options: UserTokenOptions) {
    const {
        email,
        name = email.split('@')[0],
        role = 'USER',
        expiresInDays = 30,
        createUserIfNotExists = true
    } = options;

    console.log(`🔑 Creando token para usuario: ${email}\n`);

    // Verificar/Crear usuario
    let user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user && createUserIfNotExists) {
        console.log(`👤 Usuario no encontrado, creando nuevo...`);
        user = await prisma.user.create({
            data: {
                email,
                name,
                role,
                emailVerified: new Date(),
            }
        });
        console.log(`✅ Usuario creado: ${user.name} (${user.role})`);
    } else if (!user) {
        throw new Error(`Usuario no encontrado: ${email}. Use createUserIfNotExists=true para crearlo.`);
    }

    // Generar token plano (el que va en la URL)
    const token = randomBytes(32).toString('hex');

    // Obtener secret
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
        throw new Error('AUTH_SECRET o NEXTAUTH_SECRET no están configurados en .env');
    }

    // Hashear token para la base de datos
    const hashedToken = await createNextAuthHash(`${token}${secret}`);

    // Calcular fecha de expiración
    let expires = new Date();
    if (expiresInDays === 0 && process.env.NODE_ENV === 'development') {
        // Sin expiración (solo desarrollo)
        expires = new Date('2030-12-31T23:59:59.999Z');
        console.log('⚠️  Creando token PERMANENTE (solo para desarrollo)');
    } else {
        expires.setDate(expires.getDate() + expiresInDays);
    }

    // Crear token de verificación
    await prisma.verificationToken.upsert({
        where: {
            identifier_token: {
                identifier: email,
                token: hashedToken // Guardamos el HASH
            }
        },
        update: {
            expires,
        },
        create: {
            identifier: email,
            token: hashedToken, // Guardamos el HASH
            expires,
        },
    });

    const magicLink = `http://localhost:3000/api/auth/callback/email?token=${token}&email=${encodeURIComponent(email)}`;

    return {
        success: true,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
        token,
        magicLink,
        expires,
        expiresInDays: expiresInDays === 0 ? 'PERMANENTE (2030)' : `${expiresInDays} días`,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(magicLink)}`
    };
}

// CLI Interface
async function main() {
    console.log('👤 Generador de Tokens para Usuarios - Azul Kiteboarding\n');

    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.log('Uso: create-user-tokens.ts <email> [nombre] [rol] [dias]');
        console.log('');
        console.log('Ejemplos:');
        console.log('  npx tsx scripts/create-user-tokens.ts cliente@ejemplo.com');
        console.log('  npx tsx scripts/create-user-tokens.ts juan@ejemplo.com "Juan Perez" USER 30');
        console.log('  npx tsx scripts/create-user-tokens.ts admin2@azulkite.com "Admin 2" ADMIN 0 (permanente)');
        console.log('');
        console.log('Opciones:');
        console.log('  <email> - Email del usuario (obligatorio)');
        console.log('  [nombre] - Nombre del usuario (opcional, default: parte antes del @)');
        console.log('  [rol] - USER o ADMIN (opcional, default: USER)');
        console.log('  [dias] - Días de expiración (opcional, default: 30, 0 = permanente)');
        return;
    }

    const email = args[0];
    const name = args[1] || email.split('@')[0];
    const role = (args[2] === 'ADMIN' ? 'ADMIN' : 'USER') as 'USER' | 'ADMIN';
    const expiresInDays = args[3] ? parseInt(args[3]) : 30;

    try {
        const result = await createUserToken({
            email,
            name,
            role,
            expiresInDays,
            createUserIfNotExists: true
        });

        console.log('✅ TOKEN CREADO EXITOSAMENTE\n');
        console.log('📋 INFORMACIÓN DEL USUARIO:');
        console.log(`   👤 Nombre: ${result.user.name}`);
        console.log(`   📧 Email: ${result.user.email}`);
        console.log(`   🎯 Rol: ${result.user.role}`);
        console.log(`   🆔 ID: ${result.user.id}`);

        console.log('\n🔐 INFORMACIÓN DEL TOKEN:');
        console.log(`   🔑 Token: ${result.token}`);
        console.log(`   ⏰ Expiración: ${result.expiresInDays}`);
        console.log(`   📅 Fecha: ${result.expires.toLocaleDateString()}`);

        console.log('\n🔗 MAGIC LINK:');
        console.log(`   ${result.magicLink}`);

        console.log('\n📱 QR CODE (para móviles):');
        console.log(`   ${result.qrCodeUrl}`);

        console.log('\n📋 INSTRUCCIONES:');
        console.log('   1. Copia el Magic Link o escanea el QR Code');
        console.log('   2. Pégalo en el navegador');
        console.log('   3. ¡Sesión iniciada automáticamente!');

        if (expiresInDays === 0) {
            console.log('\n⚠️  ADVERTENCIA: Este token es PERMANENTE (hasta 2030)');
            console.log('   Solo usar en desarrollo, NO en producción');
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

// Ejemplos de uso predefinidos
async function createExampleUsers() {
    console.log('👥 Creando usuarios de ejemplo con tokens...\n');

    const exampleUsers = [
        {
            email: 'cliente1@ejemplo.com',
            name: 'Cliente Ejemplo 1',
            role: 'USER' as const,
            expiresInDays: 30
        },
        {
            email: 'cliente2@ejemplo.com',
            name: 'Cliente Ejemplo 2',
            role: 'USER' as const,
            expiresInDays: 30
        },
        {
            email: 'vendedor@azulkite.com',
            name: 'Vendedor Tienda',
            role: 'ADMIN' as const,
            expiresInDays: 30
        },
        {
            email: 'test@azulkite.com',
            name: 'Usuario Test',
            role: 'USER' as const,
            expiresInDays: 0 // Permanente para testing
        }
    ];

    const results = [];

    for (const userConfig of exampleUsers) {
        try {
            const result = await createUserToken(userConfig);
            results.push(result);
            console.log(`✅ ${userConfig.name}: ${result.magicLink}`);
        } catch (error: any) {
            console.error(`❌ Error con ${userConfig.email}:`, error.message);
        }
    }

    console.log('\n📊 RESUMEN:');
    console.log(`   Total usuarios creados: ${results.length}`);

    // Guardar en archivo para referencia
    const fs = require('fs');
    const output = {
        generatedAt: new Date().toISOString(),
        users: results.map(r => ({
            user: r.user,
            magicLink: r.magicLink,
            expires: r.expires
        }))
    };

    fs.writeFileSync(
        'user-tokens-reference.json',
        JSON.stringify(output, null, 2)
    );

    console.log('📄 Referencia guardada en: user-tokens-reference.json');
}

// Exportar funciones para uso programático
export { createUserToken, createExampleUsers };

if (require.main === module) {
    // Si se ejecuta con --examples, crear usuarios de ejemplo
    if (process.argv.includes('--examples')) {
        createExampleUsers()
            .catch(console.error)
            .finally(() => prisma.$disconnect());
    } else {
        main();
    }
}