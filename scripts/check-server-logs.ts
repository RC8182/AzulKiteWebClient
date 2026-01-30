/**
 * Script para verificar logs del servidor Next.js
 * y problemas de configuración
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkServerLogs() {
    console.log('📋 VERIFICANDO CONFIGURACIÓN DEL SERVIDOR\n');

    // 1. Verificar procesos en ejecución
    console.log('1. 🔍 Procesos Node.js en ejecución:');
    try {
        const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq node.exe"');
        const lines = stdout.split('\n').filter(line => line.includes('node.exe'));
        
        if (lines.length > 0) {
            console.log(`   ✅ ${lines.length} proceso(s) Node.js encontrado(s):`);
            lines.forEach(line => {
                const parts = line.trim().split(/\s+/);
                const pid = parts[1];
                const memory = parts[4];
                console.log(`      PID: ${pid}, Memoria: ${memory}`);
            });
        } else {
            console.log('   ❌ No hay procesos Node.js en ejecución');
            console.log('   Ejecuta: cd client && npm run dev');
        }
    } catch (error) {
        console.log('   ⚠️  No se pudo verificar procesos');
    }

    // 2. Verificar puertos
    console.log('\n2. 🔌 Puertos en uso:');
    const ports = [3000, 3001, 5555];
    
    for (const port of ports) {
        try {
            const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
            if (stdout.trim()) {
                const lines = stdout.trim().split('\n');
                console.log(`   ⚠️  Puerto ${port} en uso:`);
                lines.forEach(line => {
                    console.log(`      ${line.trim()}`);
                });
            } else {
                console.log(`   ✅ Puerto ${port} disponible`);
            }
        } catch (error) {
            console.log(`   ✅ Puerto ${port} disponible (no encontrado)`);
        }
    }

    // 3. Verificar archivos de configuración
    console.log('\n3. 📁 Archivos de configuración:');
    
    const fs = require('fs');
    const path = require('path');
    
    const configFiles = [
        '.env',
        'next.config.js',
        'next.config.mjs',
        'package.json',
        'src/lib/auth.ts',
        'src/app/api/auth/[...nextauth]/route.ts'
    ];
    
    configFiles.forEach(file => {
        const fullPath = path.join(process.cwd(), file);
        const exists = fs.existsSync(fullPath);
        console.log(`   ${exists ? '✅' : '❌'} ${file}`);
        
        if (exists && file === '.env') {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                const hasNextAuthUrl = content.includes('NEXTAUTH_URL');
                const hasNextAuthSecret = content.includes('NEXTAUTH_SECRET');
                console.log(`      NEXTAUTH_URL: ${hasNextAuthUrl ? '✅' : '❌'}`);
                console.log(`      NEXTAUTH_SECRET: ${hasNextAuthSecret ? '✅' : '❌'}`);
            } catch (error) {
                console.log(`      ⚠️  No se pudo leer`);
            }
        }
    });

    // 4. Verificar logs de aplicación
    console.log('\n4. 📝 Últimos logs de la aplicación:');
    
    const logFiles = [
        '.next/server/server-reference-manifest.json',
        '.next/build-manifest.json',
        '.next/static/chunks'
    ];
    
    logFiles.forEach(file => {
        const fullPath = path.join(process.cwd(), file);
        const exists = fs.existsSync(fullPath);
        console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    });

    // 5. Verificar si hay errores en la compilación
    console.log('\n5. 🚨 Errores de compilación:');
    
    const errorFiles = [
        '.next/error.log',
        '.next/build-error.log'
    ];
    
    let hasErrors = false;
    errorFiles.forEach(file => {
        const fullPath = path.join(process.cwd(), file);
        if (fs.existsSync(fullPath)) {
            console.log(`   ⚠️  Archivo de error encontrado: ${file}`);
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.trim()) {
                    console.log(`   Contenido (primeras líneas):`);
                    content.split('\n').slice(0, 5).forEach(line => {
                        if (line.trim()) console.log(`      ${line.trim()}`);
                    });
                    hasErrors = true;
                }
            } catch (error) {
                console.log(`      ⚠️  No se pudo leer`);
            }
        }
    });
    
    if (!hasErrors) {
        console.log('   ✅ No se encontraron archivos de error');
    }

    // 6. Recomendaciones
    console.log('\n📋 RECOMENDACIONES:');
    
    if (hasErrors) {
        console.log('   1. ❌ Hay errores de compilación - revisa logs arriba');
        console.log('   2. Ejecuta: cd client && rm -rf .next && npm run dev');
    } else {
        console.log('   1. ✅ No hay errores de compilación aparentes');
    }
    
    console.log('   2. Verifica que el servidor esté corriendo en el puerto correcto');
    console.log('   3. Revisa que NEXTAUTH_URL en .env sea http://localhost:3000');
    console.log('   4. Si persiste, reinicia completamente:');
    console.log('      a. taskkill /F /IM node.exe');
    console.log('      b. cd client && rm -rf .next node_modules/.cache');
    console.log('      c. npm run dev');
    
    console.log('\n🔧 COMANDOS PARA DIAGNÓSTICO:');
    console.log('   # Ver logs en tiempo real (si el servidor está corriendo)');
    console.log('   # Los logs deberían mostrar errores de NextAuth si los hay');
    
    console.log('\n⚠️  PROBLEMA CONOCIDO:');
    console.log('   NextAuth a veces necesita reinicio completo después de cambios');
    console.log('   en auth.ts o variables de entorno');
}

checkServerLogs()
    .catch(console.error);