/**
 * Sistema de gestión de tokens desde admin
 * Permite crear, listar y revocar tokens
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

console.log('DEBUG: .env path:', envPath);
console.log('DEBUG: NEXTAUTH_SECRET cargado?', !!process.env.NEXTAUTH_SECRET);

const prisma = new PrismaClient();

interface TokenOptions {
    email: string;
    expiresInDays?: number; // 0 = sin expiración (solo desarrollo)
    description?: string;
}

/**
 * Hash function that matches NextAuth's implementation
 * NextAuth uses SHA-256 to hash: token + secret
 */
async function createHash(message: string): Promise<string> {
    const hash = crypto.createHash('sha256').update(message).digest('hex');
    return hash;
}

class TokenManager {
    /**
     * Crear un nuevo token
     */
    static async createToken(options: TokenOptions) {
        const { email, expiresInDays = 30, description = 'Token generado desde admin' } = options;

        // Verificar que el usuario existe
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw new Error(`Usuario no encontrado: ${email}`);
        }

        // Generar token (este es el que va en el magic link)
        const token = crypto.randomBytes(32).toString('hex');

        // Obtener el secret de NextAuth (V5 usa AUTH_SECRET, V4 usa NEXTAUTH_SECRET)
        const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
        if (!secret) {
            console.error('❌ Variables de entorno cargadas:', Object.keys(process.env).filter(k => k.includes('SECRET') || k.includes('AUTH')));
            throw new Error('AUTH_SECRET o NEXTAUTH_SECRET no están configurados en .env');
        }

        // Hash del token (como lo hace NextAuth: token + secret)
        const hashedToken = await createHash(`${token}${secret}`);

        console.log(`\n🔍 Debug Hashing:`);
        console.log(`   Secret usado: ${secret.substring(0, 3)}...${secret.substring(secret.length - 3)}`);
        console.log(`   Token plano: ${token.substring(0, 8)}...`);
        console.log(`   Hash generado: ${hashedToken.substring(0, 8)}...\n`);

        // Calcular fecha de expiración
        let expires = new Date();
        if (expiresInDays === 0 && process.env.NODE_ENV === 'development') {
            // Sin expiración (solo desarrollo)
            expires = new Date('2030-12-31T23:59:59.999Z');
        } else {
            expires.setDate(expires.getDate() + expiresInDays);
        }

