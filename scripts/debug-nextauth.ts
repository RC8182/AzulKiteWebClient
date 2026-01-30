/**
 * Debug profundo de NextAuth
 * Verifica problemas específicos del adapter Prisma
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deepDebugNextAuth() {
    console.log('🔍 DEBUG PROFUNDO NEXT-AUTH\n');

    // 1. Verificar estructura exacta de VerificationToken
    console.log('1. 🏗️ Estructura de VerificationToken:');
    const tokenStructure = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'verification_tokens'
        ORDER BY ordinal_position;
    `;
    
    console.log('   Columnas de verification_tokens:');
    (tokenStructure as any[]).forEach((col: any) => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // 2. Verificar datos exactos en VerificationToken
    console.log('\n2. 📊 Datos exactos en VerificationToken:');
    const tokens = await prisma.verificationToken.findMany();
    
    tokens.forEach((token, i) => {
        console.log(`\n   Token ${i + 1}:`);
        console.log(`   - identifier: "${token.identifier}"`);
        console.log(`   - token: "${token.token}" (${token.token.length} chars)`);
        console.log(`   - expires: ${token.expires.toISOString()}`);
        console.log(`   - expires (local): ${token.expires.toLocaleString()}`);
        
        // Verificar formato del token
        const isHex = /^[0-9a-f]+$/i.test(token.token);
        console.log(`   - formato token: ${isHex ? '✅ Hexadecimal' : '⚠️  No hexadecimal'}`);
        
        // Verificar expiración
        const now = new Date();
        const isExpired = token.expires < now;
        console.log(`   - estado: ${isExpired ? '❌ EXPIRADO' : '✅ VÁLIDO'}`);
        console.log(`   - tiempo restante: ${Math.ceil((token.expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} días`);
    });

    // 3. Verificar problema común: token demasiado largo
    console.log('\n3. ⚠️ Problemas comunes detectados:');
    
    const maxTokenLength = 255; // Típico límite para VARCHAR
    tokens.forEach(token => {
        if (token.token.length > maxTokenLength) {
            console.log(`   ❌ Token demasiado largo: ${token.token.length} chars (máx: ${maxTokenLength})`);
            console.log(`      Email: ${token.identifier}`);
            console.log(`      Token: ${token.token.substring(0, 50)}...`);
        }
    });

    // 4. Crear token con formato correcto (32 chars hex)
    console.log('\n4. 🛠️ Creando token con formato correcto:');
    
    const testEmail = 'admin@azulkite.com';
    
    // Eliminar tokens existentes para este email
    await prisma.verificationToken.deleteMany({
        where: { identifier: testEmail }
    });
    
    // Crear token de 32 caracteres hexadecimales
    const crypto = require('crypto');
    const correctToken = crypto.randomBytes(16).toString('hex'); // 32 chars
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    
    await prisma.verificationToken.create({
        data: {
            identifier: testEmail,
            token: correctToken,
            expires,
        }
    });
    
    console.log(`   ✅ Token creado para ${testEmail}:`);
    console.log(`      Token: ${correctToken} (${correctToken.length} chars)`);
    console.log(`      Formato: ${/^[0-9a-f]{32}$/i.test(correctToken) ? '✅ Hexadecimal 32 chars' : '⚠️  Formato incorrecto'}`);
    console.log(`      Expira: ${expires.toLocaleDateString()}`);
    
    const magicLink = `http://localhost:3000/api/auth/callback/email?token=${correctToken}&email=${encodeURIComponent(testEmail)}`;
    console.log(`      🔗 Magic Link: ${magicLink}`);

    // 5. Verificar configuración NextAuth en runtime
    console.log('\n5. ⚙️ Configuración NextAuth en runtime:');
    
    // Intentar importar y verificar auth config
    try {
        const { auth } = require('@/lib/auth');
        console.log('   ✅ Módulo auth cargado correctamente');
        
        // Verificar adapter
        const authConfig = (auth as any).__NEXTAUTH;
        if (authConfig?.adapter) {
            console.log('   ✅ Adapter configurado');
        } else {
            console.log('   ❌ Adapter NO configurado');
        }
    } catch (error: any) {
        console.log(`   ❌ Error cargando auth: ${error.message}`);
    }

    // 6. Probar query directa que NextAuth usaría
    console.log('\n6. 🧪 Probando query que NextAuth ejecutaría:');
    
    try {
        const testToken = correctToken;
        const testIdentifier = testEmail;
        
        const result = await prisma.verificationToken.findUnique({
            where: {
                identifier_token: {
                    identifier: testIdentifier,
                    token: testToken
                }
            }
        });
        
        if (result) {
            console.log(`   ✅ Query exitosa - Token encontrado`);
            console.log(`      Expira: ${result.expires.toLocaleString()}`);
            
            // Verificar que no esté expirado
            if (result.expires < new Date()) {
                console.log(`   ⚠️  Token encontrado pero EXPIRADO`);
            } else {
                console.log(`   ✅ Token VÁLIDO y NO expirado`);
            }
        } else {
            console.log(`   ❌ Query exitosa pero token NO encontrado`);
            console.log(`      Esto podría ser el problema - NextAuth no encuentra el token`);
        }
    } catch (error: any) {
        console.log(`   ❌ Error en query: ${error.message}`);
        console.log(`      Posible problema con el schema de Prisma`);
    }

    // 7. Recomendaciones
    console.log('\n📋 RECOMENDACIONES:');
    console.log('   1. Los tokens deben ser exactamente 32 caracteres hexadecimales');
    console.log('   2. Verificar que Prisma Client esté generado correctamente');
    console.log('   3. Reiniciar servidor después de cambios en auth.ts');
    console.log('   4. Usar el nuevo token creado arriba (32 chars hex)');
    
    console.log('\n🔗 LINK DE PRUEBA RECOMENDADO:');
    console.log(`   ${magicLink}`);
    
    console.log('\n🔧 COMANDO PARA PROBAR:');
    console.log(`   curl -v "${magicLink}"`);
}

deepDebugNextAuth()
    .catch(console.error)
    .finally(() => prisma.$disconnect());