/**
 * Sistema completo de gestión de usuarios
 * Crear, listar, actualizar y eliminar usuarios
 */

import { PrismaClient } from '@prisma/client';
import { createUserToken } from './create-user-tokens';

const prisma = new PrismaClient();

class UserManager {
    /**
     * Crear nuevo usuario con token
     */
    static async createUserWithToken(options: {
        email: string;
        name: string;
        role?: 'USER' | 'ADMIN';
        expiresInDays?: number;
        sendWelcomeEmail?: boolean;
    }) {
        const {
            email,
            name,
            role = 'USER',
            expiresInDays = 30,
            sendWelcomeEmail = false
        } = options;

        console.log(`👤 Creando usuario: ${name} <${email}>`);

        // Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log(`⚠️  Usuario ya existe, actualizando...`);
            
            // Actualizar usuario
            const updatedUser = await prisma.user.update({
                where: { email },
                data: {
                    name,
                    role,
                    updatedAt: new Date(),
                }
            });

            // Crear nuevo token
            const tokenResult = await createUserToken({
                email,
                name,
                role,
                expiresInDays,
                createUserIfNotExists: false
            });

            return {
                action: 'updated',
                user: updatedUser,
                token: tokenResult.token,
                magicLink: tokenResult.magicLink,
                expires: tokenResult.expires
            };
        }