        // Crear token en la base de datos con el hash
        const verificationToken = await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: hashedToken, // ⚠️ Guardamos el hash, no el token plano
                expires,
            },
        });

        const magicLink = `http://localhost:3000/api/auth/callback/email?token=${token}&email=${email}`;

        return {
            success: true,
            token, // ⚠️ Retornamos el token plano para el magic link
            magicLink,
            expires: verificationToken.expires,
            description,
            user: {
                email: user.email,
                name: user.name,
                role: user.role,
            }
        };
    }

    /**
     * Listar todos los tokens activos
     */
    static async listTokens() {
        const tokens = await prisma.verificationToken.findMany({
            include: {
                // Nota: No hay relación directa, pero podemos buscar usuarios
            },
            orderBy: {
                expires: 'desc'
            }
        });

        // Enriquecer con información de usuario
        const enrichedTokens = await Promise.all(
            tokens.map(async (token) => {
                const user = await prisma.user.findUnique({
                    where: { email: token.identifier }
                });

                return {
                    token: token.token,
                    identifier: token.identifier,
                    expires: token.expires,
                    user: user ? {
                        name: user.name,
                        role: user.role,
                        emailVerified: user.emailVerified,
                    } : null,
                    isExpired: token.expires < new Date(),
                    daysRemaining: Math.ceil((token.expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                };
            })
        );

        return enrichedTokens;
    }

    /**
     * Revocar un token específico
     */
    static async revokeToken(token: string) {
        const deleted = await prisma.verificationToken.delete({
            where: { token }
        });

        return {
            success: true,
            message: `Token revocado para: ${deleted.identifier}`,
            identifier: deleted.identifier,
        };
    }

    /**
     * Revocar todos los tokens de un usuario
     */
    static async revokeAllUserTokens(email: string) {
        const deleted = await prisma.verificationToken.deleteMany({
            where: { identifier: email }
        });

        return {
            success: true,
            message: `${deleted.count} tokens revocados para ${email}`,
            count: deleted.count,
        };
    }

    /**
     * Limpiar tokens expirados
     */
    static async cleanupExpiredTokens() {
        const deleted = await prisma.verificationToken.deleteMany({
            where: {
                expires: {
                    lt: new Date()
                }
            }
        });

        return {
            success: true,
            message: `${deleted.count} tokens expirados eliminados`,
            count: deleted.count,
        };
    }
}

// CLI Interface
async function main() {
    const command = process.argv[2];
    const args = process.argv.slice(3);

    console.log('🔐 Gestor de Tokens - Azul Kiteboarding\n');

    try {
        switch (command) {
            case 'create':
                if (args.length < 1) {
                    console.log('Uso: create <email> [dias] [descripción]');
                    console.log('Ejemplo: create admin@azulkite.com 30 "Token admin"');
                    return;
                }

                const result = await TokenManager.createToken({
                    email: args[0],
                    expiresInDays: args[1] ? parseInt(args[1]) : 30,
                    description: args[2] || 'Token generado desde CLI',
                });

                console.log('✅ Token creado exitosamente:');
                console.log(`   Usuario: ${result.user.name} (${result.user.role})`);
                console.log(`   Email: ${result.user.email}`);
                console.log(`   Token: ${result.token}`);
                console.log(`   Magic Link: ${result.magicLink}`);
                console.log(`   Expira: ${result.expires.toLocaleDateString()}`);
                console.log(`   Descripción: ${result.description}`);
                break;

            case 'list':
                const tokens = await TokenManager.listTokens();
                console.log(`📋 Tokens activos (${tokens.length}):\n`);

                tokens.forEach((t, i) => {
                    console.log(`${i + 1}. ${t.identifier}`);
                    console.log(`   Token: ${t.token.substring(0, 16)}...`);
                    console.log(`   Usuario: ${t.user?.name || 'No encontrado'} (${t.user?.role || 'N/A'})`);
                    console.log(`   Expira: ${t.expires.toLocaleDateString()}`);
                    console.log(`   Días restantes: ${t.daysRemaining}`);
                    console.log(`   Estado: ${t.isExpired ? '❌ Expirado' : '✅ Activo'}`);
                    console.log('');
                });
                break;

            case 'revoke':
                if (args.length < 1) {
                    console.log('Uso: revoke <token>');
                    console.log('   o: revoke --user <email> (revocar todos los tokens del usuario)');
                    return;
                }

                if (args[0] === '--user') {
                    const email = args[1];
                    const result = await TokenManager.revokeAllUserTokens(email);
                    console.log(`✅ ${result.message}`);
                } else {
                    const token = args[0];
                    const result = await TokenManager.revokeToken(token);
                    console.log(`✅ ${result.message}`);
                }
                break;

            case 'cleanup':
                const cleanupResult = await TokenManager.cleanupExpiredTokens();
                console.log(`✅ ${cleanupResult.message}`);
                break;

            case 'permanent-dev':
                // Crear tokens permanentes para desarrollo
                const devResult = await TokenManager.createToken({
                    email: 'admin@azulkite.com',
                    expiresInDays: 0, // Sin expiración
                    description: 'Token permanente desarrollo',
                });
                console.log('🔗 Token permanente creado:');
                console.log(`   ${devResult.magicLink}`);
                break;

            default:
                console.log('Comandos disponibles:');
                console.log('  create <email> [dias] [desc] - Crear nuevo token');
                console.log('  list - Listar todos los tokens');
                console.log('  revoke <token> - Revocar token específico');
                console.log('  revoke --user <email> - Revocar todos los tokens del usuario');
                console.log('  cleanup - Eliminar tokens expirados');
                console.log('  permanent-dev - Crear token permanente para desarrollo');
                console.log('\nEjemplos:');
                console.log('  npx tsx scripts/admin-token-manager.ts create admin@azulkite.com 30');
                console.log('  npx tsx scripts/admin-token-manager.ts list');
                console.log('  npx tsx scripts/admin-token-manager.ts revoke abc123...');
        }
    } catch (error: any) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    main();
}

export { TokenManager };