/**
 * Test directo del adapter Prisma de NextAuth
 * Simula exactamente lo que NextAuth hace internamente
 */

import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@auth/prisma-adapter';

const prisma = new PrismaClient();

async function testNextAuthAdapter() {
    console.log('🧪 TEST DIRECTO ADAPTER NEXT-AUTH\n');

    // Crear adapter igual que en auth.ts
    const adapter = PrismaAdapter(prisma);
    
    if (!adapter) {
        console.log('❌ No se pudo crear el adapter');
        return;
    }

    console.log('✅ Adapter creado');
    console.log('   Tipo:', typeof adapter);
    
    // Verificar métodos del adapter
    const methods = Object.keys(adapter);
    console.log('   Métodos disponibles:', methods.join(', '));

    // Test 1: Verificar método createVerificationToken
    console.log('\n1. 🔍 Probando createVerificationToken...');
    
    const testEmail = 'test-adapter@azulkite.com';
    const testToken = 'testtoken123456789012345678901234567890';
    const testExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 día
    
    try {
        // Usar el adapter directamente
        const result = await (adapter as any).createVerificationToken?.({
            identifier: testEmail,
            token: testToken,
            expires: testExpires,
        });
        
        console.log('   ✅ createVerificationToken funcionó');
        console.log('   Resultado:', result);
        
        // Verificar que se creó en DB
        const dbToken = await prisma.verificationToken.findUnique({
            where: {
                identifier_token: {
                    identifier: testEmail,
                    token: testToken
                }
            }
        });
        
        if (dbToken) {
            console.log('   ✅ Token creado en DB correctamente');
            console.log('   DB Token:', dbToken);
        } else {
            console.log('   ❌ Token NO creado en DB');
        }
    } catch (error: any) {
        console.log('   ❌ Error en createVerificationToken:', error.message);
        console.log('   Stack:', error.stack);
    }

    // Test 2: Verificar método useVerificationToken
    console.log('\n2. 🔍 Probando useVerificationToken...');
    
    try {
        const usedToken = await (adapter as any).useVerificationToken?.({
            identifier: testEmail,
            token: testToken,
        });
        
        if (usedToken) {
            console.log('   ✅ useVerificationToken funcionó');
            console.log('   Token usado:', usedToken);
            
            // Verificar que se eliminó de DB
            const deletedToken = await prisma.verificationToken.findUnique({
                where: {
                    identifier_token: {
                        identifier: testEmail,
                        token: testToken
                    }
                }
            });
            
            if (!deletedToken) {
                console.log('   ✅ Token eliminado de DB correctamente');
            } else {
                console.log('   ❌ Token NO eliminado de DB');
            }
        } else {
            console.log('   ❌ useVerificationToken no devolvió token');
        }
    } catch (error: any) {
        console.log('   ❌ Error en useVerificationToken:', error.message);
    }

    // Test 3: Simular flujo completo de NextAuth
    console.log('\n3. 🔄 Simulando flujo completo NextAuth...');
    
    // Crear usuario de prueba
    const testUserEmail = 'nextauth-test@azulkite.com';
    
    // Limpiar usuario existente
    await prisma.user.deleteMany({
        where: { email: testUserEmail }
    });
    
    // Crear usuario
    const testUser = await prisma.user.create({
        data: {
            email: testUserEmail,
            name: 'NextAuth Test User',
            emailVerified: new Date(),
            role: 'USER',
        }
    });
    
    console.log('   ✅ Usuario creado:', testUser.email);
    
    // Crear token de verificación
    const verificationToken = 'verification-token-123456789012345678901234567890';
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await prisma.verificationToken.create({
        data: {
            identifier: testUserEmail,
            token: verificationToken,
            expires: verificationExpires,
        }
    });
    
    console.log('   ✅ Token de verificación creado');
    
    // Simular lo que hace NextAuth al recibir magic link
    console.log('\n4. 🎯 Simulando callback de magic link...');
    
    // Paso 1: Buscar token
    const foundToken = await prisma.verificationToken.findUnique({
        where: {
            identifier_token: {
                identifier: testUserEmail,
                token: verificationToken
            }
        }
    });
    
    if (!foundToken) {
        console.log('   ❌ Token no encontrado (esto es el problema!)');
        console.log('   Posibles causas:');
        console.log('     - Token no existe en DB');
        console.log('     - Email/token no coinciden exactamente');
        console.log('     - Problema con el schema de Prisma');
    } else {
        console.log('   ✅ Token encontrado en DB');
        console.log('   Token DB:', {
            identifier: foundToken.identifier,
            token: foundToken.token,
            expires: foundToken.expires,
            isExpired: foundToken.expires < new Date()
        });
        
        // Paso 2: Verificar expiración
        if (foundToken.expires < new Date()) {
            console.log('   ❌ Token expirado');
        } else {
            console.log('   ✅ Token válido (no expirado)');
            
            // Paso 3: Buscar usuario
            const userForToken = await prisma.user.findUnique({
                where: { email: foundToken.identifier }
            });
            
            if (!userForToken) {
                console.log('   ❌ Usuario no encontrado para este token');
            } else {
                console.log('   ✅ Usuario encontrado:', userForToken.email);
                
                // Paso 4: Crear sesión (lo que haría NextAuth)
                const sessionToken = 'session-token-' + Date.now();
                const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
                
                const session = await prisma.session.create({
                    data: {
                        sessionToken,
                        userId: userForToken.id,
                        expires: sessionExpires,
                    }
                });
                
                console.log('   ✅ Sesión creada:', session.sessionToken);
                console.log('   🎉 FLUJO COMPLETO SIMULADO CON ÉXITO');
                
                // Paso 5: Limpiar token usado
                await prisma.verificationToken.delete({
                    where: {
                        identifier_token: {
                            identifier: foundToken.identifier,
                            token: foundToken.token
                        }
                    }
                });
                console.log('   ✅ Token eliminado después de uso');
            }
        }
    }

    // Test 5: Verificar problema específico con URLs
    console.log('\n5. 🔗 Analizando URLs de magic links...');
    
    const sampleToken = '61a645854db7c0a34a69423f225462f7';
    const sampleEmail = 'admin@azulkite.com';
    
    // URL que estamos usando
    const currentUrl = `http://localhost:3000/api/auth/callback/email?token=${sampleToken}&email=${sampleEmail}`;
    console.log('   URL actual:', currentUrl);
    
    // URL que NextAuth espera (según documentación)
    const expectedUrl = `http://localhost:3000/api/auth/callback/email?token=${sampleToken}&email=${encodeURIComponent(sampleEmail)}`;
    console.log('   URL esperada (encoded):', expectedUrl);
    
    // Diferencia
    console.log('   Diferencia: email encoding');
    console.log('   Actual email:', sampleEmail);
    console.log('   Encoded email:', encodeURIComponent(sampleEmail));
    
    // Probar ambas
    console.log('\n   Probando con email sin encoding...');
    const url1 = `http://localhost:3000/api/auth/callback/email?token=${sampleToken}&email=${sampleEmail}`;
    console.log('   URL 1:', url1);
    
    console.log('\n   Probando con email encoded...');
    const url2 = `http://localhost:3000/api/auth/callback/email?token=${sampleToken}&email=${encodeURIComponent(sampleEmail)}`;
    console.log('   URL 2:', url2);

    // Limpiar
    await prisma.user.deleteMany({
        where: { email: testUserEmail }
    });
    
    console.log('\n📋 CONCLUSIÓN:');
    console.log('   Si el adapter funciona pero los links no, el problema puede ser:');
    console.log('   1. Email no encoded en URL (@ se interpreta mal)');
    console.log('   2. NextAuth no está recibiendo los parámetros correctamente');
    console.log('   3. Hay un middleware interceptando las requests');
    console.log('   4. El servidor necesita reinicio después de cambios');
    
    console.log('\n🔧 PRUEBA FINAL:');
    console.log('   Usar esta URL (con email encoded):');
    console.log(`   ${url2}`);
}

testNextAuthAdapter()
    .catch(console.error)
    .finally(() => prisma.$disconnect());