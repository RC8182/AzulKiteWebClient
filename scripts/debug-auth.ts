/**
 * Script de debug para autenticación NextAuth
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugAuth() {
    console.log('🔍 Debug de autenticación NextAuth\n');

    // 1. Verificar usuarios en DB
    console.log('📊 Usuarios en base de datos:');
    const users = await prisma.user.findMany();
    users.forEach(user => {
        console.log(`  - ${user.email} (${user.name}) - Rol: ${user.role} - Verificado: ${user.emailVerified ? 'Sí' : 'No'}`);
    });

    // 2. Verificar tablas de NextAuth
    console.log('\n🔐 Tablas de NextAuth:');
    
    try {
        const accounts = await prisma.account.findMany();
        console.log(`  - Accounts: ${accounts.length} registros`);
    } catch (e) {
        console.log('  - Accounts: Tabla no encontrada o error');
    }

    try {
        const sessions = await prisma.session.findMany();
        console.log(`  - Sessions: ${sessions.length} registros`);
    } catch (e) {
        console.log('  - Sessions: Tabla no encontrada o error');
    }

    try {
        const verificationTokens = await prisma.verificationToken.findMany();
        console.log(`  - VerificationTokens: ${verificationTokens.length} registros`);
    } catch (e) {
        console.log('  - VerificationTokens: Tabla no encontrada o error');
    }

    // 3. Verificar variables de entorno
    console.log('\n🌍 Variables de entorno NextAuth:');
    const envVars = [
        'NEXTAUTH_URL',
        'NEXTAUTH_SECRET',
        'EMAIL_SERVER_HOST',
        'EMAIL_SERVER_PORT',
        'NODE_ENV'
    ];
    
    envVars.forEach(varName => {
        const value = process.env[varName];
        console.log(`  - ${varName}: ${value || 'NO DEFINIDA'}`);
    });

    // 4. Generar URL de prueba
    console.log('\n🔗 URLs de prueba:');
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    console.log(`  - Base URL: ${baseUrl}`);
    console.log(`  - SignIn: ${baseUrl}/auth/signin`);
    console.log(`  - API Auth: ${baseUrl}/api/auth`);
    
    // 5. Problemas comunes
    console.log('\n⚠️  Problemas comunes:');
    console.log('  1. NEXTAUTH_SECRET no definida o incorrecta');
    console.log('  2. Prisma adapter no configurado correctamente');
    console.log('  3. Tablas de NextAuth no creadas (migraciones pendientes)');
    console.log('  4. Email provider requiere SMTP real en producción');
    console.log('  5. Magic links requieren tokens válidos de VerificationToken');

    console.log('\n🔧 Solución rápida para desarrollo:');
    console.log('  1. Ejecutar: npx prisma db push');
    console.log('  2. Verificar que NEXTAUTH_SECRET esté en .env');
    console.log('  3. Usar credenciales dummy para SMTP en desarrollo');
}

debugAuth()
    .catch(console.error)
    .finally(() => prisma.$disconnect());