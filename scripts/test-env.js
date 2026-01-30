const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.join(process.cwd(), '.env');
console.log('📂 Buscando .env en:', envPath);
console.log('📄 Existe?', fs.existsSync(envPath));

const result = dotenv.config({ path: envPath });
console.log('💉 Resultado dotenv:', result.error ? 'Error' : 'OK');
console.log('📋 Variables cargadas (keys):', Object.keys(result.parsed || {}));
console.log('🔐 NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'ENCONTRADO' : 'NOT FOUND');
console.log('🔐 AUTH_SECRET:', process.env.AUTH_SECRET ? 'ENCONTRADO' : 'NOT FOUND');
