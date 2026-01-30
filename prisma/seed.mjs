import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log('🚀 Starting Full Database Seed...');

    try {
        // 1. Categories (Must be first for hierarchy)
        console.log('\n--- Seeding Categories ---');
        execSync('node prisma/seed-categories.mjs', { stdio: 'inherit' });

        // 2. Pages
        console.log('\n--- Seeding Pages ---');
        execSync('node prisma/seed-pages.mjs', { stdio: 'inherit' });

        // 3. Admin Users (Typescript)
        console.log('\n--- Seeding Admin Users ---');
        // Usar npx tsx para ejecutar archivos TS directamente si está disponible
        execSync('npx tsx scripts/seed-admin.ts', { stdio: 'inherit' });

        console.log('\n✅ Database seeded successfully!');
    } catch (error) {
        console.error('\n❌ Seed failed:', error.message);
        process.exit(1);
    }
}

main();
