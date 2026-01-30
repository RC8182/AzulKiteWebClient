/**
 * Script para diagnosticar y arreglar problemas de autenticación
 */

import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

async function diagnoseAndFix() {
    console.log('🔧 DIAGNÓSTICO Y REPARACIÓN DE AUTH\n');

    // 1. Verificar usuarios
    console.log('1. 📊 Verificando usuarios...');
    const users = await prisma.user.findMany();
    console.log(`   Usuarios encontrados: ${users.length}`);
    users.forEach(user => {
        console.log(`   - ${user.email} (${user.name}) - Verificado: ${user.emailVerified ? 'Sí' : 'No'}`);
    });

    // 2. Verificar tokens existentes
    console.log('\n2. 🔐 Verificando tokens de verificación...');
    const tokens = await prisma.verificationToken.findMany();
    console.log(`   Tokens encontrados: ${tokens.length}`);
    
    tokens.forEach(token => {
        const isExpired = token.expires < new Date();
        console.log(`   - ${token.identifier}: ${token.token.substring(0, 16)}...`);
        console.log(`     Expira: ${token.expires.toLocaleString()} ${isExpired ? '❌ EXPIRADO' : '✅ VÁLIDO'}`);
    });

    // 3. Crear tokens válidos para todos los usuarios
    console.log('\n3. 🛠️ Creando tokens válidos...');
    
    for (const user of users) {
        // Eliminar tokens expirados para este usuario
        const deleted = await prisma.verificationToken.deleteMany({
            where: {
                identifier: user.email,
                expires: {
                    lt: new Date()
                }
            }
        });
        
        if (deleted.count > 0) {
            console.log(`   🗑️  Eliminados ${deleted.count} tokens expirados para ${user.email}`);
        }

        // Crear nuevo token válido (30 días)
        const token = createHash('sha256')
            .update(`${user.email}-fixed-token-${Date.now()}`)
            .digest('hex')
            .slice(0, 32);

        const expires = new Date();
        expires.setDate(expires.getDate() + 30);

        await prisma.verificationToken.create({
            data: {
                identifier: user.email,
                token,
                expires,
            }
        });

        const magicLink = `http://localhost:3000/api/auth/callback/email?token=${token}&email=${encodeURIComponent(user.email)}`;
        
        console.log(`   ✅ Token creado para ${user.name}:`);
        console.log(`      🔗 ${magicLink}`);
        console.log(`      ⏰ Expira: ${expires.toLocaleDateString()}`);
    }

    // 4. Verificar configuración NextAuth
    console.log('\n4. ⚙️ Verificando configuración...');
    const requiredEnvVars = [
        'NEXTAUTH_URL',
        'NEXTAUTH_SECRET',
        'NODE_ENV'
    ];
    
    let allGood = true;
    requiredEnvVars.forEach(varName => {
        const value = process.env[varName];
        const hasValue = value && value !== '';
        console.log(`   ${varName}: ${hasValue ? '✅' : '❌'} ${value || 'NO DEFINIDO'}`);
        if (!hasValue) allGood = false;
    });

    // 5. Probar conexión a DB
    console.log('\n5. 🗄️ Probando conexión a base de datos...');
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('   ✅ Conexión a DB funcionando');
    } catch (error: any) {
        console.log(`   ❌ Error de conexión: ${error.message}`);
        allGood = false;
    }

    // 6. Resumen
    console.log('\n📋 RESUMEN:');
    if (allGood && users.length > 0 && tokens.length > 0) {
        console.log('   ✅ Sistema listo para autenticación');
        console.log('\n🔗 LINKS DE PRUEBA:');
        
        const validTokens = await prisma.verificationToken.findMany({
            where: {
                expires: {
                    gt: new Date()
                }
            }
        });

        validTokens.forEach(token => {
            const magicLink = `http://localhost:3000/api/auth/callback/email?token=${token.token}&email=${encodeURIComponent(token.identifier)}`;
            console.log(`   👤 ${token.identifier}:`);
            console.log(`      ${magicLink}`);
        });
    } else {
        console.log('   ⚠️  Hay problemas que necesitan atención');
        
        if (users.length === 0) {
            console.log('   - No hay usuarios en la base de datos');
            console.log('   - Ejecuta: npx tsx scripts/seed-admin.ts');
        }
        
        if (!allGood) {
            console.log('   - Variables de entorno faltantes o incorrectas');
            console.log('   - Verifica el archivo .env');
        }
    }

    console.log('\n🔧 COMANDOS PARA SOLUCIONAR:');
    console.log('   1. Verificar servidor corriendo: npm run dev');
    console.log('   2. Crear usuarios: npx tsx scripts/seed-admin.ts');
    console.log('   3. Crear tokens: npx tsx scripts/create-permanent-tokens.ts');
    console.log('   4. Probar link: curl -v "http://localhost:3000/api/auth/callback/email?token=..."');
}

diagnoseAndFix()
    .catch(console.error)
    .finally(() => prisma.$disconnect());