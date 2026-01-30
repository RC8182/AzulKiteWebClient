/**
 * Test final - crear token y usuario desde cero
 */

import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

async function finalTest() {
    console.log('🎯 TEST FINAL - CREAR TODO DESDE CERO\n');

    // 1. Limpiar todo
    console.log('1. 🧹 Limpiando datos anteriores...');
    
    await prisma.verificationToken.deleteMany({
        where: {
            identifier: {
                contains: '@azulkite.com'
            }
        }
    });
    
    console.log('   ✅ Tokens eliminados');

    // 2. Crear usuario admin si no existe
    console.log('\n2. 👤 Creando usuario admin...');
    
    const adminEmail = 'admin@azulkite.com';
    
    let adminUser = await prisma.user.findUnique({
        where: { email: adminEmail }
    });
    
    if (!adminUser) {
        adminUser = await prisma.user.create({
            data: {
                email: adminEmail,
                name: 'Super Admin',
                role: 'ADMIN',
                emailVerified: new Date(),
            }
        });
        console.log('   ✅ Usuario admin creado');
    } else {
        console.log('   ✅ Usuario admin ya existe');
    }

    // 3. Crear token EXACTO como NextAuth lo espera
    console.log('\n3. 🔑 Creando token NextAuth compatible...');
    
    // Token de 32 caracteres hexadecimales (como NextAuth genera)
    const token = createHash('sha256')
        .update(`${adminEmail}-${Date.now()}-${Math.random()}`)
        .digest('hex')
        .slice(0, 32); // Exactamente 32 chars
    
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30 días
    
    await prisma.verificationToken.create({
        data: {
            identifier: adminEmail,
            token: token,
            expires: expires,
        }
    });
    
    console.log('   ✅ Token creado:');
    console.log(`      Email: ${adminEmail}`);
    console.log(`      Token: ${token} (${token.length} chars)`);
    console.log(`      Formato: ${/^[0-9a-f]{32}$/i.test(token) ? '✅ Hexadecimal 32 chars' : '❌ Formato incorrecto'}`);
    console.log(`      Expira: ${expires.toLocaleDateString()}`);

    // 4. Verificar en DB
    console.log('\n4. 🗄️ Verificando en base de datos...');
    
    const dbToken = await prisma.verificationToken.findUnique({
        where: {
            identifier_token: {
                identifier: adminEmail,
                token: token
            }
        }
    });
    
    if (dbToken) {
        console.log('   ✅ Token encontrado en DB');
        console.log(`      DB Token: ${dbToken.token.substring(0, 16)}...`);
        console.log(`      DB Expira: ${dbToken.expires.toLocaleString()}`);
    } else {
        console.log('   ❌ Token NO encontrado en DB');
        console.log('   Esto es el PROBLEMA - NextAuth no lo encuentra');
    }

    // 5. Generar URLs de prueba
    console.log('\n5. 🔗 Generando URLs de prueba...');
    
    // URL 1: Sin encoding (puede fallar)
    const url1 = `http://localhost:3000/api/auth/callback/email?token=${token}&email=${adminEmail}`;
    
    // URL 2: Con encoding (correcto)
    const url2 = `http://localhost:3000/api/auth/callback/email?token=${token}&email=${encodeURIComponent(adminEmail)}`;
    
    // URL 3: Con encoding y parámetros en orden diferente
    const url3 = `http://localhost:3000/api/auth/callback/email?email=${encodeURIComponent(adminEmail)}&token=${token}`;
    
    console.log('   URL 1 (sin encoding - puede fallar):');
    console.log(`      ${url1}`);
    
    console.log('\n   URL 2 (con encoding - recomendada):');
    console.log(`      ${url2}`);
    
    console.log('\n   URL 3 (orden diferente):');
    console.log(`      ${url3}`);

    // 6. Probar manualmente la query que NextAuth haría
    console.log('\n6. 🧪 Probando query manual...');
    
    try {
        // Esta es la query EXACTA que NextAuth ejecuta
        const queryResult = await prisma.$queryRaw`
            SELECT * FROM verification_tokens 
            WHERE identifier = ${adminEmail} 
            AND token = ${token}
        `;
        
        if (Array.isArray(queryResult) && queryResult.length > 0) {
            console.log('   ✅ Query RAW exitosa - Token encontrado');
            const found = queryResult[0] as any;
            console.log(`      Token: ${found.token.substring(0, 16)}...`);
            console.log(`      Expira: ${new Date(found.expires).toLocaleString()}`);
        } else {
            console.log('   ❌ Query RAW: Token NO encontrado');
        }
    } catch (error: any) {
        console.log('   ❌ Error en query RAW:', error.message);
    }

    // 7. Verificar configuración del servidor
    console.log('\n7. ⚙️ Verificando servidor...');
    
    console.log('   Servidor debe estar corriendo en: http://localhost:3000');
    console.log('   NEXTAUTH_URL en .env debe ser: http://localhost:3000');
    console.log('   NODE_ENV debe ser: development');
    
    const currentEnv = {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'DEFINIDO' : 'NO DEFINIDO'
    };
    
    console.log('   Valores actuales:');
    console.log(`      NEXTAUTH_URL: ${currentEnv.NEXTAUTH_URL}`);
    console.log(`      NODE_ENV: ${currentEnv.NODE_ENV}`);
    console.log(`      NEXTAUTH_SECRET: ${currentEnv.NEXTAUTH_SECRET}`);

    // 8. Instrucciones finales
    console.log('\n📋 INSTRUCCIONES FINALES:');
    console.log('   1. Copia la URL 2 de arriba');
    console.log('   2. Pégalo en el navegador');
    console.log('   3. Deberías ser redirigido a la página principal');
    console.log('   4. Si ves error, revisa la consola del servidor');
    
    console.log('\n🔧 PARA DEBUG:');
    console.log('   - Abre DevTools en el navegador');
    console.log('   - Ve a la pestaña Network');
    console.log('   - Haz clic en el magic link');
    console.log('   - Revisa la respuesta del servidor');
    
    console.log('\n⚠️  SI PERSISTE EL ERROR:');
    console.log('   1. Revisa la consola donde corre "npm run dev"');
    console.log('   2. Busca errores relacionados con NextAuth');
    console.log('   3. Verifica que Prisma Client esté generado');
    console.log('   4. Intenta con un navegador en modo incógnito');
    
    console.log('\n🎯 URL RECOMENDADA PARA PROBAR:');
    console.log(`   ${url2}`);
    
    // Guardar referencia
    const fs = require('fs');
    const reference = {
        testTime: new Date().toISOString(),
        user: {
            email: adminEmail,
            name: adminUser.name,
            role: adminUser.role
        },
        token: token,
        urls: {
            withEncoding: url2,
            withoutEncoding: url1,
            differentOrder: url3
        },
        expires: expires.toISOString()
    };
    
    fs.writeFileSync(
        'auth-test-reference.json',
        JSON.stringify(reference, null, 2)
    );
    
    console.log('\n📄 Referencia guardada en: auth-test-reference.json');
}

finalTest()
    .catch(console.error)
    .finally(() => prisma.$disconnect());