        // Crear nuevo usuario
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                role,
                emailVerified: new Date(),
            }
        });

        console.log(`✅ Usuario creado: ${newUser.name} (${newUser.role})`);

        // Crear token
        const tokenResult = await createUserToken({
            email,
            name,
            role,
            expiresInDays,
            createUserIfNotExists: false
        });

        // Simular email de bienvenida (en desarrollo)
        if (sendWelcomeEmail && process.env.NODE_ENV === 'development') {
            console.log(`📧 Email de bienvenida simulado para: ${email}`);
            console.log(`   Contenido: Bienvenido a Azul Kiteboarding, ${name}!`);
            console.log(`   Magic Link: ${tokenResult.magicLink}`);
        }

        return {
            action: 'created',
            user: newUser,
            token: tokenResult.token,
            magicLink: tokenResult.magicLink,
            expires: tokenResult.expires,
            welcomeEmailSent: sendWelcomeEmail
        };
    }

    /**
     * Listar todos los usuarios
     */
    static async listUsers(options?: {
        role?: 'USER' | 'ADMIN';
        limit?: number;
        offset?: number;
    }) {
        const { role, limit = 50, offset = 0 } = options || {};

        const where = role ? { role } : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
                include: {
                    profile: true,
                    _count: {
                        select: {
                            orders: true,
                            favorites: true,
                        }
                    }
                }
            }),
            prisma.user.count({ where })
        ]);

        return {
            users,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + users.length < total
            }
        };
    }

    /**
     * Buscar usuario por email o nombre
     */
    static async searchUsers(query: string) {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { email: { contains: query, mode: 'insensitive' } },
                    { name: { contains: query, mode: 'insensitive' } }
                ]
            },
            include: {
                profile: true
            },
            orderBy: { name: 'asc' },
            take: 20
        });

        return users;
    }

    /**
     * Actualizar usuario
     */
    static async updateUser(email: string, updates: {
        name?: string;
        role?: 'USER' | 'ADMIN';
        emailVerified?: boolean;
    }) {
        const updateData: any = {};
        
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.role !== undefined) updateData.role = updates.role;
        if (updates.emailVerified !== undefined) {
            updateData.emailVerified = updates.emailVerified ? new Date() : null;
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: updateData
        });

        return updatedUser;
    }

    /**
     * Eliminar usuario
     */
    static async deleteUser(email: string, options?: {
        deleteTokens?: boolean;
        deleteProfile?: boolean;
    }) {
        const { deleteTokens = true, deleteProfile = true } = options || {};

        // Obtener usuario primero
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                profile: true,
                _count: {
                    select: {
                        orders: true,
                        favorites: true,
                    }
                }
            }
        });

        if (!user) {
            throw new Error(`Usuario no encontrado: ${email}`);
        }

        console.log(`🗑️  Eliminando usuario: ${user.name} <${email}>`);
        console.log(`   📊 Estadísticas:`);
        console.log(`      - Pedidos: ${user._count.orders}`);
        console.log(`      - Favoritos: ${user._count.favorites}`);
        console.log(`      - Perfil: ${user.profile ? 'Sí' : 'No'}`);

        // Eliminar tokens si se solicita
        if (deleteTokens) {
            const deletedTokens = await prisma.verificationToken.deleteMany({
                where: { identifier: email }
            });
            console.log(`   🔑 Tokens eliminados: ${deletedTokens.count}`);
        }

        // Eliminar perfil si existe y se solicita
        if (deleteProfile && user.profile) {
            await prisma.userProfile.delete({
                where: { userId: user.id }
            });
            console.log(`   👤 Perfil eliminado`);
        }

        // Eliminar usuario (esto eliminará en cascada: accounts, sessions, etc.)
        const deletedUser = await prisma.user.delete({
            where: { email }
        });

        console.log(`✅ Usuario eliminado: ${deletedUser.name}`);

        return {
            success: true,
            user: deletedUser,
            stats: {
                ordersDeleted: user._count.orders,
                favoritesDeleted: user._count.favorites,
                tokensDeleted: deleteTokens ? 'all' : 'none',
                profileDeleted: deleteProfile && user.profile ? 'yes' : 'no'
            }
        };
    }

    /**
     * Generar reporte de usuarios
     */
    static async generateReport() {
        const [
            totalUsers,
            admins,
            verifiedUsers,
            usersWithProfile,
            recentUsers
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'ADMIN' } }),
            prisma.user.count({ where: { emailVerified: { not: null } } }),
            prisma.user.count({
                where: {
                    profile: { isNot: null }
                }
            }),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
                    }
                }
            })
        ]);

        const activeTokens = await prisma.verificationToken.count({
            where: {
                expires: {
                    gt: new Date()
                }
            }
        });

        return {
            generatedAt: new Date().toISOString(),
            summary: {
                totalUsers,
                admins,
                regularUsers: totalUsers - admins,
                verifiedUsers,
                verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers * 100).toFixed(1) + '%' : '0%',
                usersWithProfile,
                recentUsers30Days: recentUsers,
                activeTokens
            },
            breakdown: {
                byRole: {
                    ADMIN: admins,
                    USER: totalUsers - admins
                },
                byVerification: {
                    verified: verifiedUsers,
                    notVerified: totalUsers - verifiedUsers
                }
            }
        };
    }
}

