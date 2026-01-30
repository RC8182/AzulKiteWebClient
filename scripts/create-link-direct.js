const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Cargar env
dotenv.config({ path: path.join(__dirname, '../.env') });

const secret = process.env.NEXTAUTH_SECRET;
if (!secret) {
    console.error('❌ NEXTAUTH_SECRET NOT FOUND');
    process.exit(1);
}

const prisma = new PrismaClient();

async function createHash(message) {
    return crypto.createHash('sha256').update(message).digest('hex');
}

async function main() {
    const email = 'admin@azulkite.com';
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = await createHash(`${token}${secret}`);
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    console.log('--- DEBUG INFO ---');
    console.log('Email:', email);
    console.log('Token Plano:', token);
    console.log('Secret (last 3):', secret.substring(secret.length - 3));
    console.log('Hashed Token:', hashedToken);

    try {
        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: hashedToken,
                expires
            }
        });

        const magicLink = `http://localhost:3000/api/auth/callback/email?token=${token}&email=${encodeURIComponent(email)}`;
        fs.writeFileSync('generated-link.txt', magicLink);
        console.log('\n✅ TOKEN CREADO EN DB');
        console.log('🔗 MAGIC LINK GUARDADO EN generated-link.txt');
    } catch (e) {
        console.error('❌ Error Prisma:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