// CLI Interface
async function main() {
    const command = process.argv[2];
    const args = process.argv.slice(3);

    console.log('👥 Gestor de Usuarios - Azul Kiteboarding\n');

    try {
        switch (command) {
            case 'create':
                if (args.length < 2) {
                    console.log('Uso: create <email> <nombre> [rol] [dias] [--welcome]');
                    console.log('Ejemplo: create cliente@ejemplo.com "Juan Perez" USER 30 --welcome');
                    return;
                }
                
                const email = args[0];
                const name = args[1];
                const role = args[2] === 'ADMIN' ? 'ADMIN' : 'USER';
                const expiresInDays = args[3] ? parseInt(args[3]) : 30;
                const sendWelcomeEmail = args.includes('--welcome');

                const result = await UserManager.createUserWithToken({
                    email,
                    name,
                    role,
                    expiresInDays,
                    sendWelcomeEmail
                });

                console.log(`\n✅ Usuario ${result.action}:`);
                console.log(`   👤 ${result.user.name} <${result.user.email}>`);
                console.log(`   🎯 Rol: ${result.user.role}`);
                console.log(`   🔗 Magic Link: ${result.magicLink}`);
                console.log(`   ⏰ Expira: ${result.expires.toLocaleDateString()}`);
                
                if (sendWelcomeEmail) {
                    console.log(`   📧 Email de bienvenida: ${result.welcomeEmailSent ? 'Enviado (simulado)' : 'No enviado'}`);
                }
                break;

            case 'list':
                const roleFilter = args[0] === 'ADMIN' || args[0] === 'USER' ? args[0] : undefined;
                const limit = args[1] ? parseInt(args[1]) : 20;
                
                const listResult = await UserManager.listUsers({
                    role: roleFilter,
                    limit
                });

                console.log(`📋 Usuarios (${listResult.pagination.total} total):\n`);
                
                listResult.users.forEach((user, i) => {
                    console.log(`${i + 1}. ${user.name} <${user.email}>`);
                    console.log(`   🎯 Rol: ${user.role}`);
                    console.log(`   📅 Creado: ${user.createdAt.toLocaleDateString()}`);
                    console.log(`   ✅ Verificado: ${user.emailVerified ? 'Sí' : 'No'}`);
                    console.log(`   👤 Perfil: ${user.profile ? 'Completo' : 'Básico'}`);
                    console.log(`   🛒 Pedidos: ${user._count.orders}`);
                    console.log(`   ⭐ Favoritos: ${user._count.favorites}`);
                    console.log('');
                });

                if (listResult.pagination.hasMore) {
                    console.log(`... y ${listResult.pagination.total - listResult.users.length} más`);
                }
                break;

            case 'search':
                if (args.length < 1) {
                    console.log('Uso: search <query>');
                    return;
                }
                
                const query = args[0];
                const searchResults = await UserManager.searchUsers(query);
                
                console.log(`🔍 Resultados para "${query}" (${searchResults.length}):\n`);
                
                searchResults.forEach((user, i) => {
                    console.log(`${i + 1}. ${user.name} <${user.email}>`);
                    console.log(`   Rol: ${user.role}`);
                    console.log('');
                });
                break;

            case 'update':
                if (args.length < 3) {
                    console.log('Uso: update <email> <campo> <valor>');
                    console.log('Campos: name, role, verified');
                    console.log('Ejemplo: update admin@azulkite.com role ADMIN');
                    console.log('Ejemplo: update cliente@ejemplo.com name "Nuevo Nombre"');
                    console.log('Ejemplo: update cliente@ejemplo.com verified true');
                    return;
                }
                
                const updateEmail = args[0];
                const field = args[1];
                const value = args[2];

                let updateData: any = {};
                
                switch (field) {
                    case 'name':
                        updateData.name = value;
                        break;
                    case 'role':
                        if (value !== 'USER' && value !== 'ADMIN') {
                            throw new Error('Rol debe ser USER o ADMIN');
                        }
                        updateData.role = value;
                        break;
                    case 'verified':
                        updateData.emailVerified = value === 'true';
                        break;
                    default:
                        throw new Error(`Campo no válido: ${field}`);
                }

                const updatedUser = await UserManager.updateUser(updateEmail, updateData);
                console.log(`✅ Usuario actualizado:`);
                console.log(`   ${updatedUser.name} <${updatedUser.email}>`);
                console.log(`   Rol: ${updatedUser.role}`);
                console.log(`   Verificado: ${updatedUser.emailVerified ? 'Sí' : 'No'}`);
                break;

            case 'delete':
                if (args.length < 1) {
                    console.log('Uso: delete <email> [--keep-tokens] [--keep-profile]');
                    console.log('Ejemplo: delete test@ejemplo.com');
                    console.log('Ejemplo: delete old@ejemplo.com --keep-tokens --keep-profile');
                    return;
                }
                
                const deleteEmail = args[0];
                const deleteOptions = {
                    deleteTokens: !args.includes('--keep-tokens'),
                    deleteProfile: !args.includes('--keep-profile')
                };

                const deleteResult = await UserManager.deleteUser(deleteEmail, deleteOptions);
                console.log(`\n✅ ${deleteResult.success ? 'Usuario eliminado exitosamente' : 'Error'}`);
                console.log(`   Estadísticas:`);
                console.log(`     - Pedidos eliminados: ${deleteResult.stats.ordersDeleted}`);
                console.log(`     - Favoritos eliminados: ${deleteResult.stats.favoritesDeleted}`);
                console.log(`     - Tokens: ${deleteResult.stats.tokensDeleted}`);
                console.log(`     - Perfil: ${deleteResult.stats.profileDeleted}`);
                break;

            case 'report':
                const report = await UserManager.generateReport();
                console.log('📊 REPORTE DE USUARIOS\n');
                console.log('📈 RESUMEN:');
                console.log(`   Total usuarios: ${report.summary.totalUsers}`);
                console.log(`   Administradores: ${report.summary.admins}`);
                console.log(`   Usuarios regulares: ${report.summary.regularUsers}`);
                console.log(`   Verificados: ${report.summary.verifiedUsers} (${report.summary.verificationRate})`);
                console.log(`   Con perfil completo: ${report.summary.usersWithProfile}`);
                console.log(`   Nuevos (30 días): ${report.summary.recentUsers30Days}`);
                console.log(`   Tokens activos: ${report.summary.activeTokens}`);
                console.log('\n🎯 DESGLOSE POR ROL:');
                console.log(`   ADMIN: ${report.breakdown.byRole.ADMIN}`);
                console.log(`   USER: ${report.breakdown.byRole.USER}`);
                console.log('\n✅ DESGLOSE POR VERIFICACIÓN:');
                console.log(`   Verificados: ${report.breakdown.byVerification.verified}`);
                console.log(`   No verificados: ${report.breakdown.byVerification.notVerified}`);
                console.log(`\n📅 Generado: ${new Date(report.generatedAt).toLocaleString()}`);
                break;

            case 'help':
            default:
                console.log('Comandos disponibles:\n');
                console.log('👤 CREACIÓN:');
                console.log('  create <email> <nombre> [rol] [dias] [--welcome]');
                console.log('    Crea usuario y genera magic link');
                console.log('    Ej: create cliente@ejemplo.com "Juan" USER 30 --welcome\n');
                
                console.log('📋 LISTADO:');
                console.log('  list [rol] [limite]');
                console.log('    Lista usuarios (opcional: filtrar por rol)');
                console.log('    Ej: list ADMIN 10\n');
                
                console.log('🔍 BÚSQUEDA:');
                console.log('  search <query>');
                console.log('    Busca usuarios por email o nombre');
                console.log('    Ej: search "juan"\n');
                
                console.log('✏️  ACTUALIZACIÓN:');
                console.log('  update <email> <campo> <valor>');
                console.log('    Actualiza nombre, rol o verificación');
                console.log('    Ej: update admin@azulkite.com role ADMIN\n');
                
                console.log('🗑️  ELIMINACIÓN:');
                console.log('  delete <email> [--keep-tokens] [--keep-profile]');
                console.log('    Elimina usuario (opcional: conservar tokens/perfil)');
                console.log('    Ej: delete test@ejemplo.com\n');
                
                console.log('📊 REPORTES:');
                console.log('  report');
                console.log('    Genera reporte estadístico de usuarios\n');
                
                console.log('📝 EJEMPLOS COMPLETOS:');
                console.log('  # Crear cliente con token de 60 días');
                console.log('  npx tsx scripts/user-management.ts create cliente@ejemplo.com "Cliente Ejemplo" USER 60');
                console.log('');
                console.log('  # Crear admin permanente para desarrollo');
                console.log('  npx tsx scripts/user-management.ts create dev@azulkite.com "Dev Admin" ADMIN 0');
                console.log('');
                console.log('  # Listar solo administradores');
                console.log('  npx tsx scripts/user-management.ts list ADMIN');
                console.log('');
                console.log('  # Buscar usuarios con "test"');
                console.log('  npx tsx scripts/user-management.ts search test');
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

export { UserManager